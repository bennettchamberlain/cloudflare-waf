from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import os
from dotenv import load_dotenv
import logging
from datetime import datetime, timedelta
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Cloudflare WAF Manager API",
    description="API for managing Cloudflare WAF rules for Webflow sites",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],  # Add your frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models
class DomainVerification(BaseModel):
    domain: str
    verification_method: str  # "dns" or "meta"

class CloudflareConnection(BaseModel):
    api_token: str
    account_id: Optional[str] = None

class WAFRuleTemplate(BaseModel):
    template_id: str
    enabled: bool
    custom_settings: Optional[Dict[str, Any]] = None

class AnalyticsRequest(BaseModel):
    domain: str
    date_range: int  # days

# In-memory storage (replace with database in production)
user_domains = {}
cloudflare_connections = {}
active_waf_rules = {}

# Cloudflare API client
class CloudflareClient:
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.base_url = "https://api.cloudflare.com/client/v4"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
    
    async def get_zones(self):
        """Get all zones for the account"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/zones",
                headers=self.headers
            )
            return response.json()
    
    async def get_zone_by_name(self, domain: str):
        """Get zone by domain name"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/zones",
                headers=self.headers,
                params={"name": domain}
            )
            data = response.json()
            if data["success"] and data["result"]:
                return data["result"][0]
            return None
    
    async def create_waf_rule(self, zone_id: str, rule_data: dict):
        """Create a WAF rule"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/zones/{zone_id}/firewall/rules",
                headers=self.headers,
                json=rule_data
            )
            return response.json()
    
    async def get_analytics(self, zone_id: str, since: datetime):
        """Get analytics for a zone"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/zones/{zone_id}/analytics/dashboard",
                headers=self.headers,
                params={
                    "since": since.isoformat(),
                    "until": datetime.now().isoformat()
                }
            )
            return response.json()

# WAF Rule Templates
WAF_TEMPLATES = {
    "block_scrapers": {
        "name": "Block Common Scrapers",
        "description": "Blocks known scraping bots and automated tools",
        "action": "block",
        "expression": '(http.user_agent contains "scrapy") or (http.user_agent contains "python-requests") or (http.user_agent contains "curl") or (http.user_agent contains "wget")',
    },
    "rate_limit_aggressive": {
        "name": "Aggressive Rate Limiting",
        "description": "Limits requests to 10 per minute per IP",
        "action": "challenge",
        "expression": "(rate(1m) > 10)",
    },
    "geo_block_suspicious": {
        "name": "Block Suspicious Countries",
        "description": "Blocks traffic from high-risk countries",
        "action": "block",
        "expression": "(ip.geoip.country in {\"CN\" \"RU\" \"KP\"})",
    },
    "sql_injection_protection": {
        "name": "SQL Injection Protection",
        "description": "Blocks common SQL injection attempts",
        "action": "block",
        "expression": "(http.request.uri.query contains \"union select\") or (http.request.uri.query contains \"drop table\") or (http.request.uri.query contains \"insert into\")",
    },
    "xss_protection": {
        "name": "XSS Protection",
        "description": "Blocks cross-site scripting attempts",
        "action": "block",
        "expression": "(http.request.uri.query contains \"<script\") or (http.request.uri.query contains \"javascript:\") or (http.request.uri.query contains \"onload=\")",
    }
}

# Helper functions
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Simplified auth - replace with proper JWT validation
    token = credentials.credentials
    if token != "demo-token":  # Replace with actual validation
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": "demo_user", "email": "demo@example.com"}

# API Routes

@app.get("/")
async def root():
    return {"message": "Cloudflare WAF Manager API", "version": "1.0.0"}

@app.get("/templates")
async def get_waf_templates():
    """Get all available WAF rule templates"""
    return {"templates": WAF_TEMPLATES}

@app.post("/verify-domain")
async def verify_domain(verification: DomainVerification, current_user: dict = Depends(get_current_user)):
    """Verify domain ownership"""
    try:
        domain = verification.domain.lower().strip()
        
        if verification.verification_method == "dns":
            # Generate DNS TXT record for verification
            verification_token = f"cf-waf-{current_user['user_id']}-{domain}"
            verification_record = f"_cf-waf-verification.{domain}"
            
            return {
                "success": True,
                "verification_method": "dns",
                "dns_record": {
                    "type": "TXT",
                    "name": verification_record,
                    "value": verification_token
                },
                "instructions": f"Add a TXT record with name '{verification_record}' and value '{verification_token}' to your DNS"
            }
        
        elif verification.verification_method == "meta":
            # Generate meta tag for verification
            verification_token = f"cf-waf-{current_user['user_id']}-{domain}"
            meta_tag = f'<meta name="cf-waf-verification" content="{verification_token}">'
            
            return {
                "success": True,
                "verification_method": "meta",
                "meta_tag": meta_tag,
                "instructions": f"Add this meta tag to the <head> section of your website: {meta_tag}"
            }
        
        else:
            raise HTTPException(status_code=400, detail="Invalid verification method")
            
    except Exception as e:
        logger.error(f"Domain verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Domain verification failed")

@app.post("/connect-cloudflare")
async def connect_cloudflare(connection: CloudflareConnection, current_user: dict = Depends(get_current_user)):
    """Connect Cloudflare account"""
    try:
        client = CloudflareClient(connection.api_token)
        
        # Test the API token by getting zones
        zones_response = await client.get_zones()
        
        if not zones_response.get("success"):
            raise HTTPException(status_code=400, detail="Invalid Cloudflare API token")
        
        # Store connection (in production, encrypt and store in database)
        cloudflare_connections[current_user["user_id"]] = {
            "api_token": connection.api_token,
            "account_id": connection.account_id,
            "zones": zones_response.get("result", [])
        }
        
        return {
            "success": True,
            "message": "Cloudflare account connected successfully",
            "zones_count": len(zones_response.get("result", []))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cloudflare connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect Cloudflare account")

@app.post("/apply-waf-rule")
async def apply_waf_rule(rule_request: WAFRuleTemplate, current_user: dict = Depends(get_current_user)):
    """Apply a WAF rule template to a domain"""
    try:
        user_id = current_user["user_id"]
        
        # Check if Cloudflare is connected
        if user_id not in cloudflare_connections:
            raise HTTPException(status_code=400, detail="Cloudflare account not connected")
        
        # Get template
        template = WAF_TEMPLATES.get(rule_request.template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        connection = cloudflare_connections[user_id]
        client = CloudflareClient(connection["api_token"])
        
        # For demo purposes, we'll simulate rule creation
        # In production, you'd create actual rules for specific domains
        
        rule_data = {
            "filter": {
                "expression": template["expression"],
                "paused": not rule_request.enabled
            },
            "action": {
                "mode": template["action"]
            },
            "description": template["description"]
        }
        
        # Store active rule (in production, store in database)
        if user_id not in active_waf_rules:
            active_waf_rules[user_id] = {}
        
        active_waf_rules[user_id][rule_request.template_id] = {
            "template": template,
            "enabled": rule_request.enabled,
            "created_at": datetime.now().isoformat(),
            "custom_settings": rule_request.custom_settings
        }
        
        return {
            "success": True,
            "message": f"WAF rule '{template['name']}' {'enabled' if rule_request.enabled else 'disabled'} successfully",
            "rule_id": rule_request.template_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"WAF rule application error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to apply WAF rule")

@app.get("/get-stats")
async def get_stats(domain: str, days: int = 7, current_user: dict = Depends(get_current_user)):
    """Get analytics and statistics for a domain"""
    try:
        user_id = current_user["user_id"]
        
        # Check if Cloudflare is connected
        if user_id not in cloudflare_connections:
            raise HTTPException(status_code=400, detail="Cloudflare account not connected")
        
        connection = cloudflare_connections[user_id]
        client = CloudflareClient(connection["api_token"])
        
        # Get zone for domain
        zone = await client.get_zone_by_name(domain)
        if not zone:
            raise HTTPException(status_code=404, detail="Domain not found in Cloudflare account")
        
        # Get analytics
        since = datetime.now() - timedelta(days=days)
        analytics_response = await client.get_analytics(zone["id"], since)
        
        # Generate mock data for demo (replace with real analytics)
        mock_stats = {
            "domain": domain,
            "period_days": days,
            "total_requests": 125000,
            "blocked_requests": 8500,
            "bandwidth_saved_gb": 12.3,
            "top_blocked_countries": [
                {"country": "China", "requests": 3200},
                {"country": "Russia", "requests": 2100},
                {"country": "Unknown", "requests": 1800}
            ],
            "blocked_by_rule": [
                {"rule": "Block Common Scrapers", "requests": 4200},
                {"rule": "Rate Limiting", "requests": 2800},
                {"rule": "Geo Blocking", "requests": 1500}
            ],
            "daily_stats": [
                {"date": "2024-01-01", "requests": 18000, "blocked": 1200},
                {"date": "2024-01-02", "requests": 17500, "blocked": 1100},
                {"date": "2024-01-03", "requests": 19200, "blocked": 1350},
                {"date": "2024-01-04", "requests": 16800, "blocked": 980},
                {"date": "2024-01-05", "requests": 18900, "blocked": 1280},
                {"date": "2024-01-06", "requests": 17200, "blocked": 1050},
                {"date": "2024-01-07", "requests": 17400, "blocked": 1090}
            ]
        }
        
        return {
            "success": True,
            "stats": mock_stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stats retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")

@app.get("/user/rules")
async def get_user_rules(current_user: dict = Depends(get_current_user)):
    """Get all active WAF rules for the current user"""
    user_id = current_user["user_id"]
    rules = active_waf_rules.get(user_id, {})
    
    return {
        "success": True,
        "rules": rules
    }

@app.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a WAF rule"""
    user_id = current_user["user_id"]
    
    if user_id in active_waf_rules and rule_id in active_waf_rules[user_id]:
        del active_waf_rules[user_id][rule_id]
        return {
            "success": True,
            "message": f"Rule {rule_id} deleted successfully"
        }
    
    raise HTTPException(status_code=404, detail="Rule not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
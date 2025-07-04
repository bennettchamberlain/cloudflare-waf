import { BotDetector } from './bot-detector';
import { AnalyticsCollector } from './analytics';
import { RulesEngine } from './rules-engine';
import { APIRouter } from './api';
import { PlatformDetector } from './platform-detector';

export interface Env {
  ANALYTICS_KV: KVNamespace;
  RULES_KV: KVNamespace;
  USERS_KV: KVNamespace;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (url.pathname.startsWith('/api/')) {
      const apiRouter = new APIRouter(env);
      const response = await apiRouter.handleRequest(request);
      
      // Add CORS headers to API responses
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }

    // Bot protection middleware
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    'unknown';
    
    const userAgent = request.headers.get('User-Agent') || '';
    const cfRay = request.headers.get('CF-Ray') || '';
    const country = request.headers.get('CF-IPCountry') || '';
    
    // Detect platform
    const platformDetector = new PlatformDetector();
    const platform = platformDetector.detectPlatform(request);
    
    // Initialize bot detector
    const botDetector = new BotDetector();
    const botScore = await botDetector.calculateBotScore(request, {
      ip: clientIP,
      userAgent,
      country,
      platform
    });

    // Get rules for this domain
    const rulesEngine = new RulesEngine(env);
    const rules = await rulesEngine.getRules(url.hostname);
    
    // Check if request should be blocked
    const blockDecision = await rulesEngine.shouldBlock(request, botScore, rules);
    
    // Collect analytics
    const analyticsCollector = new AnalyticsCollector(env);
    await analyticsCollector.recordRequest({
      domain: url.hostname,
      ip: clientIP,
      userAgent,
      country,
      platform,
      botScore,
      blocked: blockDecision.blocked,
      rule: blockDecision.rule,
      timestamp: Date.now()
    });

    // Block if necessary
    if (blockDecision.blocked) {
      return new Response('Access Denied', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Bot-Shield': 'blocked',
          'X-Block-Reason': blockDecision.reason
        }
      });
    }

    // Continue to origin
    return fetch(request);
  }
};
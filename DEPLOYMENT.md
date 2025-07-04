# Bot Shield Deployment Guide

This guide walks you through deploying Bot Shield to protect your website from expensive bot traffic.

## Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+ installed
- Domain using Cloudflare DNS (required for Workers)

## Step 1: Cloudflare Setup

### 1.1 Create API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" template
4. Configure permissions:
   - **Zone:Edit** (for your domain)
   - **Zone Settings:Edit** 
   - **Zone:Read**
5. Add zone resource: Include your domain
6. Create and save the token

### 1.2 Create KV Namespaces

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create KV namespaces
wrangler kv:namespace create "ANALYTICS_KV"
wrangler kv:namespace create "RULES_KV" 
wrangler kv:namespace create "USERS_KV"

# Create preview namespaces for development
wrangler kv:namespace create "ANALYTICS_KV" --preview
wrangler kv:namespace create "RULES_KV" --preview
wrangler kv:namespace create "USERS_KV" --preview
```

## Step 2: Backend Deployment

### 2.1 Configure Worker

1. Clone the repository
2. Navigate to workers directory:
```bash
cd workers
npm install
```

3. Update `wrangler.toml` with your KV namespace IDs:
```toml
[[kv_namespaces]]
binding = "ANALYTICS_KV"
id = "your-analytics-kv-id"        # Replace with actual ID
preview_id = "your-preview-id"     # Replace with actual preview ID

[[kv_namespaces]]
binding = "RULES_KV"
id = "your-rules-kv-id"           # Replace with actual ID
preview_id = "your-preview-id"     # Replace with actual preview ID

[[kv_namespaces]]
binding = "USERS_KV"
id = "your-users-kv-id"           # Replace with actual ID
preview_id = "your-preview-id"     # Replace with actual preview ID
```

### 2.2 Deploy Worker

```bash
# Deploy to Cloudflare
wrangler deploy

# Test deployment
curl https://bot-shield-api.your-subdomain.workers.dev/api/health
```

## Step 3: Frontend Deployment

### 3.1 Configure Frontend

```bash
cd frontend
npm install
```

### 3.2 Update API Endpoint

Update the API endpoint in `frontend/src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://bot-shield-api.your-subdomain.workers.dev';
```

### 3.3 Deploy Frontend

#### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

#### Option C: Cloudflare Pages
```bash
wrangler pages project create bot-shield-frontend
wrangler pages deploy dist --project-name=bot-shield-frontend
```

## Step 4: Domain Configuration

### 4.1 Add Custom Domain (Optional)

For the frontend:
1. Go to Workers & Pages in Cloudflare dashboard
2. Select your frontend deployment
3. Go to Custom domains
4. Add your domain (e.g., `botshield.yourdomain.com`)

### 4.2 Configure Worker Route

For the protected domain:
1. Go to your domain's zone in Cloudflare
2. Navigate to Rules → Page Rules or Workers Routes
3. Add route: `yourdomain.com/*`
4. Select your bot-shield worker

## Step 5: Initial Setup

### 5.1 Access Dashboard

1. Open your deployed frontend
2. Select your hosting platform (Webflow, Netlify, Vercel, Shopify)
3. Enter your domain name
4. Complete the deployment wizard

### 5.2 Configure Protection Rules

1. Go to the Rules tab
2. Enable recommended rules for your platform:
   - **Block Common Scrapers** (recommended: ON)
   - **High Bot Score Protection** (recommended: ON)  
   - **Rate Limiting** (recommended: ON)
   - **Geo-blocking** (optional: based on your needs)

## Step 6: Verification

### 6.1 Test Bot Protection

Test with curl (should be blocked):
```bash
curl -A "scrapy/2.5.0" https://yourdomain.com
# Should return 403 Forbidden
```

Test with browser (should work):
```bash
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" https://yourdomain.com
# Should return normal page
```

### 6.2 Monitor Dashboard

1. Check real-time activity feed
2. Verify analytics are collecting
3. Review savings calculations

## Production Optimization

### Environment-Specific Settings

#### Development
```toml
[env.development]
name = "bot-shield-api-dev"
vars = { ENVIRONMENT = "development" }
```

#### Production  
```toml
[env.production]
name = "bot-shield-api-prod"  
vars = { ENVIRONMENT = "production" }
```

### Performance Tuning

1. **Adjust bot score thresholds** based on your traffic
2. **Configure platform-specific rules** for your use case  
3. **Set up alerts** for unusual bot activity
4. **Review and adjust rules** weekly

### Security Considerations

1. **Rotate API tokens** every 90 days
2. **Monitor worker logs** for errors
3. **Set up backup rules** in Cloudflare dashboard
4. **Test protection** regularly

## Troubleshooting

### Common Issues

#### Worker Not Deploying
```bash
# Check Wrangler configuration
wrangler whoami
wrangler dev # Test locally first
```

#### KV Namespace Errors
```bash
# Verify namespace IDs
wrangler kv:namespace list
```

#### Rules Not Working
1. Check worker route is active
2. Verify KV permissions
3. Check browser developer tools for errors

#### Analytics Not Updating
1. Verify KV write permissions
2. Check worker logs in Cloudflare dashboard
3. Ensure domain is properly configured

### Debug Mode

Enable debug logging:
```typescript
// In worker code
console.log('Bot score:', botScore);
console.log('Rule matched:', ruleMatched);
```

View logs:
```bash
wrangler tail
```

## Scaling Considerations

### High Traffic Sites
- Consider upgrading to Cloudflare Workers Paid plan
- Implement request queuing for analytics
- Use Durable Objects for advanced rate limiting

### Multiple Domains
- Deploy separate workers per domain
- Use environment variables for domain-specific config
- Centralize analytics in shared KV namespace

### Enterprise Features
- Custom bot detection algorithms
- Advanced analytics and reporting
- White-label dashboard options
- Priority support

## Maintenance

### Regular Tasks
- Review analytics weekly
- Adjust rules based on new threats  
- Monitor cost savings reports
- Update worker code monthly

### Updates
```bash
# Update worker
cd workers
git pull
wrangler deploy

# Update frontend  
cd frontend
git pull
npm run build
# Redeploy to your platform
```

## Support

- **Documentation**: Check README.md for feature details
- **Issues**: Report bugs on GitHub
- **Community**: Join discussions on GitHub Discussions
- **Enterprise**: Contact for custom deployment assistance

---

🎉 **Congratulations!** Your bot protection is now active and saving you money!
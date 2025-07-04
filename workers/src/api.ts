import { Env } from './index';
import { AnalyticsCollector } from './analytics';
import { RulesEngine } from './rules-engine';
import { PlatformDetector } from './platform-detector';

export class APIRouter {
  constructor(private env: Env) {}

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Route handling
      if (path === '/api/stats' && method === 'GET') {
        return this.getStats(request);
      }
      
      if (path === '/api/rules' && method === 'GET') {
        return this.getRules(request);
      }
      
      if (path === '/api/rules' && method === 'POST') {
        return this.updateRules(request);
      }
      
      if (path === '/api/savings' && method === 'GET') {
        return this.getSavingsReport(request);
      }
      
      if (path === '/api/platforms' && method === 'GET') {
        return this.getPlatforms(request);
      }
      
      if (path === '/api/health' && method === 'GET') {
        return this.getHealth(request);
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('API Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  private async getStats(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');
    const days = parseInt(url.searchParams.get('days') || '7');

    if (!domain) {
      return new Response('Domain parameter required', { status: 400 });
    }

    const analyticsCollector = new AnalyticsCollector(this.env);
    const stats = await analyticsCollector.getStats(domain, days);
    
    // Add platform information
    const platformDetector = new PlatformDetector();
    const mockRequest = new Request(`https://${domain}`);
    const platform = platformDetector.detectPlatform(mockRequest);
    const platformConfig = platformDetector.getPlatformConfig(platform);
    
    stats.platformConfig = platformConfig;

    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async getRules(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');

    if (!domain) {
      return new Response('Domain parameter required', { status: 400 });
    }

    const rulesEngine = new RulesEngine(this.env);
    const rules = await rulesEngine.getRules(domain);

    return new Response(JSON.stringify({ rules }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async updateRules(request: Request): Promise<Response> {
    const body = await request.json();
    const { domain, rules } = body;

    if (!domain || !rules) {
      return new Response('Domain and rules required', { status: 400 });
    }

    const rulesEngine = new RulesEngine(this.env);
    await rulesEngine.saveRules(domain, rules);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async getSavingsReport(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');
    const platform = url.searchParams.get('platform') || 'unknown';

    if (!domain) {
      return new Response('Domain parameter required', { status: 400 });
    }

    const analyticsCollector = new AnalyticsCollector(this.env);
    const report = await analyticsCollector.getSavingsReport(domain, platform);

    return new Response(JSON.stringify(report), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async getPlatforms(request: Request): Promise<Response> {
    const platformDetector = new PlatformDetector();
    const platforms = ['webflow', 'netlify', 'vercel', 'shopify', 'github-pages', 'cloudflare-pages'];
    
    const configs = platforms.map(platform => ({
      id: platform,
      ...platformDetector.getPlatformConfig(platform)
    }));

    return new Response(JSON.stringify({ platforms: configs }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async getHealth(request: Request): Promise<Response> {
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: this.env.ENVIRONMENT
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
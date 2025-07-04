export class PlatformDetector {
  detectPlatform(request: Request): string {
    const url = new URL(request.url);
    const headers = request.headers;
    
    // Check headers for platform indicators
    const serverHeader = headers.get('server')?.toLowerCase() || '';
    const xPoweredBy = headers.get('x-powered-by')?.toLowerCase() || '';
    const xVercel = headers.get('x-vercel-id');
    const xNetlify = headers.get('x-nf-request-id');
    
    // Vercel detection
    if (xVercel || 
        serverHeader.includes('vercel') || 
        url.hostname.includes('vercel.app') ||
        url.hostname.includes('vercel.dev')) {
      return 'vercel';
    }
    
    // Netlify detection
    if (xNetlify ||
        serverHeader.includes('netlify') ||
        url.hostname.includes('netlify.app') ||
        url.hostname.includes('netlify.com')) {
      return 'netlify';
    }
    
    // Webflow detection
    if (serverHeader.includes('webflow') ||
        url.hostname.includes('webflow.io') ||
        url.hostname.includes('webflow.com') ||
        this.isWebflowSite(url.hostname)) {
      return 'webflow';
    }
    
    // Shopify detection
    if (headers.get('x-shopify-shop-id') ||
        headers.get('x-shopify-request-id') ||
        serverHeader.includes('shopify') ||
        url.hostname.includes('shopify.com') ||
        url.hostname.includes('myshopify.com')) {
      return 'shopify';
    }
    
    // GitHub Pages
    if (serverHeader.includes('github') ||
        url.hostname.includes('github.io')) {
      return 'github-pages';
    }
    
    // Cloudflare Pages
    if (headers.get('cf-ray') && 
        (url.hostname.includes('pages.dev') || 
         headers.get('x-served-by')?.includes('cloudflare'))) {
      return 'cloudflare-pages';
    }
    
    // Firebase Hosting
    if (serverHeader.includes('firebase') ||
        url.hostname.includes('firebase.app') ||
        url.hostname.includes('firebaseapp.com')) {
      return 'firebase';
    }
    
    // Squarespace
    if (serverHeader.includes('squarespace') ||
        url.hostname.includes('squarespace.com') ||
        headers.get('x-contextual-id')) {
      return 'squarespace';
    }
    
    // Wix
    if (serverHeader.includes('wix') ||
        url.hostname.includes('wixsite.com') ||
        url.hostname.includes('wix.com')) {
      return 'wix';
    }
    
    return 'unknown';
  }
  
  private isWebflowSite(hostname: string): boolean {
    // Webflow sites often use custom domains
    // This is a simplified check - in production, you'd maintain a database
    // of known Webflow sites or use additional detection methods
    return false;
  }
  
  getPlatformConfig(platform: string) {
    const configs = {
      'webflow': {
        name: 'Webflow',
        costPerGB: 0.20, // Approximate cost per GB
        commonPaths: ['/assets/', '/images/', '.css', '.js'],
        riskyPaths: ['/assets/', '/images/'],
        description: 'Webflow sites are often scraped for design inspiration'
      },
      'netlify': {
        name: 'Netlify',
        costPerGB: 0.20,
        commonPaths: ['/.netlify/functions/', '/api/'],
        riskyPaths: ['/.netlify/functions/'],
        description: 'Netlify functions can be expensive when called by bots'
      },
      'vercel': {
        name: 'Vercel',
        costPerGB: 0.40,
        commonPaths: ['/api/', '/_next/'],
        riskyPaths: ['/api/'],
        description: 'Vercel API routes and edge functions cost per invocation'
      },
      'shopify': {
        name: 'Shopify',
        costPerGB: 0.15,
        commonPaths: ['/products/', '/collections/', '.json'],
        riskyPaths: ['/products/', '/collections/'],
        description: 'Shopify stores are heavily scraped for product data'
      },
      'github-pages': {
        name: 'GitHub Pages',
        costPerGB: 0,
        commonPaths: [],
        riskyPaths: [],
        description: 'GitHub Pages is free but has usage limits'
      },
      'cloudflare-pages': {
        name: 'Cloudflare Pages',
        costPerGB: 0,
        commonPaths: [],
        riskyPaths: [],
        description: 'Cloudflare Pages is generous with free tier'
      }
    };
    
    return configs[platform] || {
      name: 'Unknown Platform',
      costPerGB: 0.25,
      commonPaths: [],
      riskyPaths: [],
      description: 'Unknown hosting platform'
    };
  }
}
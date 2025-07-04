export interface BotDetectionContext {
  ip: string;
  userAgent: string;
  country: string;
  platform: string;
}

export class BotDetector {
  private knownBots = [
    'scrapy', 'python-requests', 'curl', 'wget', 'httpx', 'aiohttp',
    'selenium', 'phantomjs', 'puppeteer', 'playwright',
    'bot', 'crawler', 'spider', 'scraper', 'archive',
    'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'googlebot', 'bingbot', 'yandexbot', 'baiduspider',
    'slackbot', 'whatsapp', 'telegram'
  ];

  private suspiciousPatterns = [
    /headless/i,
    /automated/i,
    /script/i,
    /download/i,
    /fetch/i,
    /test/i,
    /monitor/i,
    /check/i,
    /scan/i,
    /probe/i
  ];

  private legitimateBots = [
    'googlebot', 'bingbot', 'facebookexternalhit', 'twitterbot',
    'linkedinbot', 'whatsapp', 'slackbot', 'telegram'
  ];

  private suspiciousCountries = [
    'CN', 'RU', 'KP', 'IR', 'PK', 'BD', 'VN', 'ID'
  ];

  async calculateBotScore(request: Request, context: BotDetectionContext): Promise<number> {
    let score = 0;
    const userAgent = context.userAgent.toLowerCase();

    // Check for known bot patterns
    for (const bot of this.knownBots) {
      if (userAgent.includes(bot)) {
        // Give lower score to legitimate bots
        if (this.legitimateBots.includes(bot)) {
          score += 20;
        } else {
          score += 70;
        }
        break;
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        score += 30;
        break;
      }
    }

    // Check for missing common headers
    if (!request.headers.get('Accept')) score += 25;
    if (!request.headers.get('Accept-Language')) score += 15;
    if (!request.headers.get('Accept-Encoding')) score += 15;
    if (!request.headers.get('Connection')) score += 10;

    // Check for suspicious country
    if (this.suspiciousCountries.includes(context.country)) {
      score += 20;
    }

    // Check for rate limiting (simplified)
    const rateScore = await this.checkRateLimit(context.ip);
    score += rateScore;

    // Platform-specific checks
    score += this.getPlatformSpecificScore(context.platform, request);

    // User agent analysis
    score += this.analyzeUserAgent(userAgent);

    return Math.min(score, 100);
  }

  private async checkRateLimit(ip: string): Promise<number> {
    // In a real implementation, you'd track request rates
    // For now, return a simplified score
    return 0;
  }

  private getPlatformSpecificScore(platform: string, request: Request): number {
    let score = 0;
    const url = new URL(request.url);

    switch (platform) {
      case 'webflow':
        // Webflow sites often get scraped for design inspiration
        if (url.pathname.includes('/assets/') || 
            url.pathname.includes('/images/') ||
            url.pathname.includes('.css') ||
            url.pathname.includes('.js')) {
          score += 15;
        }
        break;
      
      case 'netlify':
        // Netlify function calls from bots
        if (url.pathname.includes('/.netlify/functions/')) {
          score += 20;
        }
        break;
      
      case 'vercel':
        // Vercel API routes
        if (url.pathname.includes('/api/')) {
          score += 15;
        }
        break;
      
      case 'shopify':
        // Shopify product data scraping
        if (url.pathname.includes('/products/') || 
            url.pathname.includes('/collections/') ||
            url.pathname.includes('.json')) {
          score += 25;
        }
        break;
    }

    return score;
  }

  private analyzeUserAgent(userAgent: string): number {
    let score = 0;

    // Very short user agents are suspicious
    if (userAgent.length < 20) score += 30;

    // No version information
    if (!userAgent.includes('/')) score += 20;

    // Common bot indicators
    if (userAgent.includes('http') && !userAgent.includes('Mozilla')) score += 40;
    if (userAgent.includes('python')) score += 50;
    if (userAgent.includes('java')) score += 30;
    if (userAgent.includes('go-http')) score += 40;

    // Unusual patterns
    if (/^[a-zA-Z0-9\s]+$/.test(userAgent) && userAgent.length > 30) score += 25;

    return score;
  }
}
import { Env } from './index';

export interface AnalyticsData {
  domain: string;
  ip: string;
  userAgent: string;
  country: string;
  platform: string;
  botScore: number;
  blocked: boolean;
  rule?: string;
  timestamp: number;
}

export interface DomainStats {
  domain: string;
  totalRequests: number;
  blockedRequests: number;
  bandwidthSavedGB: number;
  costSaved: number;
  topBlockedCountries: { country: string; requests: number }[];
  topBlockedRules: { rule: string; requests: number }[];
  dailyStats: { date: string; requests: number; blocked: number }[];
  platformConfig: any;
}

export class AnalyticsCollector {
  constructor(private env: Env) {}

  async recordRequest(data: AnalyticsData): Promise<void> {
    const timestamp = Date.now();
    const dateKey = new Date(timestamp).toISOString().split('T')[0];
    
    // Store individual request data
    const requestKey = `analytics:${data.domain}:${timestamp}:${Math.random()}`;
    await this.env.ANALYTICS_KV.put(requestKey, JSON.stringify(data), {
      expirationTtl: 30 * 24 * 60 * 60 // 30 days
    });

    // Update daily aggregates
    await this.updateDailyAggregates(data, dateKey);
    
    // Update real-time counters
    await this.updateCounters(data);
  }

  private async updateDailyAggregates(data: AnalyticsData, dateKey: string): Promise<void> {
    const key = `daily:${data.domain}:${dateKey}`;
    const existing = await this.env.ANALYTICS_KV.get(key);
    
    let stats = existing ? JSON.parse(existing) : {
      domain: data.domain,
      date: dateKey,
      totalRequests: 0,
      blockedRequests: 0,
      countries: {},
      rules: {},
      platforms: {}
    };

    stats.totalRequests += 1;
    if (data.blocked) {
      stats.blockedRequests += 1;
    }

    // Update country stats
    if (data.country) {
      stats.countries[data.country] = (stats.countries[data.country] || 0) + 1;
    }

    // Update rule stats
    if (data.rule) {
      stats.rules[data.rule] = (stats.rules[data.rule] || 0) + 1;
    }

    // Update platform stats
    stats.platforms[data.platform] = (stats.platforms[data.platform] || 0) + 1;

    await this.env.ANALYTICS_KV.put(key, JSON.stringify(stats), {
      expirationTtl: 365 * 24 * 60 * 60 // 1 year
    });
  }

  private async updateCounters(data: AnalyticsData): Promise<void> {
    const counterKey = `counters:${data.domain}`;
    const existing = await this.env.ANALYTICS_KV.get(counterKey);
    
    let counters = existing ? JSON.parse(existing) : {
      totalRequests: 0,
      blockedRequests: 0,
      lastUpdated: Date.now()
    };

    counters.totalRequests += 1;
    if (data.blocked) {
      counters.blockedRequests += 1;
    }
    counters.lastUpdated = Date.now();

    await this.env.ANALYTICS_KV.put(counterKey, JSON.stringify(counters));
  }

  async getStats(domain: string, days: number = 7): Promise<DomainStats> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const dailyStats: { date: string; requests: number; blocked: number }[] = [];
    const countries: { [key: string]: number } = {};
    const rules: { [key: string]: number } = {};
    let totalRequests = 0;
    let blockedRequests = 0;

    // Collect daily stats
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const key = `daily:${domain}:${dateKey}`;
      const data = await this.env.ANALYTICS_KV.get(key);
      
      if (data) {
        const stats = JSON.parse(data);
        dailyStats.push({
          date: dateKey,
          requests: stats.totalRequests,
          blocked: stats.blockedRequests
        });
        
        totalRequests += stats.totalRequests;
        blockedRequests += stats.blockedRequests;

        // Aggregate countries
        Object.entries(stats.countries).forEach(([country, count]) => {
          countries[country] = (countries[country] || 0) + (count as number);
        });

        // Aggregate rules
        Object.entries(stats.rules).forEach(([rule, count]) => {
          rules[rule] = (rules[rule] || 0) + (count as number);
        });
      } else {
        dailyStats.push({
          date: dateKey,
          requests: 0,
          blocked: 0
        });
      }
    }

    // Calculate bandwidth saved (estimate)
    const avgRequestSize = 0.5; // MB per request
    const bandwidthSavedGB = (blockedRequests * avgRequestSize) / 1024;

    // Calculate cost saved (will be updated with platform-specific costs)
    const costSaved = this.calculateCostSaved(domain, bandwidthSavedGB, blockedRequests);

    return {
      domain,
      totalRequests,
      blockedRequests,
      bandwidthSavedGB: Math.round(bandwidthSavedGB * 100) / 100,
      costSaved: Math.round(costSaved * 100) / 100,
      topBlockedCountries: Object.entries(countries)
        .map(([country, requests]) => ({ country, requests: requests as number }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10),
      topBlockedRules: Object.entries(rules)
        .map(([rule, requests]) => ({ rule, requests: requests as number }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10),
      dailyStats,
      platformConfig: null // Will be populated by the caller
    };
  }

  private calculateCostSaved(domain: string, bandwidthGB: number, blockedRequests: number): number {
    // Default cost calculation - will be enhanced with platform-specific data
    const costPerGB = 0.20; // Average cost per GB across platforms
    const costPerRequest = 0.0001; // Some platforms charge per request
    
    return (bandwidthGB * costPerGB) + (blockedRequests * costPerRequest);
  }

  async getRealtimeStats(domain: string): Promise<any> {
    const counterKey = `counters:${domain}`;
    const counters = await this.env.ANALYTICS_KV.get(counterKey);
    
    if (!counters) {
      return {
        totalRequests: 0,
        blockedRequests: 0,
        blockRate: 0,
        lastUpdated: null
      };
    }

    const data = JSON.parse(counters);
    return {
      totalRequests: data.totalRequests,
      blockedRequests: data.blockedRequests,
      blockRate: data.totalRequests > 0 ? (data.blockedRequests / data.totalRequests) * 100 : 0,
      lastUpdated: data.lastUpdated
    };
  }

  async getSavingsReport(domain: string, platform: string): Promise<any> {
    const stats = await this.getStats(domain, 30); // Last 30 days
    
    // Platform-specific cost calculations
    const platformCosts = {
      'webflow': { perGB: 0.20, perRequest: 0 },
      'netlify': { perGB: 0.20, perRequest: 0 },
      'vercel': { perGB: 0.40, perRequest: 0.0001 },
      'shopify': { perGB: 0.15, perRequest: 0 },
      'unknown': { perGB: 0.25, perRequest: 0 }
    };

    const costs = platformCosts[platform] || platformCosts['unknown'];
    const bandwidthSavings = stats.bandwidthSavedGB * costs.perGB;
    const requestSavings = stats.blockedRequests * costs.perRequest;
    const totalSavings = bandwidthSavings + requestSavings;

    return {
      domain,
      platform,
      period: '30 days',
      blockedRequests: stats.blockedRequests,
      bandwidthSavedGB: stats.bandwidthSavedGB,
      costSaved: totalSavings,
      breakdown: {
        bandwidthSavings,
        requestSavings
      },
      projectedYearlySavings: totalSavings * 12,
      roi: totalSavings * 12 // Assuming the service costs less than yearly savings
    };
  }
}
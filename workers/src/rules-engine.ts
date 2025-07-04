import { Env } from './index';

export interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  platform: string;
  action: 'block' | 'challenge' | 'allow';
  conditions: RuleCondition[];
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export interface RuleCondition {
  type: 'bot_score' | 'country' | 'user_agent' | 'path' | 'rate_limit' | 'ip_reputation';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[];
}

export interface BlockDecision {
  blocked: boolean;
  reason: string;
  rule?: string;
  action: 'block' | 'challenge' | 'allow';
}

export class RulesEngine {
  constructor(private env: Env) {}

  async getRules(domain: string): Promise<Rule[]> {
    const key = `rules:${domain}`;
    const rulesData = await this.env.RULES_KV.get(key);
    
    if (!rulesData) {
      return this.getDefaultRules(domain);
    }
    
    return JSON.parse(rulesData);
  }

  async saveRules(domain: string, rules: Rule[]): Promise<void> {
    const key = `rules:${domain}`;
    await this.env.RULES_KV.put(key, JSON.stringify(rules));
  }

  async shouldBlock(request: Request, botScore: number, rules: Rule[]): Promise<BlockDecision> {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';
    const country = request.headers.get('CF-IPCountry') || '';
    const clientIP = request.headers.get('CF-Connecting-IP') || '';

    // Sort rules by priority (higher priority first)
    const sortedRules = rules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (await this.evaluateRule(rule, {
        botScore,
        userAgent,
        country,
        path: url.pathname,
        ip: clientIP,
        request
      })) {
        return {
          blocked: rule.action === 'block',
          reason: rule.description,
          rule: rule.name,
          action: rule.action
        };
      }
    }

    return {
      blocked: false,
      reason: 'No rules matched',
      action: 'allow'
    };
  }

  private async evaluateRule(rule: Rule, context: {
    botScore: number;
    userAgent: string;
    country: string;
    path: string;
    ip: string;
    request: Request;
  }): Promise<boolean> {
    // All conditions must be true for the rule to match
    for (const condition of rule.conditions) {
      if (!await this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(condition: RuleCondition, context: {
    botScore: number;
    userAgent: string;
    country: string;
    path: string;
    ip: string;
    request: Request;
  }): Promise<boolean> {
    let actualValue: any;

    switch (condition.type) {
      case 'bot_score':
        actualValue = context.botScore;
        break;
      case 'country':
        actualValue = context.country;
        break;
      case 'user_agent':
        actualValue = context.userAgent.toLowerCase();
        break;
      case 'path':
        actualValue = context.path;
        break;
      case 'rate_limit':
        actualValue = await this.getCurrentRateLimit(context.ip);
        break;
      case 'ip_reputation':
        actualValue = await this.getIPReputation(context.ip);
        break;
      default:
        return false;
    }

    return this.compareValues(actualValue, condition.operator, condition.value);
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'starts_with':
        return String(actual).startsWith(String(expected));
      case 'ends_with':
        return String(actual).endsWith(String(expected));
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      default:
        return false;
    }
  }

  private async getCurrentRateLimit(ip: string): Promise<number> {
    // Simplified rate limiting - in production, use Durable Objects or KV with TTL
    const key = `rate:${ip}`;
    const current = await this.env.ANALYTICS_KV.get(key);
    return current ? parseInt(current) : 0;
  }

  private async getIPReputation(ip: string): Promise<number> {
    // In production, integrate with IP reputation services
    // For now, return a default score
    return 50;
  }

  private getDefaultRules(domain: string): Rule[] {
    return [
      {
        id: 'high-bot-score',
        name: 'Block High Bot Score',
        description: 'Block requests with high bot confidence score',
        enabled: true,
        platform: 'all',
        action: 'block',
        priority: 100,
        conditions: [
          {
            type: 'bot_score',
            operator: 'greater_than',
            value: 80
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'challenge-medium-bot-score',
        name: 'Challenge Medium Bot Score',
        description: 'Challenge requests with medium bot confidence score',
        enabled: true,
        platform: 'all',
        action: 'challenge',
        priority: 90,
        conditions: [
          {
            type: 'bot_score',
            operator: 'greater_than',
            value: 60
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'block-suspicious-countries',
        name: 'Block Suspicious Countries',
        description: 'Block traffic from high-risk countries',
        enabled: false,
        platform: 'all',
        action: 'block',
        priority: 80,
        conditions: [
          {
            type: 'country',
            operator: 'in',
            value: ['CN', 'RU', 'KP', 'IR']
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'block-common-scrapers',
        name: 'Block Common Scrapers',
        description: 'Block known scraping tools and libraries',
        enabled: true,
        platform: 'all',
        action: 'block',
        priority: 95,
        conditions: [
          {
            type: 'user_agent',
            operator: 'contains',
            value: 'scrapy'
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  }
}
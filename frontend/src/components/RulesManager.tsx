'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Globe, 
  AlertTriangle, 
  Settings,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  category: 'scrapers' | 'geo' | 'rate' | 'custom';
  blockedCount: number;
}

interface RulesManagerProps {
  domain: string;
  platform: string;
}

export function RulesManager({ domain, platform }: RulesManagerProps) {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: 'block-scrapers',
      name: 'Block Common Scrapers',
      description: 'Blocks known scraping tools like Scrapy, curl, wget',
      enabled: true,
      priority: 95,
      category: 'scrapers',
      blockedCount: 4280
    },
    {
      id: 'high-bot-score',
      name: 'High Bot Score Block',
      description: 'Blocks requests with bot confidence score > 80%',
      enabled: true,
      priority: 100,
      category: 'custom',
      blockedCount: 3150
    },
    {
      id: 'geo-suspicious',
      name: 'Suspicious Countries',
      description: 'Blocks traffic from high-risk countries',
      enabled: false,
      priority: 80,
      category: 'geo',
      blockedCount: 0
    },
    {
      id: 'rate-limit',
      name: 'Rate Limiting',
      description: 'Challenges users exceeding 100 requests/minute',
      enabled: true,
      priority: 90,
      category: 'rate',
      blockedCount: 1890
    }
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getPlatformSpecificRules = () => {
    switch (platform) {
      case 'webflow':
        return [
          'Asset scraping protection',
          'Design theft prevention',
          'High-frequency asset requests blocking'
        ];
      case 'netlify':
        return [
          'Function abuse prevention',
          'Form spam protection',
          'Build trigger protection'
        ];
      case 'vercel':
        return [
          'Edge function protection',
          'API route abuse prevention',
          'High-cost request blocking'
        ];
      case 'shopify':
        return [
          'Product scraping protection',
          'Inventory monitoring prevention',
          'Price checking bot blocking'
        ];
      default:
        return ['General bot protection'];
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scrapers': return 'bg-red-100 text-red-800';
      case 'geo': return 'bg-blue-100 text-blue-800';
      case 'rate': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const enabledRules = rules.filter(rule => rule.enabled);
  const totalBlocked = rules.reduce((sum, rule) => sum + (rule.enabled ? rule.blockedCount : 0), 0);

  return (
    <div className="space-y-6">
      {/* Platform-specific recommendations */}
      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>{platform.charAt(0).toUpperCase() + platform.slice(1)} Optimizations Active:</strong>
          <div className="mt-2 space-y-1">
            {getPlatformSpecificRules().map((rule, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {rule}
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>

      {/* Rules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{enabledRules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Blocked</p>
                <p className="text-2xl font-bold text-red-600">{totalBlocked.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Protected Domain</p>
                <p className="text-lg font-bold text-blue-600">{domain}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Protection Rules</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className={`p-4 rounded-lg border transition-all ${
                  rule.enabled 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Switch 
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge className={getCategoryColor(rule.category)}>
                          {rule.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Priority: {rule.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {rule.enabled ? rule.blockedCount.toLocaleString() : '0'}
                      </div>
                      <div className="text-xs text-gray-500">blocked</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Download,
  Calendar,
  Target,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Cell } from 'recharts';

interface SavingsReportProps {
  domain: string;
  platform: string;
  stats: {
    totalRequests: number;
    blockedRequests: number;
    bandwidthSavedGB: number;
    costSaved: number;
    dailyStats: { date: string; requests: number; blocked: number }[];
  };
}

export function SavingsReport({ domain, platform, stats }: SavingsReportProps) {
  const monthlyStats = stats.dailyStats.map(day => ({
    date: day.date,
    saved: (day.blocked * 0.02).toFixed(2), // $0.02 per blocked request
    blocked: day.blocked
  }));

  const platformCosts = {
    webflow: { name: 'Webflow', perGB: 0.20, color: '#8b5cf6' },
    netlify: { name: 'Netlify', perGB: 0.20, color: '#06b6d4' },
    vercel: { name: 'Vercel', perGB: 0.40, color: '#000000' },
    shopify: { name: 'Shopify', perGB: 0.15, color: '#10b981' },
    other: { name: 'Other', perGB: 0.25, color: '#6b7280' }
  };

  const currentPlatform = platformCosts[platform as keyof typeof platformCosts] || platformCosts.other;
  const projectedYearlySavings = stats.costSaved * 12;
  const ROI = ((projectedYearlySavings - 120) / 120) * 100; // Assuming $120/year service cost

  const savingsBreakdown = [
    { name: 'Bandwidth Costs', value: stats.bandwidthSavedGB * currentPlatform.perGB, color: '#3b82f6' },
    { name: 'Function Calls', value: stats.blockedRequests * 0.0001, color: '#ef4444' },
    { name: 'Overage Fees', value: stats.costSaved * 0.3, color: '#f59e0b' },
    { name: 'Performance Impact', value: stats.costSaved * 0.2, color: '#10b981' }
  ];

  const competitorComparison = [
    { name: 'Bot Shield', cost: 10, savings: projectedYearlySavings, roi: ROI },
    { name: 'DataDome', cost: 15000, savings: projectedYearlySavings + 500, roi: -95 },
    { name: 'Cloudflare Bot Mgmt', cost: 8000, savings: projectedYearlySavings + 300, roi: -85 },
    { name: 'No Protection', cost: 0, savings: 0, roi: -100 }
  ];

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>Monthly Savings Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${stats.costSaved.toFixed(2)}
              </div>
              <p className="text-gray-600">Saved this month</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.bandwidthSavedGB.toFixed(1)} GB
                </div>
                <p className="text-sm text-gray-600">Bandwidth saved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.blockedRequests.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Bots blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>ROI Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Service Cost</span>
                <span className="font-semibold">$10.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Savings</span>
                <span className="font-semibold text-green-600">+${stats.costSaved.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Monthly Benefit</span>
                <span className="font-semibold text-green-600">+${(stats.costSaved - 10).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Annual ROI</span>
                  <div className="flex items-center space-x-2">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600">{ROI.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Savings Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Tooltip />
                {savingsBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {savingsBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-semibold">${item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Daily Savings Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, 'Saved']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="saved" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Comparison */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Platform Cost Impact</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                {currentPlatform.name} Cost Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Cost per GB</div>
                  <div className="font-bold">${currentPlatform.perGB.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Without Protection</div>
                  <div className="font-bold text-red-600">
                    ${((stats.bandwidthSavedGB + 10) * currentPlatform.perGB).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">With Protection</div>
                  <div className="font-bold text-green-600">
                    ${(10 * currentPlatform.perGB).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Monthly Savings</div>
                  <div className="font-bold text-green-600">
                    ${(stats.bandwidthSavedGB * currentPlatform.perGB).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Comparison */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Solution Comparison</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Solution</th>
                  <th className="text-left p-2">Annual Cost</th>
                  <th className="text-left p-2">Annual Savings</th>
                  <th className="text-left p-2">ROI</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((solution, idx) => (
                  <tr key={idx} className={`border-b ${idx === 0 ? 'bg-green-50' : ''}`}>
                    <td className="p-2 font-medium">{solution.name}</td>
                    <td className="p-2">${solution.cost.toLocaleString()}</td>
                    <td className="p-2">${solution.savings.toFixed(0)}</td>
                    <td className="p-2">
                      <span className={solution.roi > 0 ? 'text-green-600' : 'text-red-600'}>
                        {solution.roi > 0 ? '+' : ''}{solution.roi.toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-2">
                      {idx === 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Current
                        </Badge>
                      )}
                      {idx === 1 && (
                        <Badge className="bg-red-100 text-red-800">
                          Enterprise Only
                        </Badge>
                      )}
                      {idx === 2 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Complex Setup
                        </Badge>
                      )}
                      {idx === 3 && (
                        <Badge className="bg-gray-100 text-gray-800">
                          Vulnerable
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
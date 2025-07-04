'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  DollarSign, 
  Bot, 
  TrendingUp, 
  Activity,
  Settings,
  ArrowLeft,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Users,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { apiClient, AnalyticsStats } from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState({
    currentRequests: 0,
    currentBlocked: 0,
    currentSaved: 0
  });

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // For demo, using a sample domain - in real app this would come from user session
        const stats = await apiClient.getStats('myawesomesite.com', 7);
        setData(stats);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        // Fallback to mock data for demo purposes
        setData({
          domain: 'myawesomesite.com',
          period_days: 7,
          total_requests: 45678,
          blocked_requests: 12390,
          bandwidth_saved_gb: 8.7,
          top_blocked_countries: [
            { country: 'CN', requests: 4500 },
            { country: 'RU', requests: 3200 },
            { country: 'US', requests: 2800 }
          ],
          blocked_by_rule: [
            { rule: 'bot_detection', requests: 8000 },
            { rule: 'rate_limit', requests: 3000 },
            { rule: 'geo_block', requests: 1390 }
          ],
          daily_stats: [
            { date: '2024-01-01', requests: 6800, blocked: 1200 },
            { date: '2024-01-02', requests: 7200, blocked: 1850 },
            { date: '2024-01-03', requests: 6500, blocked: 1650 },
            { date: '2024-01-04', requests: 8100, blocked: 2100 },
            { date: '2024-01-05', requests: 7800, blocked: 1990 },
            { date: '2024-01-06', requests: 6900, blocked: 1780 },
            { date: '2024-01-07', requests: 7300, blocked: 1820 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simulate live updates (in real app, this would be WebSocket or Server-Sent Events)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        currentRequests: prev.currentRequests + Math.floor(Math.random() * 5),
        currentBlocked: prev.currentBlocked + Math.floor(Math.random() * 3),
        currentSaved: prev.currentSaved + Math.random() * 0.5
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const blockRate = data.total_requests > 0 
    ? (data.blocked_requests / data.total_requests * 100).toFixed(1) 
    : '0';

  const moneySaved = data.bandwidth_saved_gb * 18; // Rough estimate: $18 per GB
  const projectedMonthlySavings = moneySaved * 4.33; // ~4.33 weeks per month

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">BotShield Dashboard</h1>
                  <p className="text-sm text-slate-600">{data.domain}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live Protection</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Money Saved
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(moneySaved + liveStats.currentSaved).toFixed(2)}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +${liveStats.currentSaved.toFixed(2)} today
              </p>
              <p className="text-xs text-green-600/70 mt-1">
                ~${projectedMonthlySavings.toFixed(0)}/month projected
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/20 rounded-full -translate-y-4 translate-x-4"></div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">
                Bots Blocked
              </CardTitle>
              <Bot className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(data.blocked_requests + liveStats.currentBlocked).toLocaleString()}
              </div>
              <p className="text-xs text-red-600 mt-1">
                +{liveStats.currentBlocked} today
              </p>
              <p className="text-xs text-red-600/70 mt-1">
                {blockRate}% block rate
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-200/20 rounded-full -translate-y-4 translate-x-4"></div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total Requests
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(data.total_requests + liveStats.currentRequests).toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                +{liveStats.currentRequests} today
              </p>
              <p className="text-xs text-blue-600/70 mt-1">
                {data.bandwidth_saved_gb.toFixed(1)} GB saved
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -translate-y-4 translate-x-4"></div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Protection Period
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {data.period_days}d
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Last {data.period_days} days
              </p>
              <p className="text-xs text-purple-600/70 mt-1">
                Real-time monitoring
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/20 rounded-full -translate-y-4 translate-x-4"></div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Traffic & Blocks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.daily_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="Total Requests"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="blocked" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="Blocked Requests"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Daily Savings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.daily_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`$${value}`, 'Saved']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saved" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Daily Savings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Live Activity</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Blocked suspicious bot from scraping product pages</span>
                </div>
                <span className="text-xs text-slate-500">2 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Saved $2.40 in bandwidth costs</span>
                </div>
                <span className="text-xs text-slate-500">5 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Blocked automated image scraper</span>
                </div>
                <span className="text-xs text-slate-500">8 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Adjust Protection Level
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Detailed Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Whitelist Legitimate Bots
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Protection Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Bot Detection</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Geo Blocking</span>
                <Badge className="bg-gray-100 text-gray-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Optional
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Having issues or questions? Our team is here to help!
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
              <Button variant="outline" className="w-full">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
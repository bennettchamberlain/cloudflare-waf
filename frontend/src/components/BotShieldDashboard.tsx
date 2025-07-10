'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Settings,
  BarChart3,
  Zap,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import the new components we'll create
import { PlatformSelector } from './PlatformSelector';
import DeploymentWizard from './DeploymentWizard';
import { RulesManager } from './RulesManager';
import { SavingsReport } from './SavingsReport';
import { RealTimeMonitor } from './RealTimeMonitor';

interface DashboardData {
  domain: string;
  platform: string;
  stats: {
    totalRequests: number;
    blockedRequests: number;
    bandwidthSavedGB: number;
    costSaved: number;
    dailyStats: { date: string; requests: number; blocked: number }[];
  };
  isConnected: boolean;
  isDeployed: boolean;
}

export default function BotShieldDashboard() {
  const [data, setData] = useState<DashboardData>({
    domain: '',
    platform: '',
    stats: {
      totalRequests: 0,
      blockedRequests: 0,
      bandwidthSavedGB: 0,
      costSaved: 0,
      dailyStats: []
    },
    isConnected: false,
    isDeployed: false
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const handleDomainSubmit = async (domain: string, platform: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockStats = {
        totalRequests: 45678,
        blockedRequests: 12390,
        bandwidthSavedGB: 8.7,
        costSaved: 156.80,
        dailyStats: [
          { date: '2024-01-01', requests: 6800, blocked: 1200 },
          { date: '2024-01-02', requests: 7200, blocked: 1850 },
          { date: '2024-01-03', requests: 6500, blocked: 1650 },
          { date: '2024-01-04', requests: 8100, blocked: 2100 },
          { date: '2024-01-05', requests: 7800, blocked: 1990 },
          { date: '2024-01-06', requests: 6900, blocked: 1780 },
          { date: '2024-01-07', requests: 7300, blocked: 1820 }
        ]
      };

      setData({
        domain,
        platform,
        stats: mockStats,
        isConnected: true,
        isDeployed: true
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const blockRate = data.stats.totalRequests > 0 
    ? (data.stats.blockedRequests / data.stats.totalRequests * 100).toFixed(1) 
    : '0';

  const projectedYearlySavings = data.stats.costSaved * 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bot Shield</h1>
              <p className="text-gray-600">Protect your platform from expensive bot traffic</p>
            </div>
          </div>
          
          {data.isConnected && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Protection</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {data.domain}
              </Badge>
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!data.isConnected ? (
          <PlatformSelector 
            onSubmit={handleDomainSubmit} 
            isLoading={isLoading}
          />
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Money Saved
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${data.stats.costSaved.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500">
                    ${projectedYearlySavings.toFixed(0)}/year projected
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Bots Blocked
                  </CardTitle>
                  <Shield className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {data.stats.blockedRequests.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">
                    {blockRate}% of total traffic
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Bandwidth Saved
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.stats.bandwidthSavedGB.toFixed(1)} GB
                  </div>
                  <p className="text-xs text-gray-500">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Platform
                  </CardTitle>
                  <Globe className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 capitalize">
                    {data.platform}
                  </div>
                  <p className="text-xs text-gray-500">
                    Optimized protection
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="savings">Savings</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Real-time Monitor */}
                  <RealTimeMonitor 
                    domain={data.domain}
                    stats={data.stats}
                  />

                  {/* Traffic Chart */}
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Traffic Trends</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.stats.dailyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="requests" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Total Requests"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="blocked" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Blocked Requests"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform-specific insights */}
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{data.platform.charAt(0).toUpperCase() + data.platform.slice(1)} Protection Active:</strong> 
                    {data.platform === 'webflow' && " Blocking design scrapers and asset downloads"}
                    {data.platform === 'netlify' && " Protecting serverless functions from abuse"}
                    {data.platform === 'vercel' && " Preventing expensive edge function calls"}
                    {data.platform === 'shopify' && " Stopping product data scraping"}
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="rules">
                <RulesManager 
                  domain={data.domain}
                  platform={data.platform}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Detailed Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-500">
                        Advanced analytics coming soon...
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="savings">
                <SavingsReport 
                  domain={data.domain}
                  platform={data.platform}
                  stats={data.stats}
                />
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Settings & Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Email Alerts</h3>
                            <p className="text-sm text-gray-500">Get notified of significant bot activity</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Aggressive Mode</h3>
                            <p className="text-sm text-gray-500">More strict bot detection</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Whitelist Legitimate Bots</h3>
                            <p className="text-sm text-gray-500">Allow Google, Bing, and other search engines</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
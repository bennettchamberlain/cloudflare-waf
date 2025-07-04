'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, AlertTriangle, Globe, Clock } from 'lucide-react';

interface RealTimeMonitorProps {
  domain: string;
  stats: {
    totalRequests: number;
    blockedRequests: number;
    bandwidthSavedGB: number;
    costSaved: number;
  };
}

export function RealTimeMonitor({ domain, stats }: RealTimeMonitorProps) {
  const [recentBlocks, setRecentBlocks] = useState([
    { id: 1, country: 'CN', userAgent: 'scrapy/2.5.0', timestamp: new Date(), blocked: true },
    { id: 2, country: 'US', userAgent: 'Mozilla/5.0 (legitimate)', timestamp: new Date(), blocked: false },
    { id: 3, country: 'RU', userAgent: 'python-requests/2.28.0', timestamp: new Date(), blocked: true },
    { id: 4, country: 'DE', userAgent: 'curl/7.68.0', timestamp: new Date(), blocked: true },
    { id: 5, country: 'FR', userAgent: 'Mozilla/5.0 (Chrome)', timestamp: new Date(), blocked: false },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate new bot activity
      if (Math.random() < 0.3) {
        const mockActivity = {
          id: Date.now(),
          country: ['CN', 'RU', 'US', 'DE', 'FR'][Math.floor(Math.random() * 5)],
          userAgent: ['scrapy/2.5.0', 'python-requests/2.28.0', 'curl/7.68.0', 'Mozilla/5.0 (legitimate)'][Math.floor(Math.random() * 4)],
          timestamp: new Date(),
          blocked: Math.random() < 0.7
        };
        
        setRecentBlocks(prev => [mockActivity, ...prev.slice(0, 4)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const blockRate = stats.totalRequests > 0 
    ? (stats.blockedRequests / stats.totalRequests * 100).toFixed(1) 
    : '0';

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Live Activity</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-normal text-gray-500">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Block Rate</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{blockRate}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Protected</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{domain}</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="font-medium mb-3 flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Recent Activity</span>
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentBlocks.map((activity) => (
              <div 
                key={activity.id}
                className={`p-3 rounded-lg border ${
                  activity.blocked 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {activity.blocked ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Shield className="h-4 w-4 text-green-500" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {activity.country}
                    </Badge>
                    <span className="text-sm font-medium">
                      {activity.blocked ? 'BLOCKED' : 'ALLOWED'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-600 truncate">
                  {activity.userAgent}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
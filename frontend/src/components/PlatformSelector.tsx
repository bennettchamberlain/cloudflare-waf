'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Zap, 
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const platforms = [
  {
    id: 'webflow',
    name: 'Webflow',
    icon: '🎨',
    description: 'Design-focused website builder',
    costPerGB: 0.20,
    commonIssues: ['Design scraping', 'Asset downloads', 'Bandwidth overages'],
    savingsExample: '$50-200/month'
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: '⚡',
    description: 'JAMstack platform with serverless functions',
    costPerGB: 0.20,
    commonIssues: ['Function abuse', 'Bandwidth spikes', 'Form spam'],
    savingsExample: '$30-150/month'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    description: 'Frontend deployment platform',
    costPerGB: 0.40,
    commonIssues: ['Edge function calls', 'High bandwidth costs', 'API abuse'],
    savingsExample: '$60-300/month'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🛍️',
    description: 'E-commerce platform',
    costPerGB: 0.15,
    commonIssues: ['Product scraping', 'Inventory checks', 'Price monitoring'],
    savingsExample: '$40-180/month'
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    icon: '⬜',
    description: 'All-in-one website builder',
    costPerGB: 0.25,
    commonIssues: ['Content scraping', 'Image downloads', 'Bandwidth usage'],
    savingsExample: '$35-120/month'
  },
  {
    id: 'other',
    name: 'Other',
    icon: '🌐',
    description: 'Custom or other platform',
    costPerGB: 0.25,
    commonIssues: ['Various bot attacks', 'Bandwidth costs', 'Server load'],
    savingsExample: '$25-100/month'
  }
];

interface PlatformSelectorProps {
  onSubmit: (domain: string, platform: string) => void;
  isLoading?: boolean;
}

export function PlatformSelector({ onSubmit, isLoading = false }: PlatformSelectorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [domain, setDomain] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    if (domain && selectedPlatform) {
      onSubmit(domain, selectedPlatform);
    }
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Stop Wasting Money on Bot Traffic
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Businesses lose hundreds of dollars monthly to bot traffic on platforms like Webflow, Netlify, and Vercel. 
          Set up protection in 2 minutes and start saving immediately.
        </p>
      </div>

      {/* Problem Statement */}
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>The Hidden Cost:</strong> Forum reports show 400-700% bandwidth overages from bots scraping Webflow sites, 
          Netlify users seeing 70GB spikes in a week, and Vercel free tiers exhausted in days.
        </AlertDescription>
      </Alert>

      {step === 1 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Select Your Platform</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlatform(platform.id)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      <p className="text-sm text-gray-500">{platform.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost per GB:</span>
                      <Badge variant="outline">${platform.costPerGB.toFixed(2)}</Badge>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium text-green-600">Typical savings:</span>
                      <span className="ml-1">{platform.savingsExample}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Common issues:</span>
                      {platform.commonIssues.map((issue, idx) => (
                        <div key={idx} className="text-xs text-gray-500 flex items-center">
                          <div className="w-1 h-1 bg-red-400 rounded-full mr-2"></div>
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedPlatform && (
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => setStep(2)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue with {platforms.find(p => p.id === selectedPlatform)?.name}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Enter Your Domain</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="domain">Website Domain</Label>
              <Input
                id="domain"
                placeholder="yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="text-lg"
              />
            </div>

            {selectedPlatformData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">
                  {selectedPlatformData.name} Protection Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">What we'll block:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedPlatformData.commonIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Expected savings:</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedPlatformData.savingsExample}
                    </div>
                    <p className="text-sm text-gray-500">
                      Based on typical {selectedPlatformData.name} usage patterns
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!domain || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up protection...
                  </>
                ) : (
                  <>
                    Start Protection
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
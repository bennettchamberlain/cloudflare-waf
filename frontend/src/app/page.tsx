'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiClient, type AnalyticsStats } from '@/lib/api';
import { Shield, Globe, BarChart3, Settings, CheckCircle, AlertCircle, Activity } from 'lucide-react';

interface WAFTemplate {
  name: string;
  description: string;
  action: string;
  expression: string;
}

interface Templates {
  [key: string]: WAFTemplate;
}

export default function Dashboard() {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [domain, setDomain] = useState('');
  const [cloudflareToken, setCloudflareToken] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'dns' | 'meta'>('dns');
  const [templates, setTemplates] = useState<Templates>({});
  const [activeRules, setActiveRules] = useState<Record<string, any>>({});
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDomainVerified, setIsDomainVerified] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await apiClient.getTemplates();
      setTemplates(response.templates);
    } catch (err) {
      setError('Failed to load WAF templates');
    }
  };

  const handleDomainVerification = async () => {
    if (!domain) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.verifyDomain({
        domain,
        verification_method: verificationMethod
      });
      
      if (response.success) {
        setIsDomainVerified(true);
        setCurrentStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Domain verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCloudflareConnection = async () => {
    if (!cloudflareToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.connectCloudflare({
        api_token: cloudflareToken
      });
      
      if (response.success) {
        setIsConnected(true);
        setCurrentStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Cloudflare connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRuleToggle = async (templateId: string, enabled: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.applyWAFRule({
        template_id: templateId,
        enabled
      });
      
      if (response.success) {
        setActiveRules(prev => ({
          ...prev,
          [templateId]: { ...templates[templateId], enabled }
        }));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update rule');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!domain) return;
    
    try {
      const response = await apiClient.getStats(domain);
      if (response.success) {
        setAnalytics(response.stats);
      }
    } catch (err) {
      console.error('Failed to load analytics');
    }
  };

  useEffect(() => {
    if (currentStep === 3 && domain) {
      loadAnalytics();
    }
  }, [currentStep, domain]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Cloudflare WAF Manager</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Verify Domain', icon: Globe },
              { step: 2, title: 'Connect Cloudflare', icon: Settings },
              { step: 3, title: 'Configure WAF', icon: Shield }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentStep >= step ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Domain Verification */}
        {currentStep === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Verify Your Domain</CardTitle>
              <CardDescription>
                First, we need to verify that you own your Webflow domain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="yoursite.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Verification Method</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="dns"
                      checked={verificationMethod === 'dns'}
                      onChange={(e) => setVerificationMethod('dns')}
                    />
                    <span>DNS Record</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="meta"
                      checked={verificationMethod === 'meta'}
                      onChange={(e) => setVerificationMethod('meta')}
                    />
                    <span>Meta Tag</span>
                  </label>
                </div>
              </div>

              <Button 
                onClick={handleDomainVerification} 
                disabled={!domain || loading}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Domain'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Cloudflare Connection */}
        {currentStep === 2 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Connect Your Cloudflare Account</CardTitle>
              <CardDescription>
                Enter your Cloudflare API token to manage WAF rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cf-token">Cloudflare API Token</Label>
                <Input
                  id="cf-token"
                  type="password"
                  placeholder="Your Cloudflare API token"
                  value={cloudflareToken}
                  onChange={(e) => setCloudflareToken(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can create an API token in your Cloudflare dashboard under "My Profile" → "API Tokens"
                </p>
              </div>

              <Button 
                onClick={handleCloudflareConnection} 
                disabled={!cloudflareToken || loading}
                className="w-full"
              >
                {loading ? 'Connecting...' : 'Connect Cloudflare'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: WAF Configuration & Dashboard */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_requests.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Last 7 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{analytics.blocked_requests.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {((analytics.blocked_requests / analytics.total_requests) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bandwidth Saved</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{analytics.bandwidth_saved_gb} GB</div>
                    <p className="text-xs text-muted-foreground">Estimated savings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Protection Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {((analytics.blocked_requests / analytics.total_requests) * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Threats blocked</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* WAF Rules */}
            <Card>
              <CardHeader>
                <CardTitle>WAF Protection Rules</CardTitle>
                <CardDescription>
                  Enable or disable protection rules for your website. Changes take effect immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(templates).map(([templateId, template]) => (
                    <div key={templateId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                          template.action === 'block' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {template.action.toUpperCase()}
                        </span>
                      </div>
                      <Switch
                        checked={activeRules[templateId]?.enabled || false}
                        onCheckedChange={(enabled) => handleRuleToggle(templateId, enabled)}
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Blocked Countries */}
            {analytics && analytics.top_blocked_countries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Blocked Countries</CardTitle>
                  <CardDescription>Countries with the most blocked requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.top_blocked_countries.map((country, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{country.country}</span>
                        <span className="font-medium">{country.requests.toLocaleString()} requests</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

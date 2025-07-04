'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Globe, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Key,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface DeploymentWizardProps {
  onComplete: (domain: string) => void;
}

export default function DeploymentWizard({ onComplete }: DeploymentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    domain: '',
    platform: 'webflow',
    cloudflareToken: '',
    showToken: false,
    verificationMethod: 'dns' as 'dns' | 'meta',
    selectedTemplates: [] as string[]
  });

  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [deploymentStatus, setDeploymentStatus] = useState<'pending' | 'deploying' | 'completed' | 'failed'>('pending');

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVerifyDomain = async () => {
    if (!formData.domain) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.verifyDomain({
        domain: formData.domain,
        verification_method: formData.verificationMethod
      });
      
      if (result.success) {
        setVerificationStatus('verified');
        setCurrentStep(2);
      } else {
        setVerificationStatus('failed');
        setError('Domain verification failed. Please check your DNS settings.');
      }
    } catch (err) {
      setVerificationStatus('failed');
      setError('Failed to verify domain. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCloudflare = async () => {
    if (!formData.cloudflareToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.connectCloudflare({
        api_token: formData.cloudflareToken
      });
      
      if (result.success) {
        setCurrentStep(3);
      } else {
        setError('Failed to connect Cloudflare account. Please check your API token.');
      }
    } catch (err) {
      setError('Failed to connect Cloudflare account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployWorkers = async () => {
    if (formData.selectedTemplates.length === 0) return;
    
    setLoading(true);
    setDeploymentStatus('deploying');
    setError(null);
    
    try {
      // Deploy each selected template
      for (const templateId of formData.selectedTemplates) {
        await apiClient.applyWAFRule({
          template_id: templateId,
          enabled: true
        });
      }
      
      setDeploymentStatus('completed');
      setTimeout(() => {
        onComplete(formData.domain);
      }, 2000);
    } catch (err) {
      setDeploymentStatus('failed');
      setError('Failed to deploy protection rules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 'domain',
      title: 'Enter Your Domain',
      description: 'Start by adding the domain you want to protect',
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                type="text"
                placeholder="yourdomain.com"
                value={formData.domain}
                onChange={(e) => updateFormData('domain', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-slate-600 mt-1">
                Enter your domain without http:// or www
              </p>
            </div>
            
            <div>
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={formData.platform}
                onChange={(e) => updateFormData('platform', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="webflow">Webflow</option>
                <option value="netlify">Netlify</option>
                <option value="vercel">Vercel</option>
                <option value="shopify">Shopify</option>
                <option value="wordpress">WordPress</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          
          <Button 
            onClick={() => setCurrentStep(1)}
            disabled={!formData.domain}
            className="w-full"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )
    },
    {
      id: 'verification',
      title: 'Verify Domain Ownership',
      description: 'Prove you own this domain to continue',
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Verification Method</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="dns"
                    checked={formData.verificationMethod === 'dns'}
                    onChange={(e) => updateFormData('verificationMethod', e.target.value)}
                  />
                  <span>DNS Record (Recommended)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="meta"
                    checked={formData.verificationMethod === 'meta'}
                    onChange={(e) => updateFormData('verificationMethod', e.target.value)}
                  />
                  <span>Meta Tag</span>
                </label>
              </div>
            </div>
            
            {formData.verificationMethod === 'dns' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h4 className="font-medium text-blue-900 mb-2">DNS Verification</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Add this TXT record to your DNS settings:
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm">
                      <div><strong>Type:</strong> TXT</div>
                      <div><strong>Name:</strong> _cf-waf-verification.{formData.domain}</div>
                      <div><strong>Value:</strong> cf-waf-demo-user-{formData.domain}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigator.clipboard.writeText(`_cf-waf-verification.${formData.domain}`)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {formData.verificationMethod === 'meta' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h4 className="font-medium text-blue-900 mb-2">Meta Tag Verification</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Add this meta tag to your website's &lt;head&gt; section:
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <code className="text-sm">
                      &lt;meta name="cf-waf-verification" content="cf-waf-demo-user-{formData.domain}"&gt;
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigator.clipboard.writeText(`<meta name="cf-waf-verification" content="cf-waf-demo-user-${formData.domain}">`)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Tag
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep(0)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleVerifyDomain}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Verify Domain
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'cloudflare',
      title: 'Connect Cloudflare',
      description: 'Link your Cloudflare account to deploy protection',
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cloudflareToken">Cloudflare API Token</Label>
              <div className="relative mt-1">
                <Input
                  id="cloudflareToken"
                  type={formData.showToken ? 'text' : 'password'}
                  placeholder="Enter your Cloudflare API token"
                  value={formData.cloudflareToken}
                  onChange={(e) => updateFormData('cloudflareToken', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => updateFormData('showToken', !formData.showToken)}
                >
                  {formData.showToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Create a token with Zone:Zone:Edit and Zone:Zone:Read permissions
              </p>
            </div>
            
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <h4 className="font-medium text-amber-900 mb-2">Need Help?</h4>
                <p className="text-sm text-amber-700 mb-3">
                  Don't have a Cloudflare API token? Here's how to create one:
                </p>
                <ol className="text-sm text-amber-700 space-y-1">
                  <li>1. Go to Cloudflare Dashboard → My Profile → API Tokens</li>
                  <li>2. Click "Create Token"</li>
                  <li>3. Use "Custom token" template</li>
                  <li>4. Add permissions: Zone:Zone:Edit, Zone:Zone:Read</li>
                  <li>5. Include specific zone: {formData.domain}</li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => window.open('https://dash.cloudflare.com/profile/api-tokens', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Cloudflare Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleConnectCloudflare}
              disabled={!formData.cloudflareToken || loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Connect Account
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'templates',
      title: 'Choose Protection Rules',
      description: 'Select which bot protection rules to deploy',
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              {
                id: 'block_scrapers',
                name: 'Block Common Scrapers',
                description: 'Blocks known scraping bots and automated tools',
                icon: '🕷️'
              },
              {
                id: 'rate_limit_aggressive',
                name: 'Aggressive Rate Limiting',
                description: 'Limits requests to 10 per minute per IP',
                icon: '⚡'
              },
              {
                id: 'geo_block_suspicious',
                name: 'Block Suspicious Countries',
                description: 'Blocks traffic from high-risk countries',
                icon: '🌍'
              },
              {
                id: 'sql_injection_protection',
                name: 'SQL Injection Protection',
                description: 'Blocks common SQL injection attempts',
                icon: '🔒'
              },
              {
                id: 'xss_protection',
                name: 'XSS Protection',
                description: 'Blocks cross-site scripting attempts',
                icon: '🛡️'
              }
            ].map((template) => (
              <label key={template.id} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.selectedTemplates.includes(template.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData('selectedTemplates', [...formData.selectedTemplates, template.id]);
                    } else {
                      updateFormData('selectedTemplates', formData.selectedTemplates.filter(id => id !== template.id));
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{template.icon}</span>
                    <h4 className="font-medium">{template.name}</h4>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </div>
              </label>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleDeployWorkers}
              disabled={formData.selectedTemplates.length === 0 || loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Deploy Protection
            </Button>
          </div>
        </div>
      )
    }
  ];

  if (deploymentStatus === 'completed') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Deployment Complete!</h3>
        <p className="text-slate-600 mb-6">
          Your bot protection is now active on {formData.domain}
        </p>
        <div className="animate-pulse">
          <Loader2 className="w-6 h-6 mx-auto animate-spin" />
          <p className="text-sm text-slate-500 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          {steps.map((step) => (
            <span key={step.id} className="text-center flex-1">
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>{steps[currentStep].title}</span>
          </CardTitle>
          <p className="text-slate-600">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
          
          {steps[currentStep].component}
        </CardContent>
      </Card>
    </div>
  );
}
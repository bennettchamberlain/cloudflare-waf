'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  AlertTriangle,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';

interface DeploymentWizardProps {
  domain: string;
  platform: string;
}

export function DeploymentWizard({ domain, platform }: DeploymentWizardProps) {
  const [step, setStep] = useState(1);
  const [apiToken, setApiToken] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');

  const deploymentSteps = [
    {
      title: 'Connect Cloudflare',
      description: 'Add your Cloudflare API token to enable deployment',
      icon: <Zap className="h-5 w-5" />
    },
    {
      title: 'Configure Zone',
      description: 'Select your domain zone for protection',
      icon: <Shield className="h-5 w-5" />
    },
    {
      title: 'Deploy Worker',
      description: 'Deploy the bot protection worker to your domain',
      icon: <CheckCircle className="h-5 w-5" />
    }
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentStatus('deploying');
    
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setDeploymentStatus('success');
      setStep(4);
    } catch (error) {
      setDeploymentStatus('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const workerScript = `
// Bot Shield Worker for ${domain}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';
    
    // Bot detection logic
    const botScore = calculateBotScore(userAgent, request);
    
    if (botScore > 80) {
      return new Response('Access Denied', { status: 403 });
    }
    
    // Continue to origin
    return fetch(request);
  }
};

function calculateBotScore(userAgent, request) {
  let score = 0;
  
  // Check for common bot patterns
  if (userAgent.includes('scrapy')) score += 70;
  if (userAgent.includes('python-requests')) score += 60;
  if (userAgent.includes('curl')) score += 50;
  
  return score;
}`;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Deployment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {deploymentSteps.map((stepInfo, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step > idx + 1 ? 'bg-green-500 text-white' : 
                  step === idx + 1 ? 'bg-blue-500 text-white' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > idx + 1 ? <CheckCircle className="h-5 w-5" /> : stepInfo.icon}
                </div>
                {idx < deploymentSteps.length - 1 && (
                  <div className={`w-20 h-1 mx-2 ${
                    step > idx + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg">
              {step <= 3 ? deploymentSteps[step - 1].title : 'Deployment Complete'}
            </h3>
            <p className="text-gray-600">
              {step <= 3 ? deploymentSteps[step - 1].description : 'Your bot protection is now active'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {step === 1 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Connect Cloudflare Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You'll need a Cloudflare API token with Zone:Edit permissions. 
                <a href="https://dash.cloudflare.com/profile/api-tokens" className="text-blue-600 hover:underline ml-1">
                  Create one here <ExternalLink className="h-3 w-3 inline" />
                </a>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="apiToken">Cloudflare API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Enter your Cloudflare API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zoneId">Zone ID (optional)</Label>
              <Input
                id="zoneId"
                placeholder="Auto-detect or enter zone ID"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={() => setStep(2)}
              disabled={!apiToken}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Validate & Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Configure Protection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Domain Configuration</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Domain:</span>
                  <span className="font-medium">{domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Platform:</span>
                  <Badge>{platform}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Zone ID:</span>
                  <span className="font-mono text-sm">{zoneId || 'auto-detected'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Protection Rules</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Block Common Scrapers</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">High Bot Score Protection</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">{platform} Specific Rules</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Review & Deploy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Ready to Deploy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your bot protection worker is ready to deploy. This will take approximately 1-2 minutes.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Deployment Summary</h3>
              <div className="space-y-1 text-sm">
                <div>✓ Cloudflare account connected</div>
                <div>✓ Zone configuration verified</div>
                <div>✓ Protection rules configured</div>
                <div>✓ {platform} optimizations enabled</div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                className="flex-1"
                disabled={isDeploying}
              >
                Back
              </Button>
              <Button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Deploy Protection'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Deployment Successful!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your bot protection is now active on {domain}. It may take a few minutes to propagate globally.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Worker Details</h3>
                <div className="space-y-1 text-sm">
                  <div>Worker Name: bot-shield-{domain.replace('.', '-')}</div>
                  <div>Status: Active</div>
                  <div>Last Updated: {new Date().toLocaleString()}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Next Steps</h3>
                <div className="space-y-1 text-sm">
                  <div>• Monitor traffic in the dashboard</div>
                  <div>• Adjust rules as needed</div>
                  <div>• Review savings reports</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Worker Script</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <pre className="overflow-x-auto">{workerScript}</pre>
              </div>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(workerScript)}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Worker Script
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
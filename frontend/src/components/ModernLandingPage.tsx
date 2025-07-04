'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import DeploymentWizard from './DeploymentWizard';
import { 
  Shield, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  Clock,
  Users,
  Star,
  Sparkles,
  PlayCircle,
  ChevronRight,
  Globe,
  Bot,
  Lock,
  Gauge
} from 'lucide-react';

const platforms = [
  { id: 'webflow', name: 'Webflow', icon: '🎨', color: 'bg-purple-500' },
  { id: 'netlify', name: 'Netlify', icon: '⚡', color: 'bg-teal-500' },
  { id: 'vercel', name: 'Vercel', icon: '▲', color: 'bg-black' },
  { id: 'shopify', name: 'Shopify', icon: '🛍️', color: 'bg-green-500' },
  { id: 'other', name: 'Other', icon: '🌐', color: 'bg-blue-500' }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Freelance Designer",
    platform: "Webflow",
    savings: "$180/month",
    quote: "My bandwidth costs dropped 75% overnight. This is magic!"
  },
  {
    name: "Mike Rodriguez",
    role: "Startup Founder",
    platform: "Vercel",
    savings: "$240/month",
    quote: "Finally, no more surprise bills from bot traffic. Pure relief."
  },
  {
    name: "Lisa Park",
    role: "E-commerce Owner",
    platform: "Shopify",
    savings: "$160/month",
    quote: "Stopped scrapers from killing my site performance. Love it!"
  }
];

export default function ModernLandingPage() {
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [step, setStep] = useState(1);
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = (deployedDomain: string) => {
    setShowWizard(false);
    // Redirect to dashboard with the deployed domain
    window.location.href = `/dashboard?domain=${deployedDomain}`;
  };

  const handleOneClickDeploy = async () => {
    if (!domain || !selectedPlatform) return;
    
    setIsDeploying(true);
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDeploying(false);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BotShield
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden md:flex">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Stop wasting money on bot traffic
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              One-Click
            </span>
            <br />
            <span className="text-slate-800">Bot Protection</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Deploy enterprise-grade bot protection to your website in seconds. 
            <span className="font-semibold text-slate-800"> Save hundreds monthly</span> on bandwidth costs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => setShowWizard(true)}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Free Protection
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full"
            >
              <Clock className="w-5 h-5 mr-2" />
              See Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">2,500+</div>
              <div className="text-slate-600">Sites Protected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">$1.2M</div>
              <div className="text-slate-600">Total Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">99.9%</div>
              <div className="text-slate-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Wizard Overlay */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">Setup Bot Protection</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWizard(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6">
              <DeploymentWizard onComplete={handleWizardComplete} />
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose BotShield?</h2>
            <p className="text-xl text-slate-600">Enterprise-grade protection, consumer-friendly pricing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Deployment</h3>
              <p className="text-slate-600">Deploy in 30 seconds with our one-click installer. No technical knowledge required.</p>
            </Card>

            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Guaranteed Savings</h3>
              <p className="text-slate-600">Save 60-80% on bandwidth costs. Our customers save $100-300 monthly on average.</p>
            </Card>

            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Smart Protection</h3>
              <p className="text-slate-600">AI-powered bot detection that learns and adapts. Block malicious traffic, allow legitimate users.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Loved by Thousands</h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-slate-600">4.9/5 from 2,500+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{testimonial.savings}</div>
                      <div className="text-sm text-slate-500">saved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Stop Wasting Money?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of smart website owners who've already saved millions in bandwidth costs.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            onClick={() => setShowWizard(true)}
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Start Free Protection Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm mt-4 opacity-75">Free forever plan available • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">BotShield</span>
              </div>
              <p className="text-slate-400">Enterprise-grade bot protection made simple.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-slate-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Documentation</div>
                <div>API</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-slate-400">
                <div>Help Center</div>
                <div>Contact</div>
                <div>Status</div>
                <div>Community</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-slate-400">
                <div>About</div>
                <div>Blog</div>
                <div>Privacy</div>
                <div>Terms</div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 BotShield. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
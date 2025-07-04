import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // In a real app, get this from secure storage/state management
  const token = 'demo-token'; // Using demo token for now
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface DomainVerification {
  domain: string;
  verification_method: 'dns' | 'meta';
}

export interface CloudflareConnection {
  api_token: string;
  account_id?: string;
}

export interface WAFRuleTemplate {
  template_id: string;
  enabled: boolean;
  custom_settings?: Record<string, any>;
}

export interface AnalyticsStats {
  domain: string;
  period_days: number;
  total_requests: number;
  blocked_requests: number;
  bandwidth_saved_gb: number;
  top_blocked_countries: Array<{
    country: string;
    requests: number;
  }>;
  blocked_by_rule: Array<{
    rule: string;
    requests: number;
  }>;
  daily_stats: Array<{
    date: string;
    requests: number;
    blocked: number;
  }>;
}

// API functions
export const apiClient = {
  // Get WAF templates
  getTemplates: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  // Verify domain ownership
  verifyDomain: async (data: DomainVerification) => {
    const response = await api.post('/verify-domain', data);
    return response.data;
  },

  // Connect Cloudflare account
  connectCloudflare: async (data: CloudflareConnection) => {
    const response = await api.post('/connect-cloudflare', data);
    return response.data;
  },

  // Apply WAF rule
  applyWAFRule: async (data: WAFRuleTemplate) => {
    const response = await api.post('/apply-waf-rule', data);
    return response.data;
  },

  // Get analytics
  getStats: async (domain: string, days: number = 7) => {
    const response = await api.get('/get-stats', {
      params: { domain, days }
    });
    return response.data;
  },

  // Get user's active rules
  getUserRules: async () => {
    const response = await api.get('/user/rules');
    return response.data;
  },

  // Delete a rule
  deleteRule: async (ruleId: string) => {
    const response = await api.delete(`/rules/${ruleId}`);
    return response.data;
  }
};

export default api;
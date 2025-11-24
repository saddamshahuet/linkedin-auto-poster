import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    stripePriceId: null,
    features: {
      linkedinAccounts: 1,
      postsPerMonth: 10,
      storage: 1 * 1024 * 1024 * 1024, // 1 GB
      seats: 1,
      aiModels: ['llama3'],
      analytics: 'basic',
      support: 'community',
      calendarDays: 7,
    },
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 29,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO,
    features: {
      linkedinAccounts: 3,
      postsPerMonth: -1, // unlimited
      storage: 10 * 1024 * 1024 * 1024, // 10 GB
      seats: 1,
      aiModels: ['llama3', 'mistral', 'codellama'],
      analytics: 'advanced',
      support: 'email',
      calendarDays: 90,
      priorityPublishing: true,
    },
  },
  TEAM: {
    id: 'team',
    name: 'Team',
    price: 99,
    stripePriceId: process.env.STRIPE_PRICE_ID_TEAM,
    features: {
      linkedinAccounts: 10,
      postsPerMonth: -1, // unlimited
      storage: 50 * 1024 * 1024 * 1024, // 50 GB
      seats: 5,
      aiModels: ['llama3', 'mistral', 'codellama'],
      analytics: 'advanced',
      support: 'priority',
      calendarDays: 365,
      priorityPublishing: true,
      collaboration: true,
      approvalWorkflows: true,
      apiAccess: 'basic',
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // custom
    stripePriceId: null,
    features: {
      linkedinAccounts: -1, // unlimited
      postsPerMonth: -1, // unlimited
      storage: 500 * 1024 * 1024 * 1024, // 500 GB
      seats: -1, // unlimited
      aiModels: ['llama3', 'mistral', 'codellama', 'gpt-4', 'claude-3'],
      analytics: 'enterprise',
      support: 'dedicated',
      calendarDays: 365,
      priorityPublishing: true,
      collaboration: true,
      approvalWorkflows: true,
      apiAccess: 'full',
      whiteLabel: true,
      sso: true,
      customIntegrations: true,
      sla: true,
    },
  },
};

export default stripe;

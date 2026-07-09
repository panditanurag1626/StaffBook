import { FiFileText, FiZap, FiAward } from 'react-icons/fi';
import type { PricingPlan, ComparisonFeature, FAQItem } from '@/types/subscription';

export const PRICING_PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    basePrice: '₹0',
    monthlyPrice: '₹0',
    yearlyPrice: '₹0',
    description: 'Perfect for getting started with basic features',
    popular: false,
    icon: FiFileText,
    gradient: 'from-gray-400 to-gray-600',
    features: {
      included: [
        'Basic resume templates (2)',
        'Standard profile visibility',
        'Apply to unlimited jobs',
        'Basic job recommendations',
        'Email support',
      ],
      excluded: [
        'Premium templates',
        'Color customization',
        'Priority support',
        'Advanced analytics',
        'Resume download in multiple formats',
        'Featured profile',
      ],
    },
  },
  {
    id: 'professional' as const,
    name: 'Professional',
    basePrice: '₹499',
    monthlyPrice: '₹499',
    yearlyPrice: '₹4,999',
    description: 'Best for professionals seeking better opportunities',
    popular: true,
    icon: FiZap,
    gradient: 'from-gradient-start to-gradient-end',
    savings: {
      monthly: 0,
      yearly: 1000,
    },
    features: {
      included: [
        'All Free features',
        'Access to all premium templates (15+)',
        'Unlimited color customization',
        'Priority support (24/7)',
        'Advanced job matching',
        'Resume download (PDF, DOCX)',
        'Profile analytics & insights',
        'Featured profile badge',
        'Remove ads',
      ],
      excluded: [
        'Dedicated account manager',
        'Custom branding',
      ],
    },
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    basePrice: '₹999',
    monthlyPrice: '₹999',
    yearlyPrice: '₹9,999',
    description: 'For teams and organizations with advanced needs',
    popular: false,
    icon: FiAward,
    gradient: 'from-secondary to-gradient-end',
    savings: {
      monthly: 0,
      yearly: 2000,
    },
    features: {
      included: [
        'All Professional features',
        'Dedicated account manager',
        'Custom branding options',
        'API access',
        'Team collaboration tools',
        'Bulk resume creation',
        'Advanced reporting',
        'White-label solutions',
        'Custom integrations',
        'SLA guarantee',
      ],
      excluded: [],
    },
  },
] as const;

export const COMPARISON_FEATURES: readonly ComparisonFeature[] = [
  { feature: 'Resume Templates', free: '2', pro: '15+', enterprise: '15+' },
  { feature: 'Color Customization', free: false, pro: true, enterprise: true },
  { feature: 'Job Applications', free: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Priority Support', free: false, pro: true, enterprise: true },
  { feature: 'Profile Analytics', free: false, pro: true, enterprise: true },
  { feature: 'Download Formats', free: 'PDF', pro: 'PDF, DOCX', enterprise: 'All Formats' },
  { feature: 'Featured Profile', free: false, pro: true, enterprise: true },
  { feature: 'Dedicated Manager', free: false, pro: false, enterprise: true },
  { feature: 'API Access', free: false, pro: false, enterprise: true },
] as const;

export const FAQ_DATA: readonly FAQItem[] = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay.',
  },
  {
    question: 'Is there a refund policy?',
    answer: "Yes, we offer a 7-day money-back guarantee if you're not satisfied with our service.",
  },
  {
    question: 'Do you offer discounts for students?',
    answer: 'Yes! Students get 20% off on all paid plans. Contact support with your student ID for the discount code.',
  },
] as const;

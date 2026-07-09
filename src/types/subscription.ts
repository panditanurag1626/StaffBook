import { ElementType } from 'react';

export type BillingCycle = 'monthly' | 'yearly';
export type PlanId = 'free' | 'professional' | 'enterprise' | '';

export interface PricingFeatures {
  included: readonly string[];
  excluded: readonly string[];
}

export interface PlanSavings {
  monthly: number;
  yearly: number;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  popular: boolean;
  features: PricingFeatures;
  icon: ElementType; // React Icon component
  gradient: string;
  savings?: PlanSavings;
  basePrice?: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
}

export interface ComparisonFeature {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

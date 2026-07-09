'use client';

import React, { memo, useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import type { PricingPlan, BillingCycle, PlanId } from '@/types/subscription';
import Card from '../shared/Card';
import { THEME } from '@/styles/theme';

interface PricingCardProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  onSelect: (planId: PlanId) => void;
}

export const PricingCard = memo<PricingCardProps>(({ plan, billingCycle, onSelect }) => {
  const Icon = plan.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative transition-all duration-500 h-full flex flex-col ${
        plan.popular
          ? 'border-primary shadow-lg scale-105 z-10'
          : 'border-gray-200 hover:border-primary/50'
      } ${isHovered ? 'shadow-2xl translate-y-[-4px]' : ''}`}
      aria-labelledby={`plan-${plan.id}`}
      noPadding
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce-gentle z-20">
          <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
            Most Popular <span>⭐</span>
          </div>
        </div>
      )}

      <div className="p-8 flex flex-col h-full">
        {/* Icon with rotation effect */}
        <div
          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.gradient} text-white flex items-center justify-center mb-6 transition-transform duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}
          aria-hidden="true"
        >
          <Icon size={32} />
        </div>

        {/* Plan Name */}
        <h3 id={`plan-${plan.id}`} className={`${THEME.components.typography.sectionTitle} text-2xl mb-2`}>
          {plan.name}
        </h3>
        <p className={`${THEME.components.typography.body} mb-6 min-h-[40px]`}>{plan.description}</p>

        {/* Price with number animation */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${THEME.colors.text.main} number-appear`} aria-label={`Price: ${plan.price} ${plan.period}`}>
              {plan.price}
            </span>
            <span className={THEME.components.typography.body}>/ {plan.period}</span>
          </div>
          {billingCycle === 'yearly' && plan.id !== 'free' && plan.savings && (
            <p className="text-sm text-green-600 font-medium mt-2 bg-green-50 inline-block px-2 py-1 rounded-lg">
              Save {plan.savings?.yearly}%
            </p>
          )}
        </div>

        {/* CTA Button with ripple effect */}
        <button
          onClick={() => onSelect(plan.id)}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 mb-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary button-ripple ${
            plan.popular
              ? THEME.components.button.primary
              : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'
          }`}
          aria-label={`Select ${plan.name} plan`}
        >
          {plan.id === 'free' ? '✓ Current Plan' : '🚀 Get Started'}
        </button>

        {/* Features with hover effects */}
        <div className="space-y-4 mt-auto">
          <p className={`${THEME.components.typography.subheading} font-semibold`}>What&apos;s included:</p>
          <ul className="space-y-3" role="list">
            {plan.features.included.map((feature, index) => (
              <li 
                key={`included-${index}`} 
                className="flex items-start gap-3 feature-item group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-0.5 bg-green-100 rounded-full mt-0.5 group-hover:bg-green-200 transition-colors">
                  <FiCheck size={14} className="text-green-600" aria-hidden="true" />
                </div>
                <span className={`${THEME.components.typography.body} group-hover:text-gray-900 transition-colors`}>{feature}</span>
              </li>
            ))}
            {plan.features.excluded.map((feature, index) => (
              <li key={`excluded-${index}`} className="flex items-start gap-3 opacity-50">
                <div className="p-0.5 bg-gray-100 rounded-full mt-0.5">
                  <FiX size={14} className="text-gray-400" aria-hidden="true" />
                </div>
                <span className={THEME.components.typography.body}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
});

PricingCard.displayName = 'PricingCard';

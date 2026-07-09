'use client';

import React, { memo } from 'react';
import type { BillingCycle } from '@/types/subscription';
import { THEME } from '@/styles/theme';

interface BillingToggleProps {
  billingCycle: BillingCycle;
  onToggle: () => void;
}

export const BillingToggle = memo<BillingToggleProps>(({ billingCycle, onToggle }) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-12" role="group" aria-label="Billing cycle selection">
      <span 
        className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}
        id="billing-monthly"
      >
        Monthly
      </span>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={billingCycle === 'yearly'}
        aria-labelledby="billing-monthly billing-yearly"
        className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
          billingCycle === 'yearly' ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        <span className="sr-only">Toggle billing cycle</span>
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${
            billingCycle === 'yearly' ? 'translate-x-8' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <span 
        className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}
        id="billing-yearly"
      >
        Yearly
      </span>
      {billingCycle === 'yearly' && (
        <span 
          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm animate-pulse-slow"
          role="status"
          aria-live="polite"
        >
          Save 17%
        </span>
      )}
    </div>
  );
});

BillingToggle.displayName = 'BillingToggle';

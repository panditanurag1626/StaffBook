'use client';

import React, { memo, useState, useCallback } from 'react';
import { FiCreditCard, FiShield, FiLoader, FiCheck } from 'react-icons/fi';
import type { PricingPlan, BillingCycle } from '@/types/subscription';
import Card from '../shared/Card';
import { THEME } from '@/styles/theme';

interface PaymentSectionProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
}

export const PaymentSection = memo<PaymentSectionProps>(({ plan, billingCycle }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // TODO: Implement Razorpay payment gateway integration
      console.log('Processing payment for:', {
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        billingCycle,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Navigate to success page or show success message
      // router.push('/subscription/success');
      
    } catch (error) {
      console.error('Payment failed:', error);
      // TODO: Handle error - show error toast/notification
    } finally {
      setIsProcessing(false);
    }
  }, [plan, billingCycle]);

  return (
    <Card 
      id="payment-section" 
      className="mb-16 scroll-mt-24"
      aria-labelledby="payment-title"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <FiCreditCard size={32} />
        </div>
        <h2 
          id="payment-title"
          className={`${THEME.components.typography.sectionTitle} text-3xl`}
        >
          Complete Your Purchase
        </h2>
        <p className={`${THEME.components.typography.body} mt-2`}>
          Securely upgrade to {plan.name} plan
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        {/* Order Summary */}
        <div 
          className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8"
          role="region"
          aria-label="Order summary"
        >
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className={THEME.components.typography.body}>Selected Plan:</dt>
              <dd className="text-lg font-bold text-gray-900">{plan.name}</dd>
            </div>
            
            <div className="flex items-center justify-between">
              <dt className={THEME.components.typography.body}>Billing Cycle:</dt>
              <dd className="text-gray-900 capitalize font-medium">{billingCycle}</dd>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <dt className="text-gray-900 font-semibold">Total Amount:</dt>
                <dd className="text-3xl font-bold text-primary">
                  {plan.price}
                </dd>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-right text-sm text-green-600 mt-1">
                  Includes {plan.savings?.yearly}% yearly savings
                </p>
              )}
            </div>
          </dl>
        </div>

        {/* Payment Button */}
        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-4 px-6 ${THEME.components.button.primary} text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed`}
          aria-label="Proceed to payment"
        >
          {isProcessing ? (
            <>
              <FiLoader size={24} className="animate-spin" aria-hidden="true" />
              <span>Processing Secure Payment...</span>
            </>
          ) : (
            <>
              <FiCreditCard size={24} aria-hidden="true" />
              <span>Pay {plan.price} & Activate</span>
            </>
          )}
        </button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">
          <FiShield size={16} className="text-green-500" aria-hidden="true" />
          <span>Secure 256-bit SSL Encrypted Payment</span>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
            <div className={`w-8 h-8 rounded-full bg-indigo-50 ${THEME.components.icon.primary} flex items-center justify-center mb-2`}>
              <FiCheck size={16} />
            </div>
            <span className="text-xs text-gray-600">Instant Activation</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
            <div className={`w-8 h-8 rounded-full bg-indigo-50 ${THEME.components.icon.primary} flex items-center justify-center mb-2`}>
              <FiCheck size={16} />
            </div>
            <span className="text-xs text-gray-600">Cancel Anytime</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
            <div className={`w-8 h-8 rounded-full bg-indigo-50 ${THEME.components.icon.primary} flex items-center justify-center mb-2`}>
              <FiCheck size={16} />
            </div>
            <span className="text-xs text-gray-600">Money-back Guarantee</span>
          </div>
        </div>
      </div>
    </Card>
  );
});

PaymentSection.displayName = 'PaymentSection';

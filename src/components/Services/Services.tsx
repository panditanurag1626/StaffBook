'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SITE_CONFIG } from '../../constants/siteconfig';
import ServiceCard from '../shared/ServiceCard';
import { THEME } from '@/styles/theme';
import { subscriptionService, SubscriptionPlan } from '@/lib/api/services/subscriptionService';
import { initiatePhonePePayment, PhonePePaymentResult } from '@/lib/api/services/phonePeService';
import { FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentDetails {
  orderId: string;
  transactionId?: string;
  amount: number;
  planId: string | number;
  planName: string;
  status: 'initiated' | 'success' | 'failed' | 'cancelled';
  timestamp: string;
  userId: string;
  userName: string;
  phoneNumber?: string;
  rawResponse?: any;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Services() {
  const { services } = SITE_CONFIG;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isEmployer, user, refreshUser } = useAuth();

  const initialTab = searchParams.get('tab') || (isEmployer ? 'recruiters' : 'jobseekers');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [plansData, setPlansData] = useState<SubscriptionPlan[] | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Payment result state
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentDetails[]>([]);
  const [paymentToast, setPaymentToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // ── Fetch plans ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const userType = activeTab === 'recruiters' ? 'employer' : 'job_seeker';
        const response = await subscriptionService.getSubscriptionList(userType);
        if (response.data?.data?.data) {
          setPlansData(response.data.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch subscription plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [activeTab]);

  // ── Sync tab with URL ────────────────────────────────────────────────────────
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'recruiters' || tab === 'jobseekers') {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab(isEmployer ? 'recruiters' : 'jobseekers');
    }
  }, [searchParams, isEmployer]);

  // ── Auto-dismiss toast ───────────────────────────────────────────────────────
  useEffect(() => {
    if (paymentToast) {
      const t = setTimeout(() => setPaymentToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [paymentToast]);

  // ── Handle Buy Now ───────────────────────────────────────────────────────────
  const handleBuyNow = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setProcessingPayment(true);

    try {
      // 1. Fetch Plan Details to get exact amount with tax
      const planDetailsRes = await subscriptionService.getPlanDetails(plan.id);
      let amount = 0;

      const taxDetails = planDetailsRes.data?.data?.data?.tax_details || planDetailsRes.data?.data?.tax_details;

      if (taxDetails && taxDetails.total_amount) {
        amount = taxDetails.total_amount;
      } else {
        // Fallback
        const fallbackPrice = plan.effective_price ? plan.effective_price.toString() : plan.subscription_charges.toString();
        const amountMatch = fallbackPrice.match(/\d+/);
        amount = amountMatch ? parseInt(amountMatch[0]) : 0;
      }

      if (amount <= 0) {
        setPaymentToast({ type: 'error', message: 'Invalid plan amount. Please try again.' });
        setProcessingPayment(false);
        return;
      }

      // 2. Initiate PhonePe Payment
      const result: PhonePePaymentResult = await initiatePhonePePayment({
        amount,
        userId: user.id.toString(),
        userName: `${user.first_name} ${user.last_name}`,
        userPhone: user.phone || '',
        planName: plan.name,
        planId: plan.id,
      });

      // Build and store payment details
      const details: PaymentDetails = {
        orderId: result.orderId || '',
        transactionId: result.transactionId || '',
        amount,
        planId: plan.id,
        planName: plan.name,
        status: result.success ? 'success' : (result.status as any) || 'failed',
        timestamp: new Date().toISOString(),
        userId: user.id.toString(),
        userName: `${user.first_name} ${user.last_name}`,
        phoneNumber: user.phone || '',
        rawResponse: result.rawResponse,
      };

      setPaymentDetails(details);
      setPaymentHistory(prev => [details, ...prev]);

      if (result.success) {
        // 3. Confirm payment with our backend API
        try {
          const userType = activeTab === 'recruiters' ? 'employer' : 'job_seeker';

          await subscriptionService.buySubscription({
            plan_id: plan.id,
            payment_id: result.orderId || result.transactionId || `pay_${Date.now()}`,
            payment_method: 'PhonePe',
            transaction_id: result.transactionId || result.orderId || `txn_${Date.now()}`,
            payment_details: JSON.stringify({
              method: "PhonePe",
              bank: "N/A",
              card_last4: "N/A",
              transaction_id: result.transactionId || result.orderId || `txn_${Date.now()}`
            }),
            user_type: userType
          });

          await refreshUser();
          setShowSuccessDialog(true);
          console.log('✅ Subscription activated successfully:', details);
        } catch (confirmError: any) {
          console.error('Failed to confirm subscription with backend:', confirmError);
          setPaymentToast({ type: 'error', message: 'Payment succeeded but subscription activation failed. Please contact support.' });
        }
      } else if (result.status === 'cancelled') {
        setPaymentToast({ type: 'error', message: 'Payment was cancelled.' });
      } else {
        setPaymentToast({ type: 'error', message: result.error || 'Payment failed. Please try again.' });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentToast({ type: 'error', message: error.message || 'Failed to process payment.' });
    } finally {
      setProcessingPayment(false);
    }
  };

  // ── Map plan to ServiceCard props ────────────────────────────────────────────
  const mapPlanToCard = (plan: SubscriptionPlan) => {
    let features: string[] = [];

    if (plan.sections && plan.sections.length > 0) {
      features = plan.sections.flatMap(section => [
        section.section_name,
        ...(section.features?.map(f => `${f.feature_name} - ${f.feature_value}`) || []),
      ]);
    } else {
      features = plan.description
        .split('\r\n')
        .map(f => f.replace(/–/g, '-').trim())
        .filter(Boolean);
    }

    return {
      title: plan.name,
      features,
      price: `₹${plan.effective_price || plan.subscription_charges}`,
      originalPrice: (plan.effective_price && plan.subscription_charges && plan.effective_price !== plan.subscription_charges) ? plan.subscription_charges : undefined,
      image: plan.plan_image || '/images/dummy.png',
      popular: plan.is_popular,
      badgeText: plan.badge_text,
      badgeColor: plan.badge_color,
    };
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${THEME.colors.background.page} pt-20`}>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-20 pt-8">

        {/* ── Payment Processing Overlay ── */}
        {processingPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl max-w-sm w-full mx-4">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                <FiLoader className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <p className="text-lg font-bold text-gray-900">Opening PhonePe...</p>
              <p className="text-sm text-gray-500 text-center">
                Please complete your payment in the PhonePe window
              </p>
            </div>
          </div>
        )}

        {/* ── Success Dialog ── */}
        {showSuccessDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl max-w-sm w-full mx-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Payment Successful</h3>
              <p className="text-sm text-gray-500 text-center">
                Your subscription has been activated successfully.
              </p>
              <button
                onClick={() => {
                  window.location.href = '/networking';
                }}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* ── Toast Notification ── */}
        {paymentToast && (
          <div
            className={`fixed bottom-6 left-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl max-w-sm animate-in slide-in-from-left-4 duration-300 ${paymentToast.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
              }`}
          >
            {paymentToast.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <FiXCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-bold ${paymentToast.type === 'success' ? 'text-green-800' : 'text-red-700'}`}>
                {paymentToast.type === 'success' ? 'Payment Successful' : 'Payment Failed'}
              </p>
              <p className={`text-xs mt-0.5 ${paymentToast.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {paymentToast.message}
              </p>
            </div>
            <button
              onClick={() => setPaymentToast(null)}
              className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}



        {/* ── Main Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading premium plans...</p>
          </div>
        ) : (
          <section className="animate-fadeIn space-y-16">
            {plansData && plansData.length > 0 ? (
              <div>
                {/* ── Tab Switcher ── */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex rounded-xl bg-gray-100 p-1.5 shadow-inner">
                    <button
                      onClick={() => setActiveTab('jobseekers')}
                      className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                        activeTab === 'jobseekers'
                          ? 'bg-white text-purple-700 shadow-md'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      For Job Seekers
                    </button>
                    <button
                      onClick={() => setActiveTab('recruiters')}
                      className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                        activeTab === 'recruiters'
                          ? 'bg-white text-purple-700 shadow-md'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      For Recruiters
                    </button>
                  </div>
                </div>

                <div className="text-center mb-10">
                  <h2 className={`${THEME.components.typography.sectionTitle} text-xl md:text-2xl mb-3`}>
                    {activeTab === 'recruiters' ? 'Choose Your Recruitment Plan' : 'Job Seeker Plans'}
                  </h2>
                  <p className={`${THEME.components.typography.subheading} max-w-2xl mx-auto`}>
                    {activeTab === 'recruiters'
                      ? 'Select a plan that matches your hiring needs and recruitment goals.'
                      : 'Find better opportunities faster with our tailored job seeker subscription plans.'}
                  </p>
                </div>

                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                  {plansData.map(plan => (
                    <div key={plan.id} className="min-w-[85vw] sm:min-w-[350px] md:min-w-0 snap-center h-full">
                      <ServiceCard
                        {...mapPlanToCard(plan)}
                        onBuyNow={() => handleBuyNow(plan)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No subscription plans available at the moment.</p>
              </div>
            )}
          </section>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
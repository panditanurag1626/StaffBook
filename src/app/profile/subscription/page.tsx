'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { subscriptionService, SubscriptionPlan } from '@/lib/api/services/subscriptionService';
import { initiatePhonePePayment, PhonePePaymentResult } from '@/lib/api/services/phonePeService';
import {
  FiCheck, FiZap, FiAward, FiStar, FiShield, FiLoader, FiCheckCircle,
  FiXCircle, FiClock, FiArrowRight, FiTrendingUp, FiUsers, FiBriefcase
} from 'react-icons/fi';
import { FaCrown, FaRocket } from 'react-icons/fa';

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

const FEATURE_ICONS: Record<string, React.ElementType> = {
  'Job Posting': FiBriefcase,
  'Connection': FiUsers,
  'Contact': FiStar,
  'Premium': FaCrown,
};

function getPlanIcon(planName: string): React.ElementType {
  const name = planName.toLowerCase();
  if (name.includes('free')) return FiStar;
  if (name.includes('profession') || name.includes('pro')) return FiZap;
  if (name.includes('enterprise') || name.includes('premium')) return FaRocket;
  return FiAward;
}

function getPlanGradient(planName: string): string {
  const name = planName.toLowerCase();
  if (name.includes('free')) return 'from-slate-400 to-slate-500';
  if (name.includes('profession') || name.includes('pro')) return 'from-violet-600 to-indigo-600';
  if (name.includes('enterprise') || name.includes('premium')) return 'from-amber-500 to-orange-600';
  return 'from-purple-500 to-pink-500';
}

function getPlanAccent(planName: string): string {
  const name = planName.toLowerCase();
  if (name.includes('free')) return 'bg-slate-100 text-slate-700 border-slate-200';
  if (name.includes('profession') || name.includes('pro')) return 'bg-violet-50 text-violet-700 border-violet-200';
  if (name.includes('enterprise') || name.includes('premium')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-purple-50 text-purple-700 border-purple-200';
}

function getPlanBadgeStyle(planName: string): string {
  const name = planName.toLowerCase();
  if (name.includes('free')) return 'bg-slate-100 text-slate-600';
  if (name.includes('profession') || name.includes('pro')) return 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white';
  if (name.includes('enterprise') || name.includes('premium')) return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
  return 'bg-purple-100 text-purple-700';
}

function formatFeatureName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { isEmployer, user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'recruiters' | 'jobseekers'>('jobseekers');
  const [loading, setLoading] = useState(true);
  const [plansData, setPlansData] = useState<SubscriptionPlan[] | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentToast, setPaymentToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const tab = isEmployer ? 'recruiters' : 'jobseekers';
    setActiveTab(tab);
  }, [isEmployer]);

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

  useEffect(() => {
    if (paymentToast) {
      const t = setTimeout(() => setPaymentToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [paymentToast]);

  const handleBuyNow = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setProcessingPayment(true);
    try {
      const planDetailsRes = await subscriptionService.getPlanDetails(plan.id);
      let amount = 0;
      const taxDetails = planDetailsRes.data?.data?.data?.tax_details || planDetailsRes.data?.data?.tax_details;
      if (taxDetails && taxDetails.total_amount) {
        amount = taxDetails.total_amount;
      } else {
        const fallbackPrice = plan.effective_price ? plan.effective_price.toString() : plan.subscription_charges.toString();
        const amountMatch = fallbackPrice.match(/\d+/);
        amount = amountMatch ? parseInt(amountMatch[0]) : 0;
      }
      if (amount <= 0) {
        setPaymentToast({ type: 'error', message: 'Invalid plan amount. Please try again.' });
        setProcessingPayment(false);
        return;
      }
      const result: PhonePePaymentResult = await initiatePhonePePayment({
        amount,
        userId: user.id.toString(),
        userName: `${user.first_name} ${user.last_name}`,
        userPhone: user.phone || '',
        planName: plan.name,
        planId: plan.id,
      });
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
      if (result.success) {
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

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Navbar />

      {/* Payment Processing Overlay */}
      {processingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl max-w-sm w-full mx-4">
            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center">
              <FiLoader className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
            <p className="text-lg font-bold text-gray-900">Opening PhonePe...</p>
            <p className="text-sm text-gray-500 text-center">
              Please complete your payment in the PhonePe window
            </p>
          </div>
        </div>
      )}

      {/* Success Dialog */}
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
              onClick={() => { window.location.href = '/networking'; }}
              className="mt-4 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {paymentToast && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl max-w-sm animate-in slide-in-from-left-4 duration-300 ${
            paymentToast.type === 'success'
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-16 sm:py-20 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/10">
              <FaCrown size={14} className="text-yellow-300" />
              Premium Plans
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Unlock Your Full Potential
            </h1>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Choose the perfect plan that matches your goals. Upgrade, grow, and stand out with StaffBook&apos;s premium features.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-1 py-3">
            <button
              onClick={() => setActiveTab('jobseekers')}
              className={`relative px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                activeTab === 'jobseekers'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <FiTrendingUp size={16} />
                Job Seeker Plans
              </span>
            </button>
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`relative px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                activeTab === 'recruiters'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <FiUsers size={16} />
                Recruiter Plans
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="w-10 h-10 text-violet-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium text-base">Loading premium plans...</p>
          </div>
        ) : plansData && plansData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {plansData.map((plan, index) => {
              const Icon = getPlanIcon(plan.name);
              const gradient = getPlanGradient(plan.name);
              const accentStyle = getPlanAccent(plan.name);
              const badgeStyle = getPlanBadgeStyle(plan.name);
              const isPopular = plan.is_popular || plan.badge_text?.toLowerCase().includes('popular') || index === 1;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl bg-white border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isPopular ? 'border-violet-500 shadow-lg shadow-violet-200/50 scale-[1.02] md:scale-105 z-10' : 'border-gray-100 hover:border-violet-200'
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                        <FiStar size={12} className="text-yellow-300" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Card Header - Plan Icon & Name */}
                  <div className={`relative p-6 sm:p-8 pb-0 ${isPopular ? 'pt-8 sm:pt-10' : ''}`}>
                    <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white items-center justify-center shadow-lg mb-5`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {plan.description || `${plan.name} plan for ${activeTab === 'recruiters' ? 'employers' : 'job seekers'}`}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        ₹{plan.effective_price || plan.subscription_charges}
                      </span>
                      <span className="text-sm text-gray-400 font-medium">/month</span>
                    </div>
                    {plan.subscription_charges && plan.effective_price && plan.subscription_charges !== plan.effective_price && (
                      <p className="text-sm text-gray-400 line-through mb-1">
                        ₹{plan.subscription_charges}
                      </p>
                    )}
                    {plan.badge_text && !isPopular && (
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${badgeStyle}`}>
                        {plan.badge_text}
                      </span>
                    )}
                  </div>

                  {/* CTA Button - Prominent position right below header */}
                  <div className="px-6 sm:px-8 mt-5">
                    <button
                      onClick={() => handleBuyNow(plan)}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-violet-700 hover:to-indigo-700'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200'
                      }`}
                    >
                      {plan.is_free ? 'Current Plan' : 'Upgrade Plan'}
                      <FiArrowRight size={16} className={isPopular ? '' : 'group-hover:translate-x-0.5'} />
                    </button>
                  </div>

                  {/* Features */}
                  <div className="p-6 sm:p-8 pt-5 flex-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      What&apos;s included
                    </h4>
                    <ul className="space-y-3">
                      {plan.sections && plan.sections.length > 0 ? (
                        plan.sections.map((section, sIdx) => (
                          <li key={sIdx}>
                            {section.features && section.features.length > 0 ? (
                              <div className="space-y-2.5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  {section.section_name}
                                </p>
                                {section.features.map((feat, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="flex items-start gap-3"
                                  >
                                    <div className={`p-0.5 rounded-full mt-0.5 flex-shrink-0 ${accentStyle.split(' ')[0]}`}>
                                      <FiCheck size={13} className={accentStyle.split(' ')[1]} />
                                    </div>
                                    <span className="text-sm text-gray-600 leading-relaxed">
                                      {formatFeatureName(feat.feature_name)}
                                      {feat.feature_value && feat.feature_value !== '0' && feat.feature_value !== 'false' && (
                                        <span className="font-semibold text-gray-800"> — {feat.feature_value}</span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-start gap-3">
                                <div className={`p-0.5 rounded-full mt-0.5 flex-shrink-0 ${accentStyle.split(' ')[0]}`}>
                                  <FiCheck size={13} className={accentStyle.split(' ')[1]} />
                                </div>
                                <span className="text-sm text-gray-600 leading-relaxed">{section.section_name}</span>
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-3">
                          <div className={`p-0.5 rounded-full mt-0.5 flex-shrink-0 ${accentStyle.split(' ')[0]}`}>
                            <FiCheck size={13} className={accentStyle.split(' ')[1]} />
                          </div>
                          <span className="text-sm text-gray-600 leading-relaxed">
                            {plan.description || 'Full access to all features'}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Enterprise Premium Illustration */}
                  {plan.name.toLowerCase().includes('enterprise') && (
                    <div className="mx-6 sm:mx-8 mb-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <FaRocket size={22} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">Enterprise-Grade Power</h4>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Dedicated account manager, API access, team collaboration tools, custom branding, and white-label solutions for your organization.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FiClock size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No subscription plans available at the moment.</p>
            <p className="text-gray-400 text-sm mt-1">Please check back later.</p>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-16 sm:pb-20">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <FiShield size={24} className="text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Secure Payments</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  256-bit SSL encrypted transactions via PhonePe
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FiCheckCircle size={24} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Instant Activation</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your plan activates immediately after payment
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <FiClock size={24} className="text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Cancel Anytime</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  No long-term commitment. Cancel whenever you want
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

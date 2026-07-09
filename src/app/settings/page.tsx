'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/api/services/userService';
import { subscriptionService } from '@/lib/api/services/subscriptionService';
import toast from 'react-hot-toast';
import ProfileLayout from '@/components/shared/ProfileLayout';
import { THEME } from '@/styles/theme';
import {
  FiUser,
  FiLock,
  FiCreditCard,
  FiStar,
  FiAlertTriangle,
  FiX,
  FiDownload,
  FiCalendar
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

type SettingsTab = 'general' | 'billing';

export default function SettingsPage() {
  const { user, isEmployer, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchPaymentHistory();
    }
  }, [activeTab]);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await subscriptionService.getPaymentHistory();
      // Adjust based on typical ApiResponse structure
      if (res.data?.status === 200 || res.status === 200) {
        const historyData = res.data?.data?.history || [];
        setPaymentHistory(Array.isArray(historyData) ? historyData : []);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FiUser size={18} /> },
    // { id: 'security', label: 'Security', icon: <FiLock size={18} /> },

    { id: 'billing', label: 'Billing', icon: <FiCreditCard size={18} /> },
  ];

  // Mock user data for the settings form
  const [formData, setFormData] = useState({
    name: user ? `${user.first_name} ${user.last_name}` : '',
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleSaveName = async () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      toast.error('Name cannot be empty.');
      return;
    }
    if (trimmedName.length > 32) {
      toast.error('Name must be 32 characters or less.');
      return;
    }
    try {
      setIsSavingName(true);
      await userService.editProfile({ name: trimmedName });
      await refreshUser();
      toast.success('Name updated successfully!');
    } catch (err: any) {
      console.error('Edit profile error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await userService.deleteAccount();
      localStorage.clear();
      toast.success("Account deleted successfully.");
      router.push('/');
    } catch (err: any) {
      console.error("Delete account error:", err);
      toast.error(err?.response?.data?.message || 'Failed to delete account.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const renderGeneral = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Profile Picture Card */}
      {/* <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6">
          <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-1`}>Avatar</h3>
          <p className={`${THEME.colors.text.secondary} text-sm mb-6`}>This is your avatar. Click on the avatar to upload a custom one from your files.</p>
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                <Image
                  src={user?.picture || '/images/user_profile_placeholder.jpeg'}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FiUpload className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-[200px]">An avatar is optional but strongly recommended.</p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-500">Square images are best. Max 10MB.</p>
          <button className="bg-white hover:bg-purple-50 text-purple-600 px-4 py-1.5 rounded-lg border border-purple-200 text-sm font-semibold transition-colors">
            Upload
          </button>
        </div>
      </section> */}

      {/* Name Card */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6">
          <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-1`}>Profile Display Name</h3>
          <p className={`${THEME.colors.text.secondary} text-sm mb-6`}>Enter your full name or the name you’d
            like others to see on your profile.</p>
          <div className="max-w-md">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={THEME.components.input.default}
              placeholder="Your Name"
            />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-500">Maximum 32 characters allowed.</p>
          <button
            onClick={handleSaveName}
            disabled={isSavingName || !formData.name.trim()}
            className={`${THEME.components.button.primary} !rounded-lg !py-1.5 !px-6 !text-sm shadow-none disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSavingName ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </section>

      {/* Username Card */}
      {/* <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6">
          <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-1`}>Profile URL / Username</h3>
          <p className={`${THEME.colors.text.secondary} text-sm mb-6`}>This will be your unique profile URL.</p>
          <div className="flex items-center gap-0 w-full max-w-md">
            <span className="bg-gray-50 px-3 py-2 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 text-sm font-medium h-[46px] flex items-center">staffbook.in/</span>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`${THEME.components.input.default} !rounded-l-none !rounded-r-xl`}
              placeholder="username"
            />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-500">Maximum 48 characters allowed.</p>
          <button className={`${THEME.components.button.primary} !rounded-lg !py-1.5 !px-6 !text-sm shadow-none`}>
            Save Changes
          </button>
        </div>
      </section> */}

      {/* Danger Zone */}
      <section className="bg-white rounded-lg border border-red-200 overflow-hidden shadow-sm">
        <div className="p-6">
          <h3 className="text-xl font-bold text-red-600 mb-1">Delete Account</h3>
          <p className="text-gray-500 text-sm mb-6">Permanently remove your account and all of its contents from Staff Book. This action is not reversible.</p>
        </div>
        <div className="bg-red-50 px-6 py-3 border-t border-red-100 flex justify-end items-center">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Change Password Card */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6">
          <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-1`}>Change Password</h3>
          <p className={`${THEME.colors.text.body} text-sm mb-6`}>Update your password to keep your account secure.</p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 ml-1">Current Password</label>
              <input type="password" placeholder="••••••••" className={THEME.components.input.default} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 ml-1">New Password</label>
              <input type="password" placeholder="Enter new password" className={THEME.components.input.default} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 ml-1">Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" className={THEME.components.input.default} />
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button className={`${THEME.components.button.primary} !rounded-lg !py-1.5 !px-6 !text-sm shadow-none`}>
            Update Password
          </button>
        </div>
      </section>

      {/* Two-Factor Authentication Card */}
      {/* <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6">
          <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-1`}>Two-Factor Authentication (2FA)</h3>
          <p className={`${THEME.colors.text.body} text-sm mb-6`}>Add an extra layer of security to protect
            your account.</p>
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <FiLock className="text-purple-400" />
            <span className="text-sm text-purple-700 font-medium">No two-factor authentication methods
              are set up.</span>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button className="bg-white hover:bg-purple-50 text-purple-600 px-4 py-1.5 rounded-lg border border-purple-200 text-sm font-semibold transition-colors">
            Set Up Two-Factor Authentication
          </button>
        </div>
      </section> */}
    </div>
  );

  const isPlanExpired = (expiryDate: string | undefined | null) => {
    if (!expiryDate) return false;
    try {
      return new Date(expiryDate) < new Date();
    } catch {
      return false;
    }
  };

  const renderBalanceStats = () => {
    if (!user) return null;

    const stats: { label: string; value: React.ReactNode }[] = [];

    const formatValue = (used: number, total: number) => {
      if (total === -1) return <span className="text-2xl font-medium">∞</span>;
      return `${used} / ${total}`;
    };

    if (isEmployer) {
      const bal = user.user_balance_employer;
      if (bal && isPlanExpired(bal.plan_expiry_date)) {
        return <div className="col-span-full py-4 text-center"><button onClick={() => setShowExpiredModal(true)} className="text-red-500 hover:text-red-600 underline text-sm font-medium">Your Subscription Has Expired. Renew Your Plan to Continue.</button></div>;
      }
      if (bal) {
        const pushItem = (label: string, used: number, total: number) => {
          if (total > 0 || total === -1) stats.push({ label, value: formatValue(used, total) });
        };
        const pushBooleanItem = (label: string, available: number) => {
          if (available > 0) stats.push({ label, value: "Included" });
        };

        pushItem("Job Postings", bal.job_posting_used, bal.job_posting_total);
        if (bal.live_chat_unlimited > 0) pushItem("Live Chat", bal.live_chat_used, -1);
        pushItem("Contact", bal.show_contact_used, bal.show_contact_total);
        pushItem("Connection Invites", bal.send_invite_used, bal.send_invite_total);
        pushItem("Schedule Meeting", bal.schedule_meeting_used, bal.schedule_meeting_total);
        pushItem("Email", bal.email_used, bal.email_total);
        pushItem("Resume Downloads", bal.download_cv_used, bal.download_cv_total);
        pushItem("Ad Banners", bal.bottom_banner_used, bal.bottom_banner_available);
        pushItem("Slider Banners", bal.slider_banner_used, bal.slider_banner_available);
        pushBooleanItem("Bulk Downloads", bal.bulk_download_available);
        pushBooleanItem("Bulk Actions", bal.bulk_actions_available);
      }
    } else {
      const bal = user.user_balance_job_seeker;
      if (bal && isPlanExpired(bal.plan_expiry_date)) {
        return <div className="col-span-full py-4 text-center"><button onClick={() => setShowExpiredModal(true)} className="text-red-500 hover:text-red-600 underline text-sm font-medium">Your Subscription Has Expired. Renew Your Plan to Continue.</button></div>;
      }
      if (bal) {
        const addStat = (label: string, value1: number | string, value2?: number | string) => {
          let display1 = value1 === -1 ? <span className="text-2xl font-medium">∞</span> : value1;
          let display2 = value2 === -1 ? <span className="text-2xl font-medium">∞</span> : value2;

          let content;
          if (value2 !== undefined) {
            if (value2 === -1) {
              content = display2;
            } else {
              content = <>{display1} / {display2}</>;
            }
          } else {
            content = display1;
          }
          stats.push({ label, value: content });
        };

        if (bal.ats_resume_available !== undefined && bal.ats_resume_available !== 0) addStat("ATS Resume", bal.ats_resume_available);
        if (bal.email_total !== undefined && bal.email_total !== 0) addStat("Email", bal.email_used, bal.email_total);
        if (bal.live_chat_unlimited > 0) addStat("Live Chat", 0, -1);
        if (bal.networking_max_range !== undefined && bal.networking_max_range !== 0) addStat("Networking Range", bal.networking_min_range, bal.networking_max_range);
        if (bal.schedule_meeting_total !== undefined && bal.schedule_meeting_total !== 0) addStat("Meetings", bal.schedule_meeting_used, bal.schedule_meeting_total);
        if (bal.search_appears_available !== undefined && bal.search_appears_available !== 0) addStat("Search Appearances", "Included");
        if (bal.send_invite_total !== undefined && bal.send_invite_total !== 0) addStat("Connection Invites", bal.send_invite_used, bal.send_invite_total);
        if (bal.show_contact_total !== undefined && bal.show_contact_total !== 0) addStat("Contact", bal.show_contact_used, bal.show_contact_total);
      }
    }

    if (stats.length === 0) {
      return <div className="col-span-full py-4 text-center text-gray-500 text-sm">No active plan limits to display.</div>;
    }

    return stats.map((stat, idx) => (
      <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
        <span className={`text-xl font-black mb-1.5 ${stat.value === 'Included' ? 'text-green-600' : 'text-purple-600'}`}>
          {stat.value}
        </span>
        <span className="text-[10px] font-bold text-gray-400 leading-tight uppercase tracking-widest">{stat.label}</span>
      </div>
    ));
  };

  return (
    <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
      <div className="min-h-screen bg-gray-50/50 pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          </header>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                      }`}
                  >
                    <span className={activeTab === tab.id ? 'text-black' : 'text-gray-400'}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 max-w-3xl">
              {activeTab === 'general' && renderGeneral()}
              {/* {activeTab === 'security' && renderSecurity()} */}

              {activeTab === 'billing' && (
                <div className="space-y-6 animate-fadeIn">
                  <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-1`}>Current Plan</h3>
                        <p className={`${THEME.colors.text.body} text-sm`}>Manage your subscription and billing details.</p>
                      </div>
                      <div className="flex flex-col items-start md:items-end">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-purple-700 rounded-xl border border-purple-100/50 shadow-inner font-black text-sm uppercase tracking-wider flex items-center gap-2">
                          <FiStar size={16} className="text-yellow-500 fill-current" />
                          {(() => {
                            const bal = isEmployer ? user?.user_balance_employer : user?.user_balance_job_seeker;
                            if (!bal) return 'Free Plan';
                            if (isPlanExpired(bal.plan_expiry_date)) return <button onClick={() => setShowExpiredModal(true)} className="text-red-500 hover:text-red-600 underline">Your Subscription Has Expired. Renew Your Plan to Continue.</button>;
                            return bal.plan_name || 'Free Plan';
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50/50">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Plan Quota & Balances</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                        {renderBalanceStats()}
                      </div>

                      {/* Plan Dates */}
                      {(() => {
                        const bal = isEmployer ? user?.user_balance_employer : user?.user_balance_job_seeker;
                        if (!bal || (!bal.plan_purchased_date && !bal.plan_expiry_date)) return null;

                        const renderDate = (dateString?: string | null) => {
                          if (!dateString) return null;
                          try {
                            const date = new Date(dateString);
                            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                          } catch (e) {
                            return dateString;
                          }
                        };

                        return (
                          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between text-xs font-medium px-1">
                            {bal.plan_purchased_date && (
                              <div>
                                <span className="text-gray-400 uppercase tracking-widest block mb-1">Purchased</span>
                                <span className="text-gray-900 text-sm font-bold">{renderDate(bal.plan_purchased_date)}</span>
                              </div>
                            )}
                            {bal.plan_expiry_date && (
                              <div className="text-right">
                                <span className="text-gray-400 uppercase tracking-widest block mb-1">Expiry</span>
                                <span className={`text-sm font-bold ${isPlanExpired(bal.plan_expiry_date) ? 'text-red-500' : 'text-purple-600'}`}>
                                  {renderDate(bal.plan_expiry_date)}
                                  {isPlanExpired(bal.plan_expiry_date) && <span className="ml-2 text-[10px] text-white bg-red-500 px-2 py-0.5 rounded-full">Expired</span>}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </section>

                  {/* Transaction History Section */}
                  <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm animate-fadeIn">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-1`}>Transaction History</h3>
                      <p className={`${THEME.colors.text.body} text-sm`}>View and download your past subscription invoices.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Plan</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {isLoadingHistory ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-10 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-sm text-gray-500 font-medium tracking-wide">Loading transactions...</span>
                                </div>
                              </td>
                            </tr>
                          ) : paymentHistory.length > 0 ? (
                            paymentHistory.map((history, idx) => (
                              <tr key={history.id || idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900 leading-tight mb-0.5">{history.plan_name || 'Subscription Plan'}</span>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">ID: {history.transaction_id || history.payment_id || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <FiCalendar size={14} className="text-gray-400" />
                                    <span className="text-sm font-medium">
                                      {history.purchased_at ? new Date(history.purchased_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-sm font-bold text-gray-900">
                                    {history.currency || 'INR'} {history.total_amount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {history.invoice_url || history.download_invoice_url ? (
                                    <a 
                                      href={history.invoice_url || history.download_invoice_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 hover:bg-purple-100 transition-all font-bold text-xs"
                                    >
                                      <FiDownload size={14} />
                                      View Invoice
                                    </a>
                                  ) : (
                                    <span className="text-xs text-gray-400 font-medium italic">Not Available</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center gap-2 opacity-60">
                                  <FiCreditCard size={32} className="text-gray-300 mb-2" />
                                  <p className="text-sm text-gray-500 font-medium tracking-wide">No transaction history found.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isDeletingAccount}
            >
              <FiX size={20} />
            </button>
            <div className="p-6 pt-8">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                <FiAlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to permanently delete your
                account?
                This action cannot be undone and will remove all your
                data, including your profile, subscriptions, and progress
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeletingAccount}
                  className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expired Subscription Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowExpiredModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
            <div className="p-6 pt-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6 mx-auto">
                <FiAlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Subscription Expired</h3>
              <p className="text-gray-600 text-base mb-8 leading-relaxed">
                Your Subscription Has Expired.<br />
                Renew Your Plan to Continue.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setShowExpiredModal(false); router.push('/premium-services'); }}
                  className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                >
                  View Plans
                </button>
                <button
                  onClick={() => setShowExpiredModal(false)}
                  className="w-full px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
}

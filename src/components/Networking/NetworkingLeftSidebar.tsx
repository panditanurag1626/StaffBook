'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiChevronRight, FiBriefcase, FiRefreshCw, FiStar } from 'react-icons/fi';
import { THEME } from '../../styles/theme';
import EmployerVerificationModal from '../shared/EmployerVerificationModal';
import { ChevronDown } from 'lucide-react';
import { userService } from '@/lib/api/services/userService';
import toast from 'react-hot-toast';

const NetworkingLeftSidebar: React.FC = () => {
  const router = useRouter();
  const { user, isEmployer, setIsEmployer, isOnline, setIsOnline, profileLabel, setProfileLabel, completionPercentage, refreshUser } = useAuth();

  // Profile Mode & Display State - removed local state, now using context
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Accordion State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);

  // Profile label logic handled in context and persisted in localStorage

  const handleEmployerSwitch = async () => {
    if (!user) return;

    // If backend considers them an employer, they can swap freely
    if (user.user_type === 'employer') {
      if (isEmployer) {
        setIsEmployer(false);
        router.push('/profile/jobs');
      } else {
        setIsEmployer(true);
        router.push('/profile/find-candidates');
      }
      await refreshUser();
      return;
    }

    // If backend considers them a job_seeker, they must upgrade
    if (!isEmployer) {
      setShowVerificationModal(true);
    } else {
      setIsEmployer(false);
      router.push('/profile/jobs');
      await refreshUser();
    }
  };

  const handleVerificationSuccess = async (details: { companyName: string; gstNumber: string }) => {
    console.log("Verified Employer Details:", details);
    setIsEmployer(true);
    setShowVerificationModal(false);
    await refreshUser();
    router.push('/profile/find-candidates');
  };

  const isUpdatingRef = React.useRef(false);

  const handleProfileLabelChange = async (label: string) => {
    if (isUpdatingRef.current) return;

    const isCurrent = user?.user_mode_type === label || (label === 'None' && !user?.user_mode_type);
    if (isCurrent) return;

    isUpdatingRef.current = true;
    setProfileLabel(label);
    try {
      await userService.updateUserModeType(label);
      await refreshUser();
      toast.success('Profile status updated');
    } catch (error) {
      console.error('Failed to update profile status:', error);
      toast.error('Failed to update profile status');
    } finally {
      isUpdatingRef.current = false;
    }
  };

  if (!user) return null;

  // Render Features Helper
  const isPlanExpired = (expiryDate: string | undefined | null) => {
    if (!expiryDate) return false;
    try {
      return new Date(expiryDate) < new Date();
    } catch {
      return false;
    }
  };

  const renderFeaturesList = () => {
    let dates: { purchased: string | null; expiry: string | null } = { purchased: null, expiry: null };

    const renderDate = (dateString?: string | null) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      } catch (e) {
        return dateString;
      }
    };

    if (isEmployer) {
      const items: { label: string; used: number; total: number; isBoolean: boolean }[] = [];
      const pushItem = (label: string, used: number, total: number) => {
        if (total > 0 || total === -1) items.push({ label, used, total, isBoolean: false });
      };
      const pushBooleanItem = (label: string, available: number) => {
        if (available > 0) items.push({ label, used: 0, total: -1, isBoolean: true });
      };

      const bal = user.user_balance_employer;
      if (bal && isPlanExpired(bal.plan_expiry_date)) {
        return <p className="text-sm text-center py-4"><Link href="/premium-services" className="text-red-500 hover:text-red-600 underline font-medium">Your Subscription Has Expired. Renew Your Plan to Continue.</Link></p>;
      }
      if (bal) {
        dates.purchased = bal.plan_purchased_date;
        dates.expiry = bal.plan_expiry_date;
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

      if (items.length === 0) {
        return <p className="text-sm text-gray-500 text-center py-4">You're currently not
          subscribed.
          Upgrade to unlock
          features</p>;
      }

      const scrollbarStyles = `
        .balance-scrollbar::-webkit-scrollbar { width: 6px; }
        .balance-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.03); border-radius: 20px; }
        .balance-scrollbar::-webkit-scrollbar-thumb { background-color: #c084fc; border-radius: 20px; border: 1px solid rgba(0, 0, 0, 0.05); }
        .balance-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #a855f7; }
      `;

      return (
        <>
          <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 balance-scrollbar">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50/70 hover:bg-white border border-gray-100 hover:shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] rounded-xl transition-all duration-200 group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                  {item.label}
                </span>
                {item.isBoolean ? (
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Included
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                    {item.total === -1 ? (
                      <span className="text-lg leading-none relative -top-[1.5px] font-medium">∞</span>
                    ) : (
                      <>{item.used} / {item.total}</>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
          {(dates.purchased || dates.expiry) && (
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2.5">
              {dates.purchased && (
                <div className="flex justify-between items-center px-1 text-sm font-medium text-gray-700">
                  <span>Purchase Date</span>
                  <span className="text-purple-600">{renderDate(dates.purchased)}</span>
                </div>
              )}
              {dates.expiry && (
                <div className="flex justify-between items-center px-1 text-sm font-medium text-gray-700">
                  <span>Expiry Date</span>
                  <span className={`${isPlanExpired(dates.expiry) ? 'text-red-500' : 'text-purple-600'}`}>
                    {renderDate(dates.expiry)}
                    {isPlanExpired(dates.expiry) && <span className="ml-2 text-[10px] text-white bg-red-500 px-2 py-0.5 rounded-full">Expired</span>}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      );
    } else {
      // Job Seeker specialized formatting
      const bal = user.user_balance_job_seeker;

      if (!bal) {
        return <p className="text-sm text-gray-500 text-center py-4">No active plan limits to display.</p>;
      }

      if (isPlanExpired(bal.plan_expiry_date)) {
        return <p className="text-sm text-center py-4"><Link href="/premium-services" className="text-red-500 hover:text-red-600 underline font-medium">Your Subscription Has Expired. Renew Your Plan to Continue.</Link></p>;
      }

      dates.purchased = bal.plan_purchased_date;
      dates.expiry = bal.plan_expiry_date;

      const items: { label: string; content: React.ReactNode }[] = [];

      const addStat = (label: string, value1: number | string, value2?: number | string) => {
        let display1 = value1 === -1 ? <span className="text-lg leading-none ml-1 relative -top-[1.5px] font-medium">∞</span> : value1;
        let display2 = value2 === -1 ? <span className="text-lg leading-none ml-1 relative -top-[1.5px] font-medium">∞</span> : value2;

        let content;
        if (value2 !== undefined) {
          if (value2 === -1) {
            content = <span className="flex items-center text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">{display2}</span>;
          } else {
            content = <span className="flex items-center text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">{display1} / {display2}</span>;
          }
        } else {
          content = <span className="flex items-center text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">{display1}</span>;
        }
        items.push({ label, content });
      };

      if (bal.ats_resume_available !== undefined && bal.ats_resume_available !== 0) addStat("ATS Resume", bal.ats_resume_available);
      if (bal.email_total !== undefined && bal.email_total !== 0) addStat("Email", bal.email_used, bal.email_total);
      if (bal.live_chat_unlimited > 0) addStat("Live Chat", 0, -1);
      if (bal.networking_max_range !== undefined && bal.networking_max_range !== 0) addStat("Networking Range", bal.networking_min_range, bal.networking_max_range);
      if (bal.schedule_meeting_total !== undefined && bal.schedule_meeting_total !== 0) addStat("Schedule Meetings", bal.schedule_meeting_used, bal.schedule_meeting_total);
      if (bal.search_appears_available !== undefined && bal.search_appears_available !== 0) addStat("Search Appearances", "Included");
      if (bal.send_invite_total !== undefined && bal.send_invite_total !== 0) addStat("Connection Invites", bal.send_invite_used, bal.send_invite_total);
      if (bal.show_contact_total !== undefined && bal.show_contact_total !== 0) addStat("Contact", bal.show_contact_used, bal.show_contact_total);

      if (items.length === 0) {
        return <p className="text-sm text-gray-500 text-center py-4">No active plan limits to display.</p>;
      }

      const scrollbarStyles = `
        .balance-scrollbar::-webkit-scrollbar { width: 6px; }
        .balance-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.03); border-radius: 20px; }
        .balance-scrollbar::-webkit-scrollbar-thumb { background-color: #c084fc; border-radius: 20px; border: 1px solid rgba(0, 0, 0, 0.05); }
        .balance-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #a855f7; }
      `;

      return (
        <>
          <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 balance-scrollbar">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50/70 hover:bg-white border border-gray-100 hover:shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] rounded-xl transition-all duration-200 group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                  {item.label}
                </span>
                {item.content}
              </div>
            ))}
          </div>
          {(dates.purchased || dates.expiry) && (
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2.5">
              {dates.purchased && (
                <div className="flex justify-between items-center px-1 text-sm font-medium text-gray-700">
                  <span>Purchase Date</span>
                  <span className="text-purple-600">{renderDate(dates.purchased)}</span>
                </div>
              )}
              {dates.expiry && (
                <div className="flex justify-between items-center px-1 text-sm font-medium text-gray-700">
                  <span>Expiry Date</span>
                  <span className={`${isPlanExpired(dates.expiry) ? 'text-red-500' : 'text-purple-600'}`}>
                    {renderDate(dates.expiry)}
                    {isPlanExpired(dates.expiry) && <span className="ml-2 text-[10px] text-white bg-red-500 px-2 py-0.5 rounded-full">Expired</span>}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="flex flex-col gap-2 pb-28 lg:pb-4">
      {/* Profile Card */}
      <div className={`${THEME.components.card.default} overflow-hidden relative !p-0`}>
        {/* Cover Image */}
        <div className="h-24 relative w-full">
          <Image
            src={user.backpicture || "/images/user_bg_placeholder.jpeg"}
            alt="Cover"
            fill
            className="object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="px-4 sm:px-5 pb-4 text-center relative">
          <div className="relative -mt-10 mb-3 inline-block">
            <div className="relative w-[84px] h-[84px] mx-auto shadow-md rounded-full">
              <div className="relative w-full h-full rounded-full overflow-hidden z-20">
                <Image
                  src={user.picture || "/images/user_profile_placeholder.jpeg"}
                  alt={`${user.first_name} ${user.last_name}`}
                  fill
                  className="object-cover"
                />
                {/* Online Indicator */}
                {isOnline && (
                  <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></div>
                )}
              </div>

              {/* Profile Label Frame - Option 2: Modern Gradient Arc */}
              {(user.user_mode_type === 'Ready To Join' || user.user_mode_type === 'Actively Hiring') && (
                <div className="absolute inset-[-4px] z-20 pointer-events-none rotate-45">
                  <Image
                    src={user.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                    alt={user.user_mode_type}
                    fill
                    className="object-contain drop-shadow-md -rotate-[15deg]"
                  />
                </div>
              )}

              {/* Progress badge */}
              <div className={`absolute left-1/2 -bottom-2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 border border-green-200 text-green-600 font-bold text-[10px] shadow-sm text-center whitespace-nowrap z-30`}>
                {completionPercentage}%
              </div>
            </div>
          </div>

          <h3 className={`font-semibold text-xs sm:text-sm text-gray-700 hover:underline cursor-pointer flex items-center gap-1 text-center justify-center`}>
            {user.first_name} {user.last_name}
            {user.is_premium && (
              <Image
                src="/staffbook-premium.png"
                alt="Premium"
                width={15}
                height={15}
                className="object-contain"
              />
            )}
          </h3>
          <p className="text-sm font-medium text-gray-700 mt-1 mb-4">
            {user.designation || "No Designation Provide"}
          </p>
          <p className="text-sm font-medium text-gray-700 mt-1 mb-4">
            {user?.headline || "No headline added"}
          </p>

          <Link href="/profile" className={`${THEME.components.button.primary} py-2 px-4 mb-4 text-center font-medium text-sm`}>
            View Profile
          </Link>


          <div className="pt-3 text-left space-y-1">
            <Link href="/connections?tab=connections" className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Connection</span>
              <span className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{user.totalConnection || 0}</span>
            </Link>
            <Link href="/profile?tab=posts" className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Total Post</span>
              <span className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{user.totalActivePost}</span>
            </Link>
            {isEmployer && (
              <Link href="/profile/find-candidates?tab=manage-jobs" className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Posted Jobs</span>
                <span className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{user.totalJobPost || 0}</span>
              </Link>
            )}
          </div>


        </div>
      </div>

      {/* Profile Visibility Setting */}
      <div className={`${THEME.components.card.default} p-4`}>
        <button
          onClick={() => {
            setIsSettingsOpen(!isSettingsOpen);
            if (!isSettingsOpen) setIsSubscriptionsOpen(false);
          }}
          className="w-full flex items-center justify-between group"
        >
          <h3 className="text-sm font-medium text-gray-700">Profile Visibility Setting</h3>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
        </button>

        {isSettingsOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Mode Switcher Redesign */}
            {/*
            <div className="flex items-center justify-between px-3 py-3 mb-4 bg-gray-50 rounded-xl border border-gray-100 relative">
              <div className={`flex flex-col items-center gap-1 transition-colors ${!isEmployer ? 'text-purple-700 font-bold' : 'text-gray-400 font-medium'}`}>
                <FiUser size={18} />
                <span className="text-[10px] uppercase tracking-wide text-center">Job Seeker Mode</span>
              </div>

              <button
                onClick={handleEmployerSwitch}
                className="p-2.5 rounded-full bg-white shadow-md border border-gray-100 hover:shadow-lg hover:scale-110 active:scale-95 transition-all z-10 mx-2"
                title="Switch Mode"
              >
                <FiRefreshCw
                  size={18}
                  className={`text-purple-600 transition-all duration-500 ${isEmployer ? 'rotate-180' : ''}`}
                />
              </button>

              <div className={`flex flex-col items-center gap-1 transition-colors ${isEmployer ? 'text-purple-700 font-bold' : 'text-gray-400 font-medium'}`}>
                <FiBriefcase size={18} />
                <span className="text-[10px] uppercase tracking-wide text-center">Employer Mode</span>
              </div>
            </div>
            */}

            {/* Show as Online */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Show Online Status</span>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isOnline ? 'bg-gradient-to-r from-indigo-300 to-purple-300' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isOnline ? 'translate-x-5' : ''
                    }`}
                />
              </button>
            </div>

            {/* Profile Label */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 block mb-2">Profile Status</span>
              <div className="flex flex-col gap-2">
                {(isEmployer ? ['Actively Hiring', 'None'] : ['Ready To Join', 'None']).map((label) => {
                  const isActive = user.user_mode_type === label || (label === 'None' && !user.user_mode_type);
                  return (
                    <label
                      key={label}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isActive
                        ? 'border-indigo-500'
                        : 'border-gray-300'
                        }`}>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="profileLabel"
                        value={label}
                        checked={isActive}
                        onChange={() => handleProfileLabelChange(label)}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium text-gray-700 ${isActive ? 'font-semibold text-indigo-600' : ''
                        }`}>
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Balance */}
      <div className={`${THEME.components.card.default} p-4`}>
        <button
          onClick={() => {
            setIsSubscriptionsOpen(!isSubscriptionsOpen);
            if (!isSubscriptionsOpen) setIsSettingsOpen(false);
          }}
          className="w-full flex items-center justify-between group"
        >
          <h4 className="text-sm font-medium text-gray-700">Subscription Status</h4>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isSubscriptionsOpen ? 'rotate-180' : ''}`} />
        </button>
 
        {isSubscriptionsOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {/* Active Plan Section */}
            <div className="mb-5 text-center flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Current Plan —</span>
              <h4 className="text-sm font-black bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] drop-shadow-lg whitespace-nowrap">
                {(() => {
                  const bal = isEmployer ? user.user_balance_employer : user.user_balance_job_seeker;
                  if (!bal) return 'No Active Subscription';
                  if (isPlanExpired(bal.plan_expiry_date)) return 'Expired';
                  return bal.plan_name || 'No Active Subscription';
                })()}
              </h4>
              {(() => {
                const bal = isEmployer ? user.user_balance_employer : user.user_balance_job_seeker;
                if (bal && isPlanExpired(bal.plan_expiry_date)) return <Link href="/premium-services" className="text-xs text-red-500 hover:text-red-600 underline ml-1">Renew to Continue</Link>;
                return null;
              })()}
            </div>

            {/* Balance Details without Border Box */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-3">Usage & Benefits</p>

              <div className="mt-2">
                {renderFeaturesList()}
              </div>
            </div>

            {!user.user_balance_employer && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Link href="/premium-services" className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer`}>
                  <div className="flex items-center gap-2">
                    <FiStar className={`w-3.5 h-3.5 text-gray-400 group-hover:text-yellow-500 transition-colors`} />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Upgrade Plan / View Plans</span>
                  </div>
                  <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </Link>
              </div>
            )}

            <style jsx>{`
              @keyframes shimmer {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .animate-shimmer {
                animation: shimmer 3s ease-in-out infinite;
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Resume Builder section*/}


      <EmployerVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handleVerificationSuccess}
      />
    </div>
  );
};

export default NetworkingLeftSidebar;

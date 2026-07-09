import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiChevronDown, FiBriefcase, FiEye, FiTrendingUp, FiUsers, FiFileText, FiUserCheck, FiX, FiHome, FiCompass, FiBell, FiCalendar, FiSettings, FiLogOut, FiStar, FiHelpCircle, FiPlus } from "react-icons/fi";
import MessageIcon from '@/components/icons/MessageIcon';
import { NavLink } from "@/types/navigation";
import NavbarSearch from "./NavbarSearch";
import GradientButton from "../shared/GradientButton";
import ProfileAvatar from "../shared/ProfileAvatar";
import { User } from "@/lib/api";
import { NavbarIconButton } from "../Navbar";
import Button from "../shared/Button";
import { THEME } from "@/styles/theme";
import { useAuth } from "@/context/AuthContext";
import { SITE_CONFIG } from "@/constants/siteconfig";

interface NavbarMobileProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  user: User | null;
  signUpText: string;
  onNotificationsClick: () => void;
  onMeetingsClick: () => void;
  bellButtonRef: React.RefObject<HTMLButtonElement | null>;
  onAuthClick?: () => void;
}

const NavbarMobile = ({
  isOpen,
  onClose,
  links,
  user,
  signUpText,
  onNotificationsClick,
  onMeetingsClick,
  bellButtonRef,
  onAuthClick
}: NavbarMobileProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { logout, isEmployer } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const getIcon = (iconName?: string) => {
    if (!iconName) return <FiCompass className="w-5 h-5 text-gray-400" />;
    const iconMap: { [key: string]: React.ReactNode } = {
      FiBriefcase: <FiBriefcase className="w-5 h-5 text-indigo-500" />,
      FiEye: <FiEye className="w-5 h-5 text-purple-500" />,
      FiTrendingUp: <FiTrendingUp className="w-5 h-5 text-green-500" />,
      FiUsers: <FiUsers className="w-5 h-5 text-blue-500" />,
      FiFileText: <FiFileText className="w-5 h-5 text-orange-500" />,
      FiUserCheck: <FiUserCheck className="w-5 h-5 text-teal-500" />,
      FiHome: <FiHome className="w-5 h-5 text-gray-500" />,
    };
    return iconMap[iconName] || <FiCompass className="w-5 h-5 text-gray-400" />;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] lg:hidden transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div className="fixed top-0 right-0 h-full w-[85vw] max-w-[320px] bg-white shadow-2xl z-[110] flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden rounded-l-2xl border-l border-gray-100">

        {/* Profile Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative flex-shrink-0">
                  <Image
                    src={user?.picture || "/images/user_profile_placeholder.jpeg"}
                    alt={`${user.first_name} ${user.last_name}`}
                    width={56}
                    height={56}
                    className="rounded-full object-cover w-14 h-14 border-2 border-white shadow-sm"
                  />
                  {user.is_verified === 1 && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-indigo-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-gray-900 truncate">{user ? `${user.first_name} ${user.last_name}` : 'Welcome'}</h2>
                {user?.designation && (
                  <p className="text-[11px] text-gray-600 truncate">{user.designation}</p>
                )}
                {(user?.headline || user?.profileHeadline) && (
                  <p className="text-[10px] text-gray-400 truncate">{user.headline || user.profileHeadline}</p>
                )}
                {user?.city && user?.state && (
                  <p className="text-[10px] text-gray-400 truncate">{user.city}, {user.state}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/50 transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* View Update Profile + Subscription Status */}
          {user && (
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => { router.push('/profile?tab=basic'); onClose(); }}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
              >
                View & Update Profile
              </button>
              <span className="text-[10px] text-red-500 font-medium">
                {(() => {
                  const bal = isEmployer ? user?.user_balance_employer : user?.user_balance_job_seeker;
                  if (!bal) return 'Free Plan';
                  if (bal.plan_expiry_date && new Date(bal.plan_expiry_date) < new Date()) return <Link href="/premium-services" className="underline">Your Subscription Has Expired. Renew Your Plan to Continue.</Link>;
                  return bal.plan_name || 'Free Plan';
                })()}
              </span>
            </div>
          )}

          {/* Stats Row */}
          {user && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Link
                href="/profile/insights?tab=insights"
                onClick={onClose}
                className="bg-purple-50 rounded-xl p-2.5 text-center hover:bg-purple-100 transition-colors"
              >
                <p className="text-xs font-bold text-purple-700">{user.profile_view || 0}</p>
                <p className="text-[9px] text-purple-500 font-medium">Views</p>
              </Link>
              <Link
                href="/connections?tab=connections"
                onClick={onClose}
                className="bg-blue-50 rounded-xl p-2.5 text-center hover:bg-blue-100 transition-colors"
              >
                <p className="text-xs font-bold text-blue-700">{user.totalConnection || 0}</p>
                <p className="text-[9px] text-blue-500 font-medium">Connects</p>
              </Link>
              <Link
                href={isEmployer ? "/profile/find-candidates?tab=manage-jobs" : "/profile/jobs"}
                onClick={onClose}
                className="bg-green-50 rounded-xl p-2.5 text-center hover:bg-green-100 transition-colors"
              >
                <p className="text-xs font-bold text-green-700">{isEmployer ? (user.totalJobPost || 0) : (user.totalActivePost || 0)}</p>
                <p className="text-[9px] text-green-500 font-medium">{isEmployer ? 'Jobs' : 'Posts'}</p>
              </Link>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">

          {/* Main Navigation Links */}
          <div className="space-y-2">

            {links.map((link) => (
              <div key={link.label} className="group">
                {link.submenu ? (
                  <div className="bg-gray-50/50 rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-50">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        {getIcon(link.icon)}
                        <span className="text-sm font-medium text-gray-700">{link.label}</span>
                      </div>
                      <FiChevronDown className={`text-gray-400 transition-transform duration-300 ${openDropdown === link.label ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`grid transition-all duration-300 ease-in-out ${openDropdown === link.label ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="px-3 pb-3 space-y-1">
                          {link.submenu.map((sublink) => (
                            <Link
                              key={sublink.label}
                              href={sublink.href}
                              className="flex items-center gap-3 p-2.5 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all pl-9"
                              onClick={onClose}
                            >
                              {sublink.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : link.href === '#' ? (
                  <button
                    onClick={() => {
                      if (onAuthClick) onAuthClick();
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
                  >
                    {getIcon(link.icon)}
                    <span className="text-sm font-medium">{link.label}</span>
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    onClick={onClose}
                  >
                    {getIcon(link.icon)}
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* My Profile & Sign Out */}
          {user ? (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                <FiUserCheck className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-medium">My Profile</span>
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
              >
                <FiLogOut size={20} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Link
                href="/signin"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg transition-all font-medium"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Quick Actions (User Only) */}
          {user && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { onNotificationsClick(); onClose(); }}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors gap-2"
                >
                  <FiBell size={20} />
                  <span className="text-xs font-medium">Notifications</span>
                </button>
                {isEmployer && (
                  <Link
                    href="/profile/find-candidates?tab=manage-jobs"
                    onClick={onClose}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors gap-2"
                  >
                    <FiBriefcase size={20} />
                    <span className="text-xs font-medium">Jobs</span>
                  </Link>
                )}
                {isEmployer && (
                  <Link
                    href="/profile/create-job"
                    onClick={onClose}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors gap-2 relative"
                  >
                    <div className="relative">
                      <FiPlus size={20} />
                    </div>
                    <span className="text-xs font-medium">Post a Job</span>
                    {user?.totalJobPost ? (
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {user.totalJobPost}
                      </span>
                    ) : null}
                  </Link>
                )}
                <button
                  onClick={() => { onMeetingsClick(); onClose(); }}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors gap-2"
                >
                  <FiCalendar size={20} />
                  <span className="text-xs font-medium">Meetings</span>
                </button>
                <Link
                  href="/profile/messages"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors gap-2"
                >
                  <MessageIcon size={20} />
                  <span className="text-xs font-medium">Messages</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors gap-2"
                >
                  <FiSettings size={20} />
                  <span className="text-xs font-medium">Settings</span>
                </Link>
                <Link
                  href="/subscription"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors gap-2"
                >
                  <FiStar size={20} />
                  <span className="text-xs font-medium">Subscription</span>
                </Link>
                <Link
                  href="/faqs"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors gap-2"
                >
                  <FiHelpCircle size={20} />
                  <span className="text-xs font-medium">FAQs</span>
                </Link>
              </div>
            </div>
          )}

          {/* Footer Links - Optimized for Mobile */}
          <div className="space-y-3 pt-4 border-t border-gray-200/50">
            {/* Overview & Policies in Compact Grid */}
            <div className="bg-gray-50/50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Overview */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Overview</h4>
                  <ul className="space-y-1.5">
                    {SITE_CONFIG.footer.menu.slice(0, 4).map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="text-xs text-gray-600 hover:text-purple-600 transition-colors block leading-relaxed"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Policies */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Policies</h4>
                  <ul className="space-y-1.5">
                    {SITE_CONFIG.footer.policies.slice(0, 4).map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="text-xs text-gray-600 hover:text-purple-600 transition-colors block leading-relaxed"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Copyright - Compact */}
            <p className="text-center text-[10px] text-gray-400 px-2 leading-relaxed">
              © {new Date().getFullYear()} Staff Book. All Rights Reserved by Staff Book.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarMobile;

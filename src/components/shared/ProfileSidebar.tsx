import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiTrendingUp,
  FiBriefcase,
  FiUsers,
  FiAward,
  FiFileText,
  FiSearch,
  FiX,
  FiChevronRight,
} from "react-icons/fi";
import { BsFileBarGraph } from "react-icons/bs";
import { useAuth } from "@/context/AuthContext";
import { THEME } from "@/styles/theme";
import EmployerVerificationModal from "./EmployerVerificationModal";

type SubmenuItem = {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type MenuSection = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: SubmenuItem[];
};

export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isEmployer, setIsEmployer, isOnline, setIsOnline, profileLabel, setProfileLabel } = useAuth();

  const isPlanExpired = (expiryDate: string | undefined | null) => {
    if (!expiryDate) return false;
    try {
      return new Date(expiryDate) < new Date();
    } catch {
      return false;
    }
  };

  const menuSections: MenuSection[] = [
    {
      id: "profile",
      label: "Profile Analytics",
      icon: <BsFileBarGraph size={18} />,
      href: "/profile/analytics",
      children: []
    },
    {
      id: "resume",
      label: "Resume & Portfolio",
      href: "/profile/resume",
      icon: <FiFileText size={16} />,
      children: []
    },
    {
      id: "subscriptions",
      label: "Subscription Status",
      icon: <FiUsers size={18} />,
      children: [
        {
          id: "subscriptions",
          label: "Subscriptions",
          href: `/premium-services?tab=${isEmployer ? 'recruiters' : 'jobseekers'}`,
          icon: <FiSearch size={16} />
        }
      ]
    }
  ];

  // Check if a menu item is active
  const isActive = React.useCallback((href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  }, [pathname]);

  // Find which section contains the active page
  const getActiveSectionId = React.useCallback(() => {
    for (const section of menuSections) {
      if (section.children) {
        for (const child of section.children) {
          if (isActive(child.href)) {
            return section.id;
          }
        }
      }
    }
    return "seeker"; // Default to seeker section
  }, [isActive]);

  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [showSubscriptionCard, setShowSubscriptionCard] = useState(true);

  // Profile Mode & Display State from AuthContext
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleEmployerSwitch = () => {
    // If user is already an employer on backend
    if (user?.user_type === 'employer') {
      if (isEmployer) {
        // Switch to Job Seeker
        setIsEmployer(false);
        router.push('/profile/jobs');
      } else {
        // Switch to Employer
        setIsEmployer(true);
        router.push('/profile/find-candidates');
      }
      return;
    }

    // For non-employers (Job Seekers)
    if (!isEmployer) {
      // If turning ON, show verification modal first
      setShowVerificationModal(true);
    } else {
      // If turning OFF, just switch
      setIsEmployer(false);
      router.push('/profile/jobs');
    }
  };

  const handleVerificationSuccess = (details: { companyName: string; gstNumber: string; email: string; file: File | null }) => {
    setIsEmployer(true);
    setShowVerificationModal(false);
    router.push('/profile/find-candidates');
  };

  // Initialize and update open section when pathname changes
  useEffect(() => {
    const activeSectionId = getActiveSectionId();
    setOpenSectionId(activeSectionId);
  }, [pathname, getActiveSectionId]);

  const toggleSection = (id: string) => {
    setOpenSectionId((prevId) => (prevId === id ? null : id));
  };

  // Get user data with defaults
  const displayName = user ? `${user.first_name} ${user.last_name}` : "Guest User";
  const displayRole = user?.designation || user?.employerDetails?.designation || user?.employerDetails?.job_title || "User";
  const displayAvatar = user?.picture || "/images/user_profile_placeholder.jpeg";
  const totalConnections = user?.totalConnection || 0;
  const totalJobPosts = user?.totalJobPost || 0;

  // Subscription balance data
  const contactViews = user?.userBalance?.no_of_contact || 0;
  const resumeDownloads = user?.userBalance?.no_of_resume || 0;
  const banners = user?.userBalance?.no_of_banner || 0;
  const videoConferencing = user?.userBalance?.no_of_generate_lin || 0;

  return (
    <aside className="w-full flex flex-col items-center">
      {/* Top: Compact Profile card with Connections button */}
      <div className="w-full mb-4">
        <div className="w-full bg-white rounded-2xl border border-[#E8E4FF] shadow-sm p-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-visible flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="object-cover w-10 h-10"
                />
              </div>
              {/* Online Indicator */}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
              {/* Profile Label Badge - Arc */}
              {profileLabel !== 'None' && (
                <div className="absolute inset-[-2px] z-10 pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    <path
                      id="sidebar-badge-curve"
                      d="M 12,70 A 45,45 0 0,1 12,30"
                      fill="none"
                      stroke={profileLabel === 'Job Seeking' ? '#10B981' : '#8B5CF6'}
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <text fontSize="7" fontWeight="900" fill="white" letterSpacing="0.5px" dy="2.5">
                      <textPath href="#sidebar-badge-curve" startOffset="50%" textAnchor="middle">
                        {profileLabel === 'Job Seeking' ? 'JOB SEEKING' : 'HIRING'}
                      </textPath>
                    </text>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-[0.95rem] font-bold text-[#222]">{displayName}</div>
              <div className="text-[0.8rem] text-[#666] line-clamp-1">{displayRole}</div>
            </div>
          </div>
          <Link
            href="/profile"
            className="mt-3 block w-full text-center bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#811284] text-white tex-sm font-medium rounded-[50px] py-1 transition-colors"
          >
            View Profile
          </Link>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link href="/connections" className="bg-light-bg rounded-xl p-2.5 text-center border border-[#E8E4FF] flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors cursor-pointer">
              <span className="block text-sm font-medium text-[#666]">Connection</span>
              <span className="text-sm font-bold text-[#222]">{totalConnections}</span>
            </Link>
            <Link href="/networking" className="bg-light-bg rounded-xl p-2.5 text-center border border-[#E8E4FF] flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors cursor-pointer">
              <span className="block text-sm font-medium text-[#666]">Post</span>
              <span className="text-sm font-bold text-[#222]">0</span>
            </Link>
            {isEmployer && (
              <Link href="/profile/jobs" className="bg-light-bg rounded-xl p-2.5 text-center border border-[#E8E4FF] flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors cursor-pointer">
                <span className="block text-sm font-medium text-[#666]">Posted Jobs</span>
                <span className="text-sm font-bold text-[#222]">{totalJobPosts}</span>
              </Link>
            )}
            {!isEmployer && (
              <Link href="/profile/jobs?tab=recommendations" className="bg-light-bg rounded-xl p-2.5 text-center border border-[#E8E4FF] flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors cursor-pointer">
                <span className="block text-sm font-medium text-[#666]">Applied Jobs</span>
                <span className="text-sm font-bold text-[#222]">0</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Menu with Sections and Submenus */}
      <div className="flex-1 w-full pb-28 lg:pb-4">
        <nav className="w-full font-Montserrat">
          {menuSections.map((section, index) => (
            <div key={section.id} className="mb-3">
              <div
                className="flex items-center justify-between bg-white hover:bg-light-bg border border-[#E8E4FF] rounded-xl px-3 py-3 cursor-pointer shadow-sm transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                    {section.icon}
                  </div>
                  {section.href ? (
                    <Link href={section.href} className="text-[0.95rem] font-bold text-[#222] hover:text-primary">
                      {section.label}
                    </Link>
                  ) : (
                    <span className="text-[0.95rem] font-bold text-[#222]">{section.label}</span>
                  )}
                </div>
                {(section.children?.length ?? 0) > 0 || section.id === "subscriptions" ? (
                  <span className="text-primary text-sm font-semibold transition-transform duration-300">
                    {openSectionId === section.id ? "—" : "+"}
                  </span>
                ) : null}
              </div>
              {openSectionId === section.id && (
                <div className="mt-2 bg-white rounded-xl border border-[#E8E4FF] p-4 shadow-sm animate-fadeIn">
                  {section.id === "subscriptions" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-semibold text-gray-500 capitalize tracking-wide">Current Active Plan —</p>
                        <h4 className="text-sm font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto] whitespace-nowrap">
                          {(() => {
                            const bal = isEmployer ? user?.user_balance_employer : user?.user_balance_job_seeker;
                            if (!bal) return 'VIP';
                            if (isPlanExpired(bal.plan_expiry_date)) return 'Expired';
                            return bal.plan_name || 'VIP';
                          })()}
                        </h4>
                        {(() => {
                          const bal = isEmployer ? user?.user_balance_employer : user?.user_balance_job_seeker;
                          if (bal && isPlanExpired(bal.plan_expiry_date)) return <Link href="/premium-services" className="text-xs text-red-500 hover:text-red-600 underline ml-2">Renew to Continue</Link>;
                          return null;
                        })()}
                      </div>

                      {(() => {
                        const bal = isEmployer ? user?.user_balance_employer : user?.user_balance_job_seeker;
                        if (bal && isPlanExpired(bal.plan_expiry_date)) return <p className="text-sm text-center py-4"><Link href="/premium-services" className="text-red-500 hover:text-red-600 underline font-medium">Your Subscription Has Expired. Renew Your Plan to Continue.</Link></p>;
                        return (
                          <div>
                            <p className="text-sm text-gray-500 mb-3">Your Remaining Subscription Balance</p>
                            <div className="space-y-2.5">
                              {[
                                { label: "Contact", value: contactViews },
                                { label: "Schedule Meeting", value: videoConferencing },
                                { label: "Resume Downloads", value: resumeDownloads },
                                { label: "Advertisment Banners", value: banners }
                              ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">{item.label}</span>
                                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <Link
                        href={`/premium-services?tab=${isEmployer ? 'recruiters' : 'jobseekers'}`}
                        className="mt-4 flex items-center justify-between w-full p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <FiSearch size={16} className="text-gray-400 group-hover:text-purple-600" />
                          <span className="text-sm font-bold text-gray-600 group-hover:text-purple-700">View Plan's</span>
                        </div>
                        <FiChevronRight size={16} className="text-gray-300 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#F0ECFF] overflow-hidden">
                      {section.children?.map((item) => {
                        const itemIsActive = isActive(item.href);
                        return (
                          <li key={item.id} className="group">
                            <Link
                              href={item.href}
                              className={`flex items-center gap-2 px-4 py-3 text-[0.9rem] transition-all duration-200 ${itemIsActive
                                ? "bg-gradient-to-r from-light-bg to-[#F0ECFF] text-primary font-bold border-l-4 border-primary"
                                : "text-[#333] hover:text-primary hover:bg-light-bg hover:pl-5"
                                }`}
                            >
                              <span className={itemIsActive ? THEME.components.icon.primary : "text-gray-500 group-hover:text-indigo-300"}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Profile Visibility Setting */}
        <div className="w-full mb-4 bg-white rounded-2xl border border-[#E8E4FF] shadow-sm p-4">
          <h3 className="text-sm font-bold text-[#222] mb-4">Profile Visibility Setting</h3>

          {/* Switch to Employer */}
          {/* 
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#666] font-medium">
              {isEmployer ? "Switch to Job Seeker Mode" : "Switch to Employer Mode"}
            </span>
            <button
              onClick={handleEmployerSwitch}
              className={`p-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isEmployer
                ? 'bg-gradient-to-r from-indigo-300 to-purple-300 ring-2 ring-purple-100'
                : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-indigo-300 hover:to-purple-300'
                }`}
              title={isEmployer ? "Switch to Job Seeker Mode" : "Switch to Employer Mode"}
            >
              <Image
                src="/icons/role-switch.png"
                alt="Switch Role"
                width={20}
                height={20}
                className={`w-5 h-5 transition-transform duration-500 brightness-0 invert ${isEmployer ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          */}

          {/* Show as Online */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#666] font-medium">Show as Online</span>
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
            <span className="text-sm text-[#666] font-medium block mb-2">Profile Label</span>
            <div className="flex flex-col gap-2">
              {(isEmployer ? ['None', 'Hiring'] : ['None', 'Job Seeking']).map((label) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${profileLabel === label
                    ? 'border-purple-700'
                    : 'border-gray-300 group-hover:border-purple-700'
                    }`}>
                    {profileLabel === label && (
                      <div className="w-2 h-2 rounded-full bg-purple-700" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="profileLabel"
                    value={label}
                    checked={profileLabel === label}
                    onChange={(e) => {
                      const value = e.target.value as 'None' | 'Job Seeking' | 'Hiring';
                      setProfileLabel(value);
                    }}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-[#666]">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <EmployerVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handleVerificationSuccess}
      />
    </aside>
  );
}


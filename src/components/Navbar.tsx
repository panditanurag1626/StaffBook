"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FiMenu, FiX, FiBell, FiCalendar, FiMoreVertical, FiSearch, FiChevronDown, FiUser, FiBriefcase } from "react-icons/fi";
import MessageIcon from '@/components/icons/MessageIcon';
import { LOGGED_IN_LINKS, SITE_CONFIG } from "../constants/siteconfig";
import GradientButton from "./shared/GradientButton";
import { useAuth } from "../context/AuthContext";
import ProfileAvatar from "./shared/ProfileAvatar";
import { usePathname, useRouter } from "next/navigation";
import NotificationsModal from "./shared/NotificationsModal";
import NavbarSearch from "./navbar/NavbarSearch";
import NavbarDesktop from "./navbar/NavbarDesktop";
import NavbarMobile from "./navbar/NavbarMobile";
import MobileBottomNav from "./navbar/MobileBottomNav";
import MeetingModal from "./shared/MeetingModal";
import AuthModal from "./shared/AuthModal";
import { NavLink } from "@/types/navigation";
import { THEME } from "@/styles/theme";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { meetService } from "@/lib/api/services/meetService";

const Navbar = () => {
  const path = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const navLinks = SITE_CONFIG.navbar.navLinks as NavLink[];
  const signUpText = SITE_CONFIG.navbar.signUp;
  const { user, isSidebarOpen, setIsSidebarOpen, isEmployer } = useAuth();
  const router = useRouter();

  // Get profile completion percentage

  const [searchOpen, setSearchOpen] = useState(false);

  const [selectedCandidateName, setSelectedCandidateName] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [selectedJobPostId, setSelectedJobPostId] = useState<number | null>(null);
  const [isModalFromNavbar, setIsModalFromNavbar] = useState(false);

  useEffect(() => {
    const handleOpenMeetingModal = (event: any) => {
      setSelectedCandidateName(event.detail?.candidateName || "");
      setSelectedCandidateId(event.detail?.candidateId || null);
      setSelectedJobPostId(event.detail?.jobPostId || null);
      setIsModalFromNavbar(event.detail?.isFromNavbar || false);
      setMeetingModalOpen(true);
    };
    window.addEventListener('openMeetingModal', handleOpenMeetingModal);
    return () => window.removeEventListener('openMeetingModal', handleOpenMeetingModal);
  }, []);

  // Filter links based on isEmployer state
  const getFilteredLinks = () => {
    if (!user) return navLinks;

    return (LOGGED_IN_LINKS as NavLink[]).map(link => {
      if (link.label === 'Jobs' && link.submenu) {
        // If employer, show only Employer Mode submenu
        if (isEmployer) {
          return {
            label: 'Find Candidates',
            href: '/profile/find-candidates',
          };
        }
        // If job seeker (default), show only Job Seeking Mode submenu
        else {
          return {
            label: 'Find Jobs',
            href: '/profile/jobs',
          };
        }
      }
      return link;
    });
  };

  const filteredLinks = getFilteredLinks();

  return (
    <>
      <div className={`w-full h-[70px] fixed top-0 z-[100] ${path === '/' ? 'bg-transparent text-white' : 'bg-white'} border-x-0 border-y-0 rounded-none transition-all duration-300`}>
        <div className="w-full max-w-7xl mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8">

          {/* Left Side: Logo + Search */}
          <div className="flex items-center gap-2 lg:gap-3 lg:flex-1">
            <div className="flex flex-row gap-3 items-center">
              {/* Logo Section */}
              <div className="flex h-full items-center justify-center w-10">
                <Link href="/networking" className="cursor-pointer">
                  <Image
                    src="/logoHalf.jpeg"
                    alt="Staff Book"
                    width={40}
                    height={40}
                    priority
                    className="object-contain"
                  />
                </Link>
              </div>
              {path !== '/' && (
                <div className="lg:hidden flex items-center z-50 gap-2">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="relative rounded-full shadow-sm hover:bg-gray-50 transition-all active:scale-95 border border-gray-100"
                    aria-label="Toggle sidebar"
                  >
                    <div className="rounded-full overflow-hidden h-9 w-9 bg-white flex items-center justify-center">
                      <Image
                        src={user?.picture || "/images/user_profile_placeholder.jpeg"}
                        alt={user ? `${user.first_name} ${user.last_name}` : "Profile"}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    </div>
                  </button>
                  {!user && path === '/signin' && (
                    <Link
                      href="/signup"
                      className="font-semibold px-4 py-1.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl text-white bg-purple-700 hover:bg-purple-800 text-xs whitespace-nowrap"
                    >
                      Sign Up
                    </Link>
                  )}
                  {!user && path === '/signup' && (
                    <Link
                      href="/signin"
                      className="font-semibold px-4 py-1.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl text-white bg-purple-700 hover:bg-purple-800 text-xs whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Search Bar (Desktop) - Only on Networking pages */}
            <div className="hidden lg:block w-[200px]">
              {user && path === '/networking' && (
                <NavbarSearch />
              )}
            </div>
          </div>

          {/* Center: Nav Items */}
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            {user && !['/signin', '/signup'].includes(path) ? (
              <NavbarDesktop links={filteredLinks} currentPath={path} />
            ) : (
              path !== '/' && <NavbarDesktop links={navLinks} currentPath={path} onAuthClick={() => setIsAuthModalOpen(true)} />
            )}
          </div>

          {/* Right Side: Icons + Profile / Auth Buttons */}
          {user && !['/signin', '/signup'].includes(path) ? (
            <div className="hidden lg:flex items-center gap-2 lg:flex-1 lg:justify-end">
              <div className="mr-6">
                <NavbarIconButton
                  onNotificationsClick={() => setNotificationsOpen(true)}
                  onMeetingsClick={() => {
                    setIsModalFromNavbar(true);
                    setMeetingModalOpen(true);
                  }}
                  bellButtonRef={bellButtonRef}
                />
              </div>
              <ProfileAvatar
                name={user ? `${user.first_name} ${user.last_name}` : 'User'}
                src={user?.picture || undefined}
                showMenu={true}
              />
            </div>
          ) : (
            <div className="hidden lg:flex items-center lg:flex-1 lg:justify-end">
              {path === '/signin' ? (
                <Link
                  href="/signup"
                  className={`${THEME.components.button.primary} w-[120px] h-[40px] !p-0 text-sm font-medium flex items-center justify-center hover:shadow-lg transition-all`}
                >
                  Sign Up
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className={`${THEME.components.button.primary} w-[120px] h-[40px] !p-0 text-sm font-medium flex items-center justify-center hover:shadow-lg transition-all`}
                >
                  Sign In
                </Link>
              )}
            </div>
          )}

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-0.5 sm:gap-1">
            {user && (
              <>
                {/* Search Icon (Mobile) - Always renders to reserve space, hidden on non-networking */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`flex flex-col items-center gap-0 min-w-[44px] sm:min-w-[48px] p-1 sm:p-1.5 ${path === '/networking' ? '' : 'invisible'}`}
                >
                  <FiSearch size={20} className="text-gray-700" />
                  <span className="text-[10px] sm:text-[11px] leading-tight text-gray-500">Search</span>
                </button>
                <NavbarIconButton
                  mobile
                  onNotificationsClick={() => setNotificationsOpen(true)}
                  onMeetingsClick={() => { setIsModalFromNavbar(true); setMeetingModalOpen(true); }}
                  bellButtonRef={bellButtonRef}
                />
              </>
            )}
            {!user && path !== '/signin' && path !== '/signup' && (
              <Link
                href="/signin"
                className="font-semibold px-5 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl text-white bg-purple-700 hover:bg-purple-800 text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <div className={`absolute top-[70px] left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 shadow-lg transition-all duration-300 origin-top ${searchOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
          <NavbarSearch className="w-full" onClose={() => setSearchOpen(false)} />
        </div>
      </div>

      {/* Mobile Menu */}
      <NavbarMobile
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        links={(path === '/' ? [] : (user ? filteredLinks : navLinks)).filter(link => !['Networking', 'Jobs', 'My Connections', 'Services', 'Find Jobs', 'Find Candidates'].includes(link.label))}
        user={user}
        signUpText={signUpText}
        onNotificationsClick={() => setNotificationsOpen(true)}
        onMeetingsClick={() => {
          setIsModalFromNavbar(true);
          setMeetingModalOpen(true);
        }}
        bellButtonRef={bellButtonRef}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={meetingModalOpen}
        onClose={() => {
          setMeetingModalOpen(false);
          setSelectedCandidateName("");
          setSelectedCandidateId(null);
          setSelectedJobPostId(null);
        }}
        initialCandidateName={selectedCandidateName}
        initialCandidateId={selectedCandidateId}
        initialJobPostId={selectedJobPostId}
        mode={isEmployer ? 'employer' : 'seeker'}
        isFromNavbar={isModalFromNavbar}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        buttonRef={bellButtonRef}
      />

      <MobileBottomNav />
    </>
  );
};

export const NavbarIconButton = ({
  onNotificationsClick,
  onMeetingsClick,
  bellButtonRef,
  mobile = false,
}: {
  onNotificationsClick: () => void;
  onMeetingsClick: () => void;
  bellButtonRef?: React.RefObject<HTMLButtonElement | null>;
  mobile?: boolean;
}) => {
  const router = useRouter();
  const { user, isEmployer } = useAuth();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!user || !user.id) return;

    const myUid = String(user.id);
    const userChatsRef = ref(db, `users/${myUid}/chats`);

    const unsubscribeChats = onValue(userChatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        let unreadCount = 0;
        Object.keys(chatsData).forEach(key => {
          if ((chatsData[key].unreadCount || 0) > 0) {
            unreadCount++;
          }
        });
        setUnreadMessagesCount(unreadCount);
      } else {
        setUnreadMessagesCount(0);
      }
    });

    return () => unsubscribeChats();
  }, [user]);

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (!user || !user.id) return;

    const myUid = String(user.id);
    const userNotificationsRef = ref(db, `users/${myUid}/notifications`);

    const unsubscribeNotifications = onValue(userNotificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        let unreadCount = 0;
        Object.keys(notificationsData).forEach(key => {
          if (!notificationsData[key].read) {
            unreadCount++;
          }
        });
        setUnreadNotificationsCount(unreadCount);
      } else {
        setUnreadNotificationsCount(0);
      }
    });

    return () => unsubscribeNotifications();
  }, [user]);

  const [scheduledMeetingsCount, setScheduledMeetingsCount] = useState(0);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchMeetings = async () => {
      try {
        const res = await meetService.getMeetingLogs({ status: 'upcoming', page: 1, per_page: 50 });
        if (res.status === 200) {
          const allUpcoming = res.data?.data || [];
          const pending = allUpcoming.filter((m: any) => m.meeting_status === 'pending');
          setScheduledMeetingsCount(pending.length);
        }
      } catch (error) {
        console.error('Error fetching meetings count:', error);
      }
    };

    fetchMeetings();
    // Optional: set up interval to refresh, e.g. every 1 minute
    const interval = setInterval(fetchMeetings, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const NavItem = ({
    icon: Icon,
    label,
    onClick,
    count,
    ref,
    mobile: isMobile,
    badgeColor
  }: {
    icon: any,
    label: string,
    onClick?: () => void,
    count?: number | string,
    ref?: React.RefObject<HTMLButtonElement | null>,
    mobile?: boolean,
    badgeColor?: string
  }) => (
    <button
      ref={ref}
      className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer group hover:text-black text-gray-500 ${
        isMobile ? 'min-w-[44px] sm:min-w-[48px] p-1 sm:p-1.5' : 'min-w-[48px]'
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Icon size={20} className="group-hover:text-black transition-colors" />
        {count ? (
          <span className={`absolute -top-1.5 -right-1.5 min-w-[16px] flex items-center justify-center ${badgeColor || 'bg-red-600'} text-white font-bold rounded-full px-1 leading-none ${
            isMobile ? 'h-[14px] text-[8px]' : 'h-4 text-[10px]'
          }`}>
            {count}
          </span>
        ) : null}
      </div>
      <span className={`leading-none ${
        isMobile ? 'text-[10px] sm:text-[11px]' : 'text-[9px] sm:text-[10px] font-normal'
      }`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className={`flex flex-row items-center ${mobile ? 'gap-0.5 sm:gap-1' : 'gap-2'}`}>
      {isEmployer && (
        <NavItem
          mobile={mobile}
          icon={FiBriefcase}
          label="Jobs"
          onClick={() => router.push('/profile/find-candidates?tab=manage-jobs')}
        />
      )}

      <NavItem
        mobile={mobile}
        icon={FiCalendar}
        label="Meetings"
        onClick={onMeetingsClick}
        count={scheduledMeetingsCount > 0 ? scheduledMeetingsCount : undefined}
        badgeColor="bg-yellow-500"
      />

      <NavItem
        mobile={mobile}
        icon={FiBell}
        label="Notifications"
        onClick={onNotificationsClick}
        count={unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined}
        ref={bellButtonRef}
      />

      <NavItem
        mobile={mobile}
        icon={MessageIcon}
        label="Messaging"
        count={unreadMessagesCount > 0 ? unreadMessagesCount : undefined}
        onClick={() => router.push('/profile/messages')}
      />
    </div>
  );
};
export default Navbar;

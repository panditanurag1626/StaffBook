'use client';
import { useEffect, useRef } from 'react';
import { FiX, FiStar, FiSettings, FiHelpCircle, FiLogOut, FiUser, FiDownload } from 'react-icons/fi';
import Image from 'next/image';
import { PROFILE_MODAL } from '@/constants/siteconfig';
import ProfileViewsIcon from '@/components/svgs/ProfileViewsIcon';
import { THEME } from '@/styles/theme';
import ConnectionsIcon from '@/components/svgs/ConnectionsIcon';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLElement | null>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, buttonRef }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // If buttonRef is provided, check if click is on the button
        if (buttonRef?.current && buttonRef.current.contains(event.target as Node)) {
          return;
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, buttonRef]);

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/signin');
  };

  if (!isOpen) return null;

  // Default values if user is not logged in
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Guest User';
  const displayRole = user?.designation || 'User';
  const displayAvatar = user?.picture || '/images/user_profile_placeholder.jpeg';
  const profileViews = user?.profile_view || 0;
  const totalConnections = user?.totalConnection || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center md:justify-end">
      {/* Backdrop - semi-transparent to show it's active */}
      <div
        className="fixed inset-0 bg-black/10 transition-opacity"
        onClick={onClose}
      />

      {/* Modal positioned below button */}
      <div 
        ref={modalRef}
        className="relative mt-0 md:mt-[75px] md:mr-6 bg-white rounded-lg shadow-2xl w-full max-w-full md:max-w-sm md:mx-4 max-h-screen md:max-h-[80vh] overflow-y-auto border border-gray-200 z-10 animate-in fade-in slide-in-from-top-2 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">{PROFILE_MODAL.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {/* Profile Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-700">{displayName}</h3>
                <p className="text-xs text-gray-600">{displayRole}</p>
                {user?.city && user?.state && (
                  <p className="text-xs text-gray-500">{user.city}, {user.state}</p>
                )}
              </div>
            </div>
            <button onClick={() => {
              router.push('/profile?tab=basic');
              onClose();
            }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              {PROFILE_MODAL.viewUpdateProfile}
            </button>
          </div>

          {/* Profile Performance Section */}
          {/* <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{PROFILE_MODAL.profilePerformance}</h3>
              <span className="text-xs text-gray-500">{PROFILE_MODAL.lastDays}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F3EFFF] rounded-lg p-3 cursor-pointer hover:bg-[#E8E4FF] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{PROFILE_MODAL.whoSearchedYou}</p>
                    <p className={`text-lg font-bold text-[${THEME.colors.primary}]`}>{profileViews}</p>
                  </div>
                  <ProfileViewsIcon className={`${THEME.components.icon.primary} w-8 h-8`} />
                </div>
              </div>
              <div className="bg-[#F3EFFF] rounded-lg p-3 cursor-pointer hover:bg-[#E8E4FF] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{PROFILE_MODAL.connections}</p>
                    <p className={`text-lg font-bold text-[${THEME.colors.primary}]`}>{totalConnections}</p>
                  </div>
                  <ConnectionsIcon className={`${THEME.components.icon.primary} w-8 h-8`} />
                </div>
              </div>
            </div>
          </div> */}

          {/* Navigation Items */}
          <div className="p-4 space-y-2">
            {/* <div
              onClick={() => {
                router.push('/profile');
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FiUser className="text-blue-600" size={16} />
              </div>
              <span className="text-sm text-gray-700">{PROFILE_MODAL.myAccount}</span>
            </div> */}

            {/* <div
              onClick={() => {
                router.push('/profile/downloads');
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <FiDownload className="text-green-600" size={16} />
              </div>
              <span className="text-sm text-gray-700">{PROFILE_MODAL.downloads}</span>
            </div> */}

            <div
              onClick={() => {
                router.push('/subscription');
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <FiStar className={`${THEME.components.icon.primary}`} size={16} />
              </div>
              <span className="text-sm text-gray-700">{PROFILE_MODAL.exploreSubscriptions}</span>
            </div>

            <div
              onClick={() => {
                router.push('/settings');
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <FiSettings className="text-gray-600 group-hover:text-indigo-300 transition-colors" size={16} />
              </div>
              <span className="text-sm text-gray-700">{PROFILE_MODAL.settings}</span>
            </div>

            <div
              onClick={() => {
                router.push('/faqs');
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <FiHelpCircle className="text-gray-600 group-hover:text-indigo-300 transition-colors" size={16} />
              </div>
              <span className="text-sm text-gray-700">{PROFILE_MODAL.faqs}</span>
            </div>

            <div
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 cursor-pointer transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <FiLogOut className="text-red-600" size={16} />
              </div>
              <span className="text-sm text-red-600 font-medium">{PROFILE_MODAL.logOut}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 
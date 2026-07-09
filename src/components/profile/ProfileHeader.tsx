'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Edit2, Camera, Lock, Briefcase, MapPin, DollarSign, Clock, FileText, CheckCircle, Building, Globe, Calendar, Users, Info, Layers } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import { FiMessageCircle, FiUserPlus, FiLoader, FiClock, FiCheck, FiUserCheck, FiX, FiShare2 } from "react-icons/fi";
import { FaWhatsapp, FaLinkedinIn, FaFacebookF } from 'react-icons/fa';
import { connectionService } from "@/lib/api/services/connectionService";
import { sendNotificationToUser } from "@/lib/firebaseNotifications";
import { useAuth } from '@/context/AuthContext';
import { THEME } from '../../styles/theme';
import { User } from '@/lib/api';
import type { UserProfile } from '@/lib/api/types';
import BasicDetailsModal from './BasicDetailsModal';
import CareerPreferencesModal from './CareerPreferencesModal';
import CompanyDetailsModal from './CompanyDetailsModal';
import { userService } from '@/lib/api/services/userService';
import toast from 'react-hot-toast';
import ImageCropModal from './ImageCropModal';
import ProfileSummary from './ProfileSummary';
import BasicDetails from './BasicDetails';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import MeetingModal from '../shared/MeetingModal';

interface ProfileHeaderProps {
  readOnly?: boolean;
  userData?: User;
  profileData?: UserProfile | null;
}

export default function ProfileHeader({ readOnly = false, userData, profileData }: ProfileHeaderProps) {
  const router = useRouter();
  const { user: currentUser, completionPercentage, refreshUser, isEmployer, profileLabel } = useAuth();


  // Priority: profileData (from API) > userData > currentUser
  const displayUser = profileData || (readOnly ? userData : currentUser);

  // Logic: Show contact info if NOT readOnly (my profile) OR viewer is premium
  // If displayUser is null (e.g. loading or error), we can't show much.
  const viewerIsPremium = currentUser?.is_premium || false;
  const canViewContact = !readOnly || viewerIsPremium;

  const [isBasicDetailsModalOpen, setBasicDetailsModalOpen] = useState(false);
  const [isCareerPreferencesModalOpen, setCareerPreferencesModalOpen] = useState(false);
  const [isCompanyDetailsModalOpen, setCompanyDetailsModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isHeadlineModalOpen, setHeadlineModalOpen] = useState(false);
  const [headlineValue, setHeadlineValue] = useState('');
  const [isUpdatingHeadline, setIsUpdatingHeadline] = useState(false);
  const [isAvatarFullscreen, setIsAvatarFullscreen] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<string>(
    readOnly && userData ? (userData as any)?.connection_status || 'not_connected' : 'not_connected'
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const { sectionId } = (e as CustomEvent).detail;
      if (sectionId === 'personal-information') {
        setBasicDetailsModalOpen(true);
      }
      if (sectionId === 'career-preferences') {
        setCareerPreferencesModalOpen(true);
      }
    };
    window.addEventListener('profile:open-modal', handler);
    return () => window.removeEventListener('profile:open-modal', handler);
  }, []);

  // Format connection_status for display
  const formatConnectionStatus = (status: string) => {
    if (!status || status === 'not_connected') return '+ Connect';
    const words = status.replace(/_/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  };

  // Get icon for status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <FiCheck size={16} />;
      case 'sent_connection': return <FiClock size={16} />;
      case 'received_connection': return <FiUserCheck size={16} />;
      default: return <FiUserPlus size={16} />;
    }
  };

  // Get button style based on status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'sent_connection':
        return 'bg-amber-50 text-amber-700 border-amber-200 cursor-default';
      case 'received_connection':
        return 'bg-blue-50 text-blue-700 border-blue-200 cursor-default';
      case 'not_connected':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200 cursor-default';
    }
  };

  const handleSendConnectionRequest = async () => {
    if (connectionStatus !== 'not_connected') return;
    if (!currentUser?.id || !userData?.id) {
      if (!currentUser?.id) toast.error("Please login to connect.");
      return;
    }

    setIsConnecting(true);
    try {
      const res: any = await connectionService.sendConnectionRequest(
        Number(currentUser.id),
        Number(userData.id)
      );

      if (res.status === 200 || res.status === 201 || res.success) {
        await sendNotificationToUser(
          Number(userData.id),
          Number(currentUser.id),
          `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
          currentUser.picture || '',
          'connection_request',
          `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() + ' sent you a connection request.'
        );
        toast.success("Connection request sent successfully!");
        setConnectionStatus('sent_connection');
      } else {
        toast.error(res.message || "Failed to send connection request");
      }
    } catch (error: any) {
      console.error("Connection request error:", error);
      const errMsg = error?.response?.data?.data?.errors?.message?.[0] ||
        error?.response?.data?.message ||
        error.message ||
        "Failed to send connection request";
      toast.error(errMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessageClick = () => {
    if (userData?.id) {
      router.push(`/profile/messages?chatWith=${userData.id}`);
    }
  };

  const handleMeetClick = () => {
    if (!currentUser?.is_premium) {
      setShowSubscriptionPopup(true);
      return;
    }
    setIsMeetingModalOpen(true);
  };

  const isOwnProfile = currentUser?.id && userData?.id && String(currentUser.id) === String(userData.id);

  const [cropModalConfig, setCropModalConfig] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    type: 'avatar' | 'cover';
  }>({ isOpen: false, imageSrc: null, type: 'avatar' });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleEditBasicDetails = () => setBasicDetailsModalOpen(true);
  const handleCloseModal = () => setBasicDetailsModalOpen(false);

  const handleUpdateHeadline = async () => {
    setIsUpdatingHeadline(true);
    try {
      await userService.editProfile({ headline: headlineValue } as any);
      await refreshUser();
      toast.success('Headline updated successfully!');
      setHeadlineModalOpen(false);
    } catch (error: any) {
      console.error('Failed to update headline:', error);
      toast.error('Failed to update headline');
    } finally {
      setIsUpdatingHeadline(false);
    }
  };

  const handleOpenHeadlineModal = () => {
    setHeadlineValue(displayUser?.headline || '');
    setHeadlineModalOpen(true);
  };

  const profileShareUrl = displayUser?.id
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://staffbook.in'}/user/${displayUser.id}`
    : '';

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(profileShareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
    toast.success('Profile link copied!');
  };

  // Helper to sanitize double URLs if they occur from backend
  const sanitizeUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('http') && url.lastIndexOf('http') > 0) {
      return url.substring(url.lastIndexOf('http'));
    }
    return url;
  };

  const handleAvatarClick = () => {
    if (!isUploadingAvatar) {
      if (displayUser?.picture) {
        setCropModalConfig({
          isOpen: true,
          imageSrc: sanitizeUrl(displayUser.picture),
          type: 'avatar'
        });
      } else {
        avatarInputRef.current?.click();
      }
    }
  };

  const handleCoverClick = () => {
    if (!isUploadingCover) {
      if (displayUser?.backpicture) {
        setCropModalConfig({
          isOpen: true,
          imageSrc: sanitizeUrl(displayUser.backpicture),
          type: 'cover'
        });
      } else {
        coverInputRef.current?.click();
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (cropModalConfig.imageSrc && cropModalConfig.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropModalConfig.imageSrc);
    }

    const imageDataUrl = URL.createObjectURL(file);
    setCropModalConfig({
      isOpen: true,
      imageSrc: imageDataUrl,
      type
    });

    event.target.value = '';
  };

  const handleCropSave = async (croppedFile: File) => {
    const { type, imageSrc } = cropModalConfig;
    if (imageSrc && imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
    setCropModalConfig({ isOpen: false, imageSrc: null, type: 'avatar' });

    try {
      if (type === 'avatar') {
        setIsUploadingAvatar(true);
        await userService.updateProfileImage(croppedFile);
      } else {
        setIsUploadingCover(true);
        await userService.updateProfileBackImage(croppedFile);
      }

      await refreshUser();
      toast.success(`${type === 'avatar' ? 'Profile' : 'Cover'} image updated successfully!`);
    } catch (error: any) {
      console.error(`Failed to upload ${type}:`, error);
      const errorMessage = error?.response?.data?.message || `Failed to upload ${type === 'avatar' ? 'profile' : 'cover'} image`;
      toast.error(errorMessage);
    } finally {
      if (type === 'avatar') {
        setIsUploadingAvatar(false);
      } else {
        setIsUploadingCover(false);
      }
    }
  };

  const handleCropDelete = async () => {
    const { type, imageSrc } = cropModalConfig;
    if (imageSrc && imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
    setCropModalConfig({ isOpen: false, imageSrc: null, type: 'avatar' });

    try {
      if (type === 'avatar') {
        setIsUploadingAvatar(true);
        await userService.deleteProfileImage();
      } else {
        setIsUploadingCover(true);
        await userService.deleteProfileBackImage();
      }
      await refreshUser();
      toast.success(`${type === 'avatar' ? 'Profile' : 'Cover'} image deleted successfully!`);
    } catch (error: any) {
      console.error(`Failed to delete ${type} image:`, error);
      toast.error(`Failed to delete ${type === 'avatar' ? 'profile' : 'cover'} image`);
    } finally {
      if (type === 'avatar') {
        setIsUploadingAvatar(false);
      } else {
        setIsUploadingCover(false);
      }
    }
  };

  // Get user data with defaults
  const displayName = displayUser ? `${displayUser.first_name} ${displayUser.last_name}` : "Guest User";
  const displayAvatar = sanitizeUrl(displayUser?.picture || "/images/user_profile_placeholder.jpeg");
  const displayCover = sanitizeUrl(displayUser?.backpicture || "/images/user_bg_placeholder.jpeg"); // Fallback cover
  const displayDesignation = displayUser?.designation || "Not specified";

  // Progress depends on whether it's our profile or someone else's
  const displayProgress = readOnly ? 0 : completionPercentage;

  return (
    <div className={`w-full ${THEME.components.card.default} !p-0 flex flex-col gap-0 relative overflow-hidden`}>
      {/* Cover Image Section */}
      <div className="relative h-32 md:h-48 w-full bg-gray-100">
        <Image
          src={displayCover}
          alt="Cover"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
          priority
        />
        {/* Hidden Cover Input */}
        {!readOnly && (
          <input
            type="file"
            ref={coverInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'cover')}
          />
        )}
        {/* Edit Cover Button */}
        {!readOnly && (
          <button
            onClick={handleCoverClick}
            disabled={isUploadingCover}
            className={`absolute top-4 right-4 p-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-sm transition-all group ${isUploadingCover ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isUploadingCover ? (
              <div className="w-[18px] h-[18px] border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Edit2 size={18} className="text-gray-700 group-hover:text-primary" />
            )}
          </button>
        )}
      </div>

      <div className="px-6 pb-6 flex flex-col gap-6">
        {/* Avatar and Name Section */}
        <div className="flex flex-col items-center -mt-12 md:-mt-16 relative">
          <div className="flex flex-col items-center relative z-1">
            <div className="relative group">
              <div
                className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] cursor-pointer"
                onClick={() => setIsAvatarFullscreen(true)}
              >
                {/* Avatar Image */}
                <div className="absolute inset-0 rounded-full overflow-hidden z-10">
                  {displayUser?.picture ? (
                    <Image src={displayAvatar} alt={displayName} fill sizes="(max-width: 768px) 100px, 120px" className="object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${THEME.colors.gradient.sky} flex items-center justify-center text-white font-bold text-4xl`}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {displayUser?.user_mode_type && displayUser.user_mode_type !== 'None' && (
                  <div className="absolute inset-[-4px] z-20 pointer-events-none rotate-45">
                    <Image
                      src={displayUser.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                      alt={displayUser.user_mode_type}
                      fill
                      sizes="(max-width: 768px) 100px, 120px"
                      className="object-contain drop-shadow-md -rotate-[15deg]"
                    />
                  </div>
                )}
              </div>
              {/* Edit Avatar Button */}
              {!readOnly && (
                <>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className={`absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors z-20 ${isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isUploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Edit2 size={16} className="text-gray-600" />
                    )}
                  </button>
                </>
              )}

              {/* Progress badge */}
              {!readOnly && (
                <div className={`absolute left-1/2 -bottom-2 -translate-x-1/2 bg-white rounded-full px-3 py-0.5 border border-purple-100 text-orange-500 font-bold text-[10px] md:text-sm shadow-sm text-center whitespace-nowrap z-20`}>
                  {displayProgress}%
                </div>
              )}
            </div>

            {/* Name below avatar */}
            <div className="flex flex-col items-center text-center mt-6">
              <h2 className={`text-xl md:text-2xl font-bold ${THEME.colors.text.heading} mb-2 flex items-center gap-2`}>
                {displayName}
                {displayUser?.is_premium && (
                  <Image
                    src="/staffbook-premium.png"
                    alt="Premium"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                )}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-full transition-colors shrink-0"
                  title="Share Profile"
                >
                  <FiShare2 size={16} />
                </button>
              </h2>
              {/* Headline */}
              <div className="flex items-center gap-2 mb-2 px-4 max-w-lg">
                <p className="text-gray-600 text-sm md:text-base font-medium line-clamp-2">
                  {displayUser?.headline || "No headline added"}
                </p>
                {!readOnly && (
                  <button
                    onClick={handleOpenHeadlineModal}
                    className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-full transition-colors shrink-0"
                    title="Edit Headline"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
              {/* Designation */}
              {displayUser?.designation && (
                <p className="text-gray-500 text-sm font-medium mb-1">
                  {displayUser.designation}
                </p>
              )}
              {/* Gradient Line below name */}
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full shadow-sm mb-4"></div>

              {/* Share Modal */}
              {showShareModal && (
                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
                  onClick={() => setShowShareModal(false)}
                >
                  <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowShareModal(false)}
                  />
                  <div
                    className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl animate-scaleIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Share Profile</h3>
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiX size={20} className="text-gray-500" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          name: "WhatsApp",
                          icon: <FaWhatsapp size={20} />,
                          color: "bg-[#25D366]",
                          url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this profile: ${displayName} - ${profileShareUrl}`)}`
                        },
                        {
                          name: "LinkedIn",
                          icon: <FaLinkedinIn size={20} />,
                          color: "bg-[#0077B5]",
                          url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileShareUrl)}`
                        },
                        {
                          name: "Facebook",
                          icon: <FaFacebookF size={20} />,
                          color: "bg-[#1877F2]",
                          url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileShareUrl)}`
                        }
                      ].map((option) => (
                        <a
                          key={option.name}
                          href={option.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 group"
                        >
                          <div className={`w-12 h-12 ${option.color} text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            {option.icon}
                          </div>
                          <span className="text-xs font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                            {option.name}
                          </span>
                        </a>
                      ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Or copy link</p>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                        <input
                          type="text"
                          readOnly
                          value={profileShareUrl}
                          className="flex-1 bg-transparent text-xs text-gray-500 outline-none truncate px-1"
                        />
                        <button
                          onClick={handleCopyShareLink}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          {shareCopied ? "COPIED" : "COPY"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connection Action Buttons */}
              {readOnly && !isOwnProfile && currentUser && (
                <div className="flex items-center gap-3 mt-2 mb-2 px-1">
                  {/* Message Button - only when connected */}
                  {connectionStatus === 'connected' && (
                    <button
                      onClick={handleMessageClick}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-sm"
                    >
                      <FiMessageCircle size={16} />
                      Message
                    </button>
                  )}

                  {/* Meet Button */}
                  <button
                    onClick={handleMeetClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 hover:border-purple-300 font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02] text-sm"
                  >
                    <Calendar size={16} />
                    Meet
                  </button>

                  {/* Connect / Status Button */}
                  {connectionStatus === 'not_connected' ? (
                    <button
                      onClick={handleSendConnectionRequest}
                      disabled={isConnecting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 font-bold rounded-xl transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConnecting ? (
                        <FiLoader className="animate-spin" size={16} />
                      ) : (
                        <FiUserPlus size={16} />
                      )}
                      {isConnecting ? 'Sending...' : '+ Connect'}
                    </button>
                  ) : connectionStatus !== 'connected' && (
                    <div
                      className={`flex items-center gap-2 px-5 py-2.5 border font-bold rounded-xl text-sm ${getStatusStyle(connectionStatus)}`}
                    >
                      {getStatusIcon(connectionStatus)}
                      {formatConnectionStatus(connectionStatus)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <ProfileSummary profileData={profileData ?? userData} readOnly={readOnly} />
        <BasicDetails profileData={profileData ?? userData} readOnly={readOnly} onEdit={handleEditBasicDetails} />
        {/* Subtle separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Career Preferences Section - Full Width */}

        {(displayUser as any)?.user_type !== 'employer' && (
          <div id="career-preferences" className="flex flex-col gap-4 w-full bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Career Preferences</h3>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  onClick={() => setCareerPreferencesModalOpen(true)}
                  aria-label="Edit Career Preferences"
                >
                  <Edit2 size={16} />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-12 md:gap-y-8">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Preferred Role</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any)?.preferred_role || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Preferred Location</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any)?.preferred_location || displayUser?.location || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <DollarSign size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Expected Salary</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any)?.expected_salary
                      ? `${(displayUser as any)?.expected_salary_currency || 'INR'} ${(displayUser as any)?.expected_salary}`
                      : (displayUser as any)?.preferred_salary
                        ? `INR ${(displayUser as any)?.preferred_salary}`
                        : "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Clock size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Preferred Work Shift</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any)?.preferred_shift || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Employment Type</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any)?.job_type || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-50 text-green-600 shrink-0">
                  <CheckCircle size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Work Status</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base text-green-600 font-bold`}>
                    {(displayUser as any)?.work_status || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Employer Details Section - Full Width (Moved to Company Tab) */}
        {/* {((displayUser as any)?.user_type === 'employer' || isEmployer) && (displayUser as any)?.employerDetails && (
          <div className="flex flex-col gap-4 w-full bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Company Details</h3>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  onClick={() => setCompanyDetailsModalOpen(true)}
                  aria-label="Edit Company Details"
                >
                  <Edit2 size={16} />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-12 md:gap-y-8">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Building size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Company Name</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any).employerDetails.company_name || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Globe size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Website</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any).employerDetails.company_website || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Founded</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any).employerDetails.founded || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Headquarter</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any).employerDetails.headquarter || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Layers size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Industry</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any).employerDetails.industry || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Users size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>Company Size</p>
                  <p className={`${THEME.components.typography.cardTitle} text-sm md:text-base font-semibold`}>
                    {(displayUser as any).employerDetails.company_size || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Info size={18} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`${THEME.components.typography.meta} text-gray-500`}>About Company</p>
                  <p className="text-gray-700 text-sm md:text-base">
                    {(displayUser as any).employerDetails.about_company || "No information provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )} */ }
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalConfig.isOpen}
        onClose={() => {
          if (cropModalConfig.imageSrc && cropModalConfig.imageSrc.startsWith('blob:')) URL.revokeObjectURL(cropModalConfig.imageSrc);
          setCropModalConfig({ isOpen: false, imageSrc: null, type: 'avatar' });
        }}
        onChangeImage={() => {
          if (cropModalConfig.type === 'avatar') {
            avatarInputRef.current?.click();
          } else {
            coverInputRef.current?.click();
          }
        }}
        imageSrc={cropModalConfig.imageSrc}
        onSave={handleCropSave}
        onDelete={handleCropDelete}
        aspectRatio={cropModalConfig.type === 'avatar' ? 1 : 4.5}
        title={cropModalConfig.type === 'avatar' ? 'Edit Profile Image' : 'Edit Banner Image (Ideal size: 1350 x 300 px)'}
        isCover={cropModalConfig.type === 'cover'}
      />

      {/* Edit Personal Info Modal */}
      <BasicDetailsModal
        open={isBasicDetailsModalOpen}
        onClose={handleCloseModal}
      />

      {/* Edit Career Preferences Modal */}
      <CareerPreferencesModal
        open={isCareerPreferencesModalOpen}
        onClose={() => setCareerPreferencesModalOpen(false)}
      />

      {/* Edit Company Details Modal */}
      <CompanyDetailsModal
        open={isCompanyDetailsModalOpen}
        onClose={() => setCompanyDetailsModalOpen(false)}
      />

      {/* Edit Headline Modal */}
      <Modal open={isHeadlineModalOpen} onClose={() => setHeadlineModalOpen(false)}>
        <div className="p-6 md:p-8 w-[90vw] md:w-[80vw] lg:w-[800px] bg-white rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Headline</h3>
          <div className="mb-6">
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Headline
            </label>
            <textarea
              id="headline"
              value={headlineValue}
              onChange={(e) => setHeadlineValue(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="e.g. Senior Software Engineer at Google | Flutter Expert"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setHeadlineModalOpen(false)}
              disabled={isUpdatingHeadline}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateHeadline}
              disabled={isUpdatingHeadline}
            >
              {isUpdatingHeadline ? 'Saving...' : 'Save Headline'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full Screen Avatar View */}
      {isAvatarFullscreen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsAvatarFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsAvatarFullscreen(false)}
          >
            <FiX size={24} />
          </button>
          <div className="relative w-[90vw] h-[90vh] max-w-4xl max-h-[800px]" onClick={e => e.stopPropagation()}>
            <Image
              src={displayAvatar}
              alt={displayName}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {displayUser && (
        <MeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
          initialCandidateName={`${displayUser?.first_name || ''} ${displayUser?.last_name || ''}`.trim() || displayUser?.username || 'User'}
          initialCandidateId={displayUser?.id ? Number(displayUser.id) : null}
          mode={currentUser?.user_type === 'employer' ? 'employer' : 'networking'}
        />
      )}

      {/* Subscription Popup */}
      {showSubscriptionPopup && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Subscription Required</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Buy a subscription to schedule a meeting with this user.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSubscriptionPopup(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
                  onClick={() => {
                    setShowSubscriptionPopup(false);
                    router.push('/services');
                  }}
                >
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
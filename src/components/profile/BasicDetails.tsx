'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Timer,
  Link as LinkIcon,
  Mail,
  Phone,
  ChevronRight,
  Globe,
  User2,
  Edit2,
  Lock
} from 'lucide-react';
import type { BasicDetails as BasicDetailsType } from '../../types/profile';
import { THEME } from '../../styles/theme';
import type { UserProfile } from '@/lib/api/types';
import apiClient from '@/lib/api/config';
import { useAuth } from '@/context/AuthContext';
import { useUserMode } from '@/context/UserModeContext';
import { RiProfileFill } from 'react-icons/ri';
import { FaGithub, FaLinkedin, FaProjectDiagram, FaRupeeSign } from 'react-icons/fa';
import Button from '../shared/Button';

interface BasicDetailsProps {
  profileData?: UserProfile | null;
  readOnly?: boolean;
  onEdit?: () => void;
}

export default function BasicDetails({ profileData, readOnly = false, onEdit }: BasicDetailsProps) {
  const { user } = useAuth();
  const { currentMode } = useUserMode();
  const router = useRouter();
  const [basicDetails] = useState<BasicDetailsType>();
  const [unlockedFields, setUnlockedFields] = useState<Set<string>>(new Set());
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  const handleUnlockClick = async (entryId: string | undefined) => {
    if (!user?.id || !entryId || loadingField) return;

    // Check if user has an active subscription
    if (!user?.is_premium) {
      setShowSubscriptionPopup(true);
      return;
    }

    try {
      setLoadingField(entryId);
      const endpoint = entryId === 'email' ? '/job-post/email-contact' : '/job-post/show-contact';

      const userType = user.user_type;
      const contactFlow = user.user_type === 'employer' ? 'employer_to_job_seeker' : 'job_seeker_to_employer';

      const payload: any = {
        contact_flow: contactFlow,
        count: 1,
        user_type: userType
      };

      if (contactFlow === 'employer_to_job_seeker') {
        payload.candidate_id = profileData?.id;
      } else {
        payload.employer_id = profileData?.id;
      }

      await apiClient.post(endpoint, payload);

      setUnlockedFields(prev => new Set(prev).add(entryId));
    } catch (error) {
      console.error('Error unlocking contact detail:', error);
    } finally {
      setLoadingField(null);
    }
  };

  // Helper function to get gender display text
  const getGenderText = (sex: number | string | null | undefined): string => {
    if (!sex) return 'Not specified';
    const sexNum = typeof sex === 'string' ? parseInt(sex) : sex;
    switch (sexNum) {
      case 1: return 'Male';
      case 2: return 'Female';
      case 3: return 'Other';
      default: return 'Not specified';
    }
  };

  const entries = [
    {
      icon: <Briefcase size={18} />,
      label: profileData?.total_experience || '0 years 0 months',
      color: 'text-gray-400',
      showForPublic: true
    },
    {
      icon: <MapPin size={18} />,
      label: (() => {
        const parts: string[] = [];
        if (profileData?.address) parts.push(profileData.address);
        if (profileData?.city) parts.push(profileData.city);
        if (profileData?.state) parts.push(profileData.state);
        if (profileData?.country) parts.push(profileData.country);
        if (parts.length > 0) return parts.join(', ');
        if (profileData?.location) return profileData.location;
        return 'Not specified';
      })(),
      color: 'text-gray-400',
      showForPublic: true
    },
    {
      icon: <FaRupeeSign size={18} />,
      label: profileData?.current_salary
        ? `${profileData?.current_salary_currency || 'INR'} ${profileData?.current_salary}`
        : 'Not specified',
      color: 'text-gray-400',
      showForPublic: true
    },
    {
      icon: <Timer size={18} />,
      label: `${profileData?.notice_period_months || '0'} month${profileData?.notice_period_months !== 1 ? 's' : ''}`,
      color: 'text-gray-400',
      showForPublic: true
    },
    {
      icon: <FaLinkedin size={18} />,
      label: profileData?.linkedin_profile || 'Not specified',
      color: 'text-gray-400',
      isLink: !!profileData?.linkedin_profile,
      showForPublic: false,
      id: 'linkedin'
    },
    {
      icon: <FaGithub size={18} />,
      label: profileData?.github_url || 'Not specified',
      color: 'text-gray-400',
      isLink: !!profileData?.github_url,
      showForPublic: false,
      id: 'github'
    },
    {
      icon: <Globe size={18} />,
      label: profileData?.website || 'Not specified',
      color: 'text-gray-400',
      isLink: !!profileData?.website,
      showForPublic: true,
      id: 'website'
    },
    {
      icon: <FaProjectDiagram size={18} />,
      label: profileData?.portfolio_url || 'Not specified',
      color: 'text-gray-400',
      isLink: !!profileData?.portfolio_url,
      showForPublic: true,
      id: 'portfolio'
    },
    {
      icon: <Mail size={18} />,
      label: profileData?.email || 'Not specified',
      color: 'text-gray-400',
      showForPublic: false,
      id: 'email'
    },
    {
      icon: <Phone size={18} />,
      label: profileData?.phone
        ? `${profileData?.country_code || '+91'}-${profileData?.phone}`
        : 'Not specified',
      color: 'text-gray-400',
      showForPublic: false,
      id: 'phone'
    },
    {
      icon: <User2 size={18} />,
      label: getGenderText(profileData?.sex),
      color: 'text-gray-400',
      showForPublic: true
    },
  ];

  return (
    <div id="personal-information" className={`${THEME.components.card.default} flex flex-col gap-4 relative h-fit shadow-sm border border-gray-100`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        {!readOnly && onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
            onClick={onEdit}
            aria-label="Edit Personal Information"
          >
            <Edit2 size={16} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {entries.filter(entry => {
          if (readOnly && ['linkedin', 'github', 'website', 'portfolio'].includes(entry.id || '')) {
            return false;
          }
          return true;
        }).map((entry, index) => {
          const isPrivate = readOnly && !entry.showForPublic;
          const isUnlocked = entry.id ? unlockedFields.has(entry.id) : false;
          const isBlurred = isPrivate && !isUnlocked;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 group ${isBlurred ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => {
                if (isBlurred) {
                  handleUnlockClick(entry.id);
                }
              }}
            >
              <div className={`p-2 rounded-lg bg-gray-50 ${entry.color} group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors shrink-0`}>
                {entry.icon}
              </div>
              <div className="relative flex-1 flex flex-col justify-center min-w-0">
                <div className={`${isBlurred ? 'blur-[4px] select-none opacity-50' : ''}`}>
                  {entry.isLink && !isBlurred ? (
                    <a
                      href={entry.label.startsWith('http') ? entry.label : `https://${entry.label}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] md:text-sm font-medium leading-snug break-all text-blue-600 hover:underline cursor-pointer"
                    >
                      {entry.label}
                    </a>
                  ) : (
                    <span className={`text-[12px] md:text-sm font-medium leading-snug break-all text-gray-700`}>
                      {isBlurred ? '••••••••••••••••' : entry.label}
                    </span>
                  )}
                </div>
                {isBlurred && (
                  <div className="absolute inset-0 flex items-center justify-start text-gray-600">
                    {loadingField === entry.id ? (
                      <span className="animate-spin border-2 border-gray-600 border-t-transparent rounded-full w-4 h-4" />
                    ) : (
                      <Lock size={16} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Popup */}
      {showSubscriptionPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Subscription Required</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Buy subscription to view contact details.
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
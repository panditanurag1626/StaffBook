import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  FiMapPin, FiBriefcase, FiBookmark, FiNavigation, FiUserPlus, FiX,
  FiMessageCircle, FiCheck, FiSend, FiMail, FiPhone, FiCalendar,
  FiMoreVertical, FiClock
} from 'react-icons/fi';
import PlatformActionButton from './PlatformActionButton';
import { useRouter } from 'next/navigation';
import { FaRupeeSign, FaStar } from 'react-icons/fa';
import { getRelativeTime } from '@/lib/utils';

interface JobInviteCardProps {
  jobId?: string;
  companyName: string;
  recruiterName?: string;
  companyLogo: string;
  posterImage?: string;
  distance: string;
  jobTitle: string;
  workType: string;
  jobType: string;
  location: string;
  salary: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onAccept: () => void;
  onDecline?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  skills?: string[];
  disabled?: boolean;
  connectionStatus?: string;
  onConnect?: (e: React.MouseEvent) => void;
  onShowEmail?: (e: React.MouseEvent) => void;
  onShowContact?: (e: React.MouseEvent) => void;
  onMeeting?: (e: React.MouseEvent) => void;
  postedDate?: string;
  posterDesignation?: string;
  experienceLevel?: string;
  isOnline?: boolean;
}

const formatSalaryLPACompact = (salary: string): string => {
  if (!salary) return '';
  const cleaned = salary.replace(/[₹,]/g, '').trim();
  const match = cleaned.match(/^([\d.]+)/);
  if (!match) return salary;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return salary;
  if (num < 100) return `₹ ${Math.round(num)} LPA`;
  const lpa = Math.round(num / 100000);
  return `₹ ${lpa} LPA`;
};

const JobInviteCard: React.FC<JobInviteCardProps> = ({
  jobId,
  companyName,
  recruiterName,
  companyLogo,
  posterImage,
  distance,
  jobTitle,
  workType,
  jobType,
  location,
  salary,
  primaryActionLabel = "Accept",
  secondaryActionLabel = "Ignore",
  onAccept,
  onDecline,
  onSave,
  isSaved,
  skills,
  disabled,
  connectionStatus,
  onConnect,
  onShowEmail,
  onShowContact,
  onMeeting,
  postedDate,
  posterDesignation,
  experienceLevel,
  isOnline,
}) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('[data-dropdown]')) {
      return;
    }
    if (jobId) {
      router.push(`/profile/jobs/${jobId}`);
    }
  };

  const dropdownActions: { icon: React.ElementType; label: string; onClick: (e: React.MouseEvent) => void; disabled?: boolean }[] = [];

  if (onSave) {
    dropdownActions.push({
      icon: FiBookmark,
      label: 'Save',
      onClick: (e) => { e.stopPropagation(); onSave(); setDropdownOpen(false); },
    });
  }

  if (onConnect) {
    const isConnected = connectionStatus === 'connected';
    const isPending = connectionStatus && connectionStatus !== 'not_connected' && connectionStatus !== 'connected';
    dropdownActions.push({
      icon: FiUserPlus,
      label: 'Connect',
      onClick: (e) => {
        e.stopPropagation();
        if (isConnected) {
          if (recruiterName) router.push(`/profile/messages`);
        } else if (!isPending) {
          onConnect(e);
        }
        setDropdownOpen(false);
      },
      disabled: !!(isConnected || isPending),
    });
  }

  if (onShowEmail) {
    dropdownActions.push({
      icon: FiMail,
      label: 'Email',
      onClick: (e) => { e.stopPropagation(); onShowEmail(e); setDropdownOpen(false); },
    });
  }

  if (onShowContact) {
    dropdownActions.push({
      icon: FiPhone,
      label: 'Contact',
      onClick: (e) => { e.stopPropagation(); onShowContact(e); setDropdownOpen(false); },
    });
  }

  if (onMeeting) {
    dropdownActions.push({
      icon: FiCalendar,
      label: 'Meeting',
      onClick: (e) => { e.stopPropagation(); onMeeting(e); setDropdownOpen(false); },
    });
  }

  const avatarUrl = posterImage?.startsWith('/') || posterImage?.startsWith('http') ? posterImage : null;
  const logoUrl = companyLogo?.startsWith('/') || companyLogo?.startsWith('http') ? companyLogo : null;

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 w-full flex flex-col h-full overflow-hidden ${jobId ? 'cursor-pointer hover:border-purple-200 transition-colors' : ''}`}
    >
      {/* Cover Banner with 3-dots top-right */}
      <div className="relative w-full h-28 sm:h-32 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-gray-50 border-b border-gray-100">
        {/* Three Dots — top right of card */}
        <div className="absolute top-2 right-2 z-20" data-dropdown ref={dropdownRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setDropdownOpen(prev => !prev); }}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors text-gray-500 hover:text-gray-700 shadow-sm backdrop-blur-sm"
          >
            <FiMoreVertical size={17} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 min-w-[170px]">
              {dropdownActions.map((action, idx) => (
                <button
                  key={idx}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${action.disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'}`}
                >
                  <action.icon size={16} />
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Company Logo — fills entire banner */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={companyName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl font-bold text-purple-700/50">{companyName.charAt(0)}</span>
        )}

        {/* Distance — overlays logo bottom-right */}
        <div className="absolute bottom-2 right-3 sm:right-4 z-10 flex items-center gap-1 text-[10px] text-gray-500 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
          <FiNavigation size={9} className="text-purple-400" />
          <span className="font-medium">{distance}</span>
        </div>

        {/* Recruiter DP overlapping bottom-left */}
        <div className="absolute -bottom-5 left-3 sm:left-4 z-10">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-md overflow-hidden flex items-center justify-center bg-gray-100">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={recruiterName || companyName}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-purple-600">
                  {(recruiterName || companyName).charAt(0)}
                </span>
              )}
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-[2px] border-white rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* Recruiter Info Row */}
      <div className="px-4 sm:px-5 pt-6 sm:pt-7 pb-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{recruiterName || companyName}</h3>
          {posterDesignation && (
            <p className="text-[11px] text-gray-500 font-medium truncate">{posterDesignation}</p>
          )}
          {postedDate && (
            <div className="flex items-center gap-1 text-[10px] text-purple-600 mt-1">
              <FiClock size={9} className="text-purple-400" />
              <span className="font-medium">Posted {getRelativeTime(postedDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col px-4 sm:px-5 pb-0">
        {/* Job Title */}
        <div className="mb-3">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight line-clamp-1">{jobTitle}</h2>
        </div>

        {/* Details Grid — Micro-badges */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FiBriefcase size={11} className="text-purple-500 flex-shrink-0" />
            <span className="text-[9px] font-semibold text-gray-600 truncate">{workType}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FaStar size={10} className="text-amber-500 flex-shrink-0" />
            <span className="text-[9px] font-semibold text-gray-600 truncate">{experienceLevel || jobType}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FiMapPin size={11} className="text-red-400 flex-shrink-0" />
            <span className="text-[9px] font-semibold text-gray-600 truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FaRupeeSign size={11} className="text-green-500 flex-shrink-0" />
            <span className="text-[9px] font-bold text-gray-900 truncate">{formatSalaryLPACompact(salary)}</span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t border-gray-50 px-3 sm:px-4 py-2.5 mt-auto">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {onDecline && (
            <PlatformActionButton
              icon={FiX}
              label={secondaryActionLabel}
              showLabelBelow
              onClick={(e) => { e.stopPropagation(); onDecline(); }}
              title={secondaryActionLabel}
            />
          )}
          <PlatformActionButton
            icon={primaryActionLabel.toLowerCase().includes('apply') ? FiSend : FiCheck}
            label={primaryActionLabel}
            showLabelBelow
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); if (!disabled) onAccept(); }}
            title={primaryActionLabel}
          />
        </div>
      </div>
    </div>
  );
};

export default JobInviteCard;

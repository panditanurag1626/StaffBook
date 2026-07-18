'use client'
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FiBookmark, FiUserPlus, FiMail, FiPhone, FiSend, FiCheck,
  FiNavigation, FiBriefcase, FiClock, FiImage
} from 'react-icons/fi';
import { FaRupeeSign, FaStar } from 'react-icons/fa';
import PlatformActionButton from './PlatformActionButton';
import { getRelativeTime } from '@/lib/utils';

interface JobData {
  id: string;
  company: string;
  position: string;
  location: string;
  salary: string;
  type: string;
  companyLogo?: string;
  posterName?: string;
  posterImage?: string;
  posterDesignation?: string;
  isOnline?: boolean;
  workMode?: string;
  experienceLevel?: string;
  distance?: number;
  distanceDisplay?: string;
  isSaved?: boolean;
  isApplied?: boolean;
  is_applied?: boolean;
  connection_status?: string;
  postedDate?: string;
  skills?: string[];
  contactUserId?: number;
}

interface FindJobCardProps {
  job: JobData;
  onSave: () => void;
  onConnect: (e: React.MouseEvent) => void;
  onShowEmail: (e: React.MouseEvent) => void;
  onShowContact: (e: React.MouseEvent) => void;
  onApply: () => void;
  formatConnStatus: (status?: string) => string;
}

const FindJobCard: React.FC<FindJobCardProps> = ({
  job,
  onSave,
  onConnect,
  onShowEmail,
  onShowContact,
  onApply,
  formatConnStatus,
}) => {
  const router = useRouter();
  const mountTimestamp = useRef(Date.now());
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);
  const isApplied = job.isApplied || job.is_applied;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-dropdown]')) return;
    if (job.id) router.push(`/profile/jobs/${job.id}`);
  };

  const distanceText = job.distanceDisplay || (job.distance ? `${job.distance.toFixed(1)} km away` : null);
  const cacheKey = job.postedDate || String(mountTimestamp.current);
  const logoUrl = job.companyLogo?.startsWith('/') || job.companyLogo?.startsWith('http')
    ? `${job.companyLogo}${job.companyLogo.includes('?') ? '&' : '?'}_t=${cacheKey}`
    : null;
  const companyInitial = (job.company || '?').charAt(0);
  const posterInitial = ((job.posterName || job.company) || '?').charAt(0);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full flex flex-col h-full overflow-hidden cursor-pointer hover:border-purple-200 transition-colors"
    >
      {/* Cover Banner */}
      <div className="relative w-full h-28 sm:h-32 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-gray-50 border-b border-gray-100">
        {/* Company Logo */}
        {logoUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-gray-50">
            <img
              src={logoUrl}
              alt={job.company}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-50/30 to-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/50">
              <FiImage size={24} className="text-purple-300" />
            </div>
          </div>
        )}

        {/* Distance Badge */}
        {distanceText && (
          <div className="absolute bottom-2 right-3 sm:right-4 z-10 flex items-center gap-1 text-[10px] text-gray-500 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
            <FiNavigation size={9} className="text-purple-400" />
            <span className="font-medium">{distanceText}</span>
          </div>
        )}

        {/* Recruiter DP overlapping bottom-left */}
        <div className="absolute -bottom-5 left-3 sm:left-4 z-10">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-md overflow-hidden flex items-center justify-center bg-gray-100">
              {job.posterImage ? (
                <Image
                  src={job.posterImage}
                  alt={job.posterName || job.company}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-purple-600">
                  {posterInitial}
                </span>
              )}
            </div>
            {job.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-[2px] border-white rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="px-4 sm:px-5 pt-6 sm:pt-7 pb-1">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
          {job.posterName || job.company}
        </h3>
        {job.posterDesignation && (
          <p className="text-[11px] text-gray-500 font-medium truncate">{job.posterDesignation}</p>
        )}
        {job.postedDate && (
          <div className="flex items-center gap-1 text-[10px] text-purple-600 mt-1">
            <FiClock size={9} className="text-purple-400" />
            <span className="font-medium">Posted {getRelativeTime(job.postedDate)}</span>
          </div>
        )}
      </div>

      {/* Job Title */}
      <div className="flex-1 flex flex-col px-4 sm:px-5 pb-0">
        <div className="mb-3">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight line-clamp-1">
            {job.position}
          </h2>
        </div>

        {/* 2x2 Micro-badge Grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FiBriefcase size={11} className="text-purple-500 flex-shrink-0" />
            <span className="text-[9px] font-semibold text-gray-600 truncate">{job.workMode || "Work from office"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FaStar size={10} className="text-amber-500 flex-shrink-0" />
            <span className="text-[9px] font-semibold text-gray-600 truncate">{job.experienceLevel || job.type}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FiNavigation size={11} className="text-red-400 flex-shrink-0" />
            <span className="text-[9px] font-semibold text-gray-600 truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FaRupeeSign size={11} className="text-green-500 flex-shrink-0" />
            <span className="text-[9px] font-bold text-gray-900 truncate">{job.salary}</span>
          </div>
        </div>

        {/* Skills tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {job.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-50 text-[9px] font-bold text-gray-500 rounded-md border border-gray-100">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-[9px] text-gray-400 font-bold self-center">+{job.skills.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="border-t border-gray-50 px-3 sm:px-4 py-2.5 mt-auto">
        <div className="flex items-center justify-between gap-0.5">
          <PlatformActionButton
            icon={FiBookmark}
            label="Save"
            showLabelBelow
            isSaved={job.isSaved}
            onClick={(e) => { e.stopPropagation(); onSave(); }}
          />
          <PlatformActionButton
            icon={FiUserPlus}
            label="Connect"
            showLabelBelow
            disabled={!!(job.connection_status && job.connection_status !== 'not_connected')}
            isRevealed={job.connection_status === 'connected'}
            isLocked={!!(job.connection_status && job.connection_status !== 'not_connected' && job.connection_status !== 'connected')}
            onClick={(e) => { e.stopPropagation(); onConnect(e); }}
          />
          <PlatformActionButton
            icon={FiMail}
            label="Email"
            showLabelBelow
            isRevealed={emailRevealed}
            onClick={(e) => { e.stopPropagation(); setEmailRevealed(true); onShowEmail(e); }}
          />
          <PlatformActionButton
            icon={FiPhone}
            label="Contact"
            showLabelBelow
            isRevealed={contactRevealed}
            onClick={(e) => { e.stopPropagation(); setContactRevealed(true); onShowContact(e); }}
          />
          <PlatformActionButton
            icon={isApplied ? FiCheck : FiSend}
            label={isApplied ? "Applied" : "Apply"}
            showLabelBelow
            isLocked={isApplied}
            onClick={(e) => { e.stopPropagation(); if (!isApplied) onApply(); }}
          />
        </div>
      </div>
    </div>
  );
};

export default FindJobCard;

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { THEME } from '@/styles/theme';
import { FiPhone, FiMail, FiXCircle, FiCheck, FiChevronDown, FiChevronUp, FiBookmark, FiMessageCircle, FiMapPin, FiLoader, FiUserPlus, FiMoreVertical, FiClock } from 'react-icons/fi';
import { jobService } from '@/lib/api/services/jobService';

export interface TimelineEvent {
  title: string;
  date: string;
  status?: 'completed' | 'current' | 'rejected' | 'pending';
}

export interface AppliedJobProps {
  jobId?: string | number;
  recruiter: {
    id?: string | number;
    name: string;
    company: string;
    avatar: string;
    email: string;
    designation?: string;
  };
  job: {
    title: string;
    appliedDate: string;
    location?: string;
  };
  timeline: TimelineEvent[];
  applicationId?: number | string;
  onWithdraw?: () => void;
  onContactPhone?: (e: React.MouseEvent) => void;
  onContactEmail?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  onSave?: (e: React.MouseEvent) => void;
  connectionStatus?: string;
  onConnect?: (e: React.MouseEvent) => void;
  skills?: string[];
}

const AppliedJobCard: React.FC<AppliedJobProps> = ({
  jobId,
  recruiter,
  job,
  timeline: initialTimeline,
  applicationId,
  onWithdraw,
  onContactPhone,
  onContactEmail,
  isSaved,
  onSave,
  connectionStatus,
  onConnect,
  skills,
}) => {
  const router = useRouter();
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimeline);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
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

  useEffect(() => {
    const fetchTimeline = async () => {
      if (isTimelineExpanded && applicationId && timeline.length === initialTimeline.length) {
        setIsLoadingTimeline(true);
        try {
          const response = await jobService.getApplicationTimeline(applicationId);
          if (response.data?.data?.timeline) {
            const apiTimeline = response.data.data.timeline.map((event: any) => ({
              title: event.status_text,
              date: event.event_date_formatted || event.event_date_relative || 'Pending',
              status: event.is_completed ? 'completed' : event.is_current ? 'current' : 'pending'
            }));
            setTimeline(apiTimeline);
          }
        } catch (error) {
          console.error('Failed to fetch timeline:', error);
        } finally {
          setIsLoadingTimeline(false);
        }
      }
    };

    fetchTimeline();
  }, [isTimelineExpanded, applicationId]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-dropdown]')) return;
    if (jobId) router.push(`/profile/jobs/${jobId}`);
  };

  const mountTs = useRef(Date.now());
  const avatarUrl = recruiter.avatar?.startsWith('/') || recruiter.avatar?.startsWith('http')
    ? `${recruiter.avatar}${recruiter.avatar.includes('?') ? '&' : '?'}_t=${mountTs.current}`
    : null;
  const nameInitial = (recruiter.name || '?').charAt(0);

  const dropdownActions: { icon: React.ElementType; label: string; onClick: (e: React.MouseEvent) => void; disabled?: boolean }[] = [];

  if (onSave) {
    dropdownActions.push({
      icon: FiBookmark,
      label: 'Save',
      onClick: (e) => { e.stopPropagation(); onSave(e); setDropdownOpen(false); },
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
          if (recruiter.id) router.push(`/profile/messages?chatWith=${recruiter.id}`);
        } else if (!isPending) {
          onConnect(e);
        }
        setDropdownOpen(false);
      },
      disabled: !!(isConnected || isPending),
    });
  }

  if (onContactEmail) {
    dropdownActions.push({
      icon: FiMail,
      label: 'Email',
      onClick: (e) => { e.stopPropagation(); onContactEmail(e); setDropdownOpen(false); },
    });
  }

  if (onContactPhone) {
    dropdownActions.push({
      icon: FiPhone,
      label: 'Contact',
      onClick: (e) => { e.stopPropagation(); onContactPhone(e); setDropdownOpen(false); },
    });
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full flex flex-col h-full overflow-hidden cursor-pointer hover:border-purple-200 transition-colors"
    >
      {/* Cover Banner */}
      <div className="relative w-full h-28 sm:h-32 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-gray-50 border-b border-gray-100">
        {/* Company Initial in Banner */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50/30 to-gray-50">
          <div className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/50">
            <span className="text-xl font-bold text-purple-400">
              {(recruiter.company || '?').charAt(0)}
            </span>
          </div>
        </div>

        {/* 3-dots Dropdown */}
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

        {/* Applied Date Badge */}
        <div className="absolute bottom-2 right-3 sm:right-4 z-10 flex items-center gap-1 text-[10px] text-gray-500 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
          <FiClock size={9} className="text-purple-400" />
          <span className="font-medium">Applied {job.appliedDate}</span>
        </div>

        {/* Recruiter DP / Company Logo overlapping bottom-left */}
        <div className="absolute -bottom-5 left-3 sm:left-4 z-10">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg shadow-md overflow-hidden flex items-center justify-center bg-white border border-gray-100">
              {avatarUrl ? (
                <img src={avatarUrl} alt={recruiter.company} className="w-full h-full object-contain p-0.5" />
              ) : (
                <span className="text-sm font-bold text-purple-600">{nameInitial}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="px-4 sm:px-5 pt-6 sm:pt-7 pb-1">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
          {recruiter.name}
        </h3>
        <p className="text-[11px] text-gray-500 font-medium truncate">{recruiter.designation || 'Hiring Manager'}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="bg-green-50 text-green-600 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md border border-green-100 flex items-center gap-1 w-fit">
            <FiCheck size={10} />
            Verified
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 flex flex-col px-4 sm:px-5 pb-0">
        {/* Job Title */}
        <div className="mb-2">
          {jobId ? (
            <Link href={`/profile/jobs/${jobId}`} className="hover:opacity-80 transition-opacity">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight line-clamp-1">{job.title}</h2>
            </Link>
          ) : (
            <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight line-clamp-1">{job.title}</h2>
          )}
          <p className="text-xs font-semibold text-gray-600 mt-0.5">{recruiter.company}</p>
        </div>

        {/* Micro-badge Grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FiMapPin size={11} className="text-red-400 flex-shrink-0" />
            <span className="text-[9px] font-semibold text-gray-600 truncate">{job.location || 'Location N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FiCheck size={11} className="text-green-500 flex-shrink-0" />
            <span className="text-[9px] font-semibold text-gray-600 truncate">Applied</span>
          </div>
        </div>

        {/* Application Status Accordion */}
        <div className="mt-2 mb-3 p-[1.5px] rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 shadow-sm">
          <button
            onClick={(e) => { e.stopPropagation(); setIsTimelineExpanded(!isTimelineExpanded); }}
            className="w-full bg-white hover:bg-gray-50/50 rounded-[11px] px-3 py-2.5 flex items-center justify-between transition-all group"
          >
            <span className="uppercase tracking-widest text-[9px] font-black text-[#9333EA] whitespace-nowrap">
              Application Status
            </span>
            <div className="flex-shrink-0 ml-2">
              {isTimelineExpanded ? (
                <FiChevronUp size={14} className="text-[#9333EA]" />
              ) : (
                <FiChevronDown size={14} className="text-[#9333EA]" />
              )}
            </div>
          </button>
        </div>

        {isTimelineExpanded && (
          <div className="bg-gray-50/30 border border-t-0 border-purple-100 rounded-b-xl p-4 -mt-1 animate-fadeIn max-h-44 overflow-y-auto mb-3" onClick={(e) => e.stopPropagation()}>
            {isLoadingTimeline ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500 font-medium">Loading timeline...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-0 relative pl-1">
                <div className="absolute left-[11.25px] top-3 bottom-8 w-[1.5px] bg-[#E5E7EB]">
                  <div
                    className="absolute top-0 left-0 w-full bg-[#10B981] transition-all duration-1000"
                    style={{
                      height: `${(timeline.filter(t => t.status === 'completed' || t.status === 'current').length - 1) / (timeline.length - 1) * 100}%`
                    }}
                  />
                </div>

                {timeline.map((event, index) => {
                  const isCompleted = event.status === 'completed';
                  const isCurrent = event.status === 'current';
                  const isRejected = event.status === 'rejected';

                  return (
                    <div key={index} className="relative flex items-start gap-4 pb-8 last:pb-2 group">
                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 bg-white border-2 ${(isCompleted || isCurrent) ? 'border-[#10B981] text-[#10B981]' :
                        isRejected ? 'border-[#EF4444] text-[#EF4444]' :
                          'border-gray-200 text-gray-300'
                        }`}>
                        {isRejected ? (
                          <FiXCircle size={12} />
                        ) : (isCompleted || isCurrent) ? (
                          <FiCheck size={12} />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 -mt-0.5">
                        <span className={`text-sm font-bold transition-colors ${(isCompleted || isCurrent || isRejected) ? 'text-gray-900' : 'text-gray-400'}`}>
                          {event.title}
                        </span>
                        <span className="text-xs font-medium text-gray-500">{event.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Withdraw Only */}
      <div className="border-t border-gray-50 px-3 sm:px-4 py-2.5 mt-auto">
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onWithdraw?.(); }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 group-hover:border-red-300 group-hover:bg-red-50 flex items-center justify-center transition-all duration-200">
              <FiXCircle size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-normal text-gray-400 group-hover:text-red-500 transition-colors">
              Withdraw
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppliedJobCard;

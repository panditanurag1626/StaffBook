'use client';

import React, { useState, useEffect } from 'react';
import Card from './Card';
import { jobService } from '@/lib/api/services/jobService';
import { THEME } from '@/styles/theme';
import PlatformActionButton from './PlatformActionButton';

import {
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiNavigation,
  FiClock,
  FiUserPlus,
  FiCalendar,
  FiDownload,
  FiFileText,
  FiPhone,
  FiMail,
  FiStar,
  FiCheck,
  FiImage,
  FiVideo,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiXCircle,
  FiLoader,
} from 'react-icons/fi';
import { Candidate } from '@/types/candidate';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { notifyJobInvite, notifyProfileActivity } from '@/lib/firebaseNotifications';

interface CandidateCardProps {
  candidate: Candidate;
  onDownloadResume?: (name: string) => void;
  actionAction?: 'shortlist' | 'invite';
  isSelected?: boolean;
  onSelectionChange?: (candidateId: string, isChecked: boolean) => void;
  isResponseView?: boolean;
  jobPostId?: string | number;
  onStatusUpdate?: (candidateId: string, status: 'shortlisted' | 'rejected') => void;
}

import { useRouter } from 'next/navigation';
import { FaRupeeSign } from 'react-icons/fa';
import { formatSalaryLPA } from '@/lib/utils';

export default function CandidateCard({ candidate, onDownloadResume, actionAction = 'shortlist', isSelected, onSelectionChange, isResponseView = false, jobPostId, onStatusUpdate }: CandidateCardProps) {
  const { user } = useAuth();
  const [isChecked, setIsChecked] = useState(false);
  const checked = isSelected !== undefined ? isSelected : isChecked;
  const router = useRouter();

  // Invite state
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>(() => {
    return (candidate.is_invited || candidate.invite?.is_invited) ? 'sent' : 'idle';
  });
  const [showInlineDropdown, setShowInlineDropdown] = useState(false);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const fetchJobsForDropdown = async () => {
    if (jobsList.length > 0) return;
    setIsLoadingJobs(true);
    try {
      const res = await jobService.getMyJobPosts(100, 'apply');
      if (res?.data?.items && Array.isArray(res.data.items)) {
        setJobsList(res.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch jobs for dropdown:', err);
      toast.error('Failed to load your job posts.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (window.getSelection()?.toString()) return;
    if (jobPostId) {
      router.push(`/profile/find-candidates/${candidate.userId}?jobId=${jobPostId}`);
    } else {
      router.push(`/profile/find-candidates/${candidate.userId}`);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleInviteButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inviteStatus === 'sent' || inviteStatus === 'loading') return;

    if (jobPostId) {
      handleSendInvite(e);
    } else {
      setShowInlineDropdown(true);
      await fetchJobsForDropdown();
    }
  };

  useEffect(() => {
    setInviteStatus((candidate.is_invited || candidate.invite?.is_invited) ? 'sent' : 'idle');
  }, [candidate.id, candidate.userId, candidate.is_invited, candidate.invite?.is_invited]);

  useEffect(() => {
    const handleGlobalInvite = (e: Event) => {
      const customEvent = e as CustomEvent;
      const invitedId = customEvent.detail?.candidateId;
      const currentId = candidate.userId || candidate.id;
      
      if (invitedId && String(invitedId) === String(currentId)) {
        setInviteStatus('sent');
      }
    };
    
    window.addEventListener('staffbook_candidateInvited', handleGlobalInvite);
    return () => window.removeEventListener('staffbook_candidateInvited', handleGlobalInvite);
  }, [candidate.id, candidate.userId]);

  const handleSendInviteWithJob = async (selectedId: string | number) => {
    if (inviteStatus === 'sent' || inviteStatus === 'loading') return;

    setInviteStatus('loading');
    try {
      await jobService.sendJobInvite(selectedId, candidate.userId || candidate.id);
      setInviteStatus('sent');
      setShowInlineDropdown(false);
      toast.success("Job invitation sent!");

      // Dispatch global invite sync event
      window.dispatchEvent(new CustomEvent('staffbook_candidateInvited', { detail: { candidateId: candidate.userId || candidate.id } }));

      if (user?.id && candidate.userId && String(user.id) !== String(candidate.userId)) {
        notifyJobInvite(candidate.userId, user.id, user.employerDetails?.company_name || `${user.first_name} ${user.last_name}`, user.picture || '', selectedId);
      }
    } catch (err: any) {
      console.error('Send invite error:', err);
      setInviteStatus('error');
      let errMsg = 'Failed to send invite';
      if (err.response?.data?.data?.errors?.message?.[0]) {
        errMsg = err.response.data.data.errors.message[0];
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      if (errMsg.toLowerCase().includes('already applied') || errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('already invited')) {
        errMsg = 'This user has already applied for this job.';
      }
      toast.error(errMsg);
      setTimeout(() => setInviteStatus('idle'), 3000);
    }
  };

  const handleSendInvite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!jobPostId) {
      toast.error('Please select a job post first to send an invite.');
      return;
    }
    if (inviteStatus === 'sent' || inviteStatus === 'loading') return;

    setInviteStatus('loading');
    try {
      await jobService.sendJobInvite(jobPostId, candidate.userId || candidate.id);
      setInviteStatus('sent');
      toast.success("Job invitation sent!");

      // Dispatch global invite sync event
      window.dispatchEvent(new CustomEvent('staffbook_candidateInvited', { detail: { candidateId: candidate.userId || candidate.id } }));

      if (user?.id && candidate.userId && String(user.id) !== String(candidate.userId)) {
        notifyJobInvite(candidate.userId, user.id, user.employerDetails?.company_name || `${user.first_name} ${user.last_name}`, user.picture || '', jobPostId);
      }
    } catch (err: any) {
      console.error('Send invite error:', err);
      setInviteStatus('error');
      let errMsg = 'Failed to send invite';
      if (err.response?.data?.data?.errors?.message?.[0]) {
        errMsg = err.response.data.data.errors.message[0];
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      if (errMsg.toLowerCase().includes('already applied') || errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('already invited')) {
        errMsg = 'This user has already applied for this job.';
      }
      toast.error(errMsg);
      setTimeout(() => setInviteStatus('idle'), 3000);
    }
  };

  const [showContactStatus, setShowContactStatus] = useState<'idle' | 'loading' | 'revealed' | 'error'>('idle');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEmailStatus, setShowEmailStatus] = useState<'idle' | 'loading' | 'revealed' | 'error'>('idle');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleShowContact = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showContactStatus === 'revealed') {
      setShowContactModal(true);
      return;
    }

    // if (!jobPostId) {
    //   toast.error('Cannot show contact outside of a job post context.');
    //   return;
    // }

    if (showContactStatus === 'loading') return;

    setShowContactStatus('loading');
    try {
      const resp = await jobService.revealCandidateContact(
        Number(jobPostId),
        Number(candidate.userId || candidate.id)
      );

      const responseData = resp;
      if (responseData.status === 200 || responseData.status === 201 || responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked) {
        setShowContactStatus('revealed');
        setShowContactModal(true);
        setIsShortlisted(true);
        toast.success(responseData.message || "Contact details unlocked!");

        if (user?.id && candidate.userId && String(user.id) !== String(candidate.userId)) {
          // Notify whenever contact is viewed, regardless of previous status
          notifyProfileActivity(candidate.userId, user.id, user.employerDetails?.company_name || `${user.first_name} ${user.last_name}`, user.picture || '', 'contact_view');
        }
      } else {
        throw new Error(responseData.message || "Failed to unlock contact");
      }
    } catch (err: any) {
      console.error('Show contact error:', err);
      let errMsg = 'Failed to reveal contact';
      if (err.response?.data?.data?.errors?.message?.[0]) {
        errMsg = err.response.data.data.errors.message[0];
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
      setShowContactStatus('error');
      setTimeout(() => setShowContactStatus('idle'), 3000);
    }
  };

  const handleShowEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showEmailStatus === 'revealed') {
      setShowEmailModal(true);
      return;
    }

    // if (!jobPostId) {
    //   toast.error('Cannot show email outside of a job post context.');
    //   return;
    // }

    if (showEmailStatus === 'loading') return;

    setShowEmailStatus('loading');
    try {
      const resp = await jobService.revealCandidateEmail(
        Number(jobPostId),
        Number(candidate.userId || candidate.id)
      );

      const responseData = resp;
      if (responseData.status === 200 || responseData.status === 201 || responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked || responseData.message?.includes("already unlocked")) {
        setShowEmailStatus('revealed');
        setShowEmailModal(true);
        toast.success(responseData.message || "Email details unlocked!");

        if (user?.id && candidate.userId && String(user.id) !== String(candidate.userId)) {
          // Notify whenever email is viewed
          notifyProfileActivity(candidate.userId, user.id, user.employerDetails?.company_name || `${user.first_name} ${user.last_name}`, user.picture || '', 'email_view');
        }
      } else {
        throw new Error(responseData.message || "Failed to unlock email");
      }
    } catch (err: any) {
      console.error('Show email error:', err);
      let errMsg = 'Failed to reveal email';
      if (err.response?.data?.data?.errors?.message?.[0]) {
        errMsg = err.response.data.data.errors.message[0];
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
      setShowEmailStatus('error');
      setTimeout(() => setShowEmailStatus('idle'), 3000);
    }
  };

  const [downloadResumeStatus, setDownloadResumeStatus] = useState<'idle' | 'loading' | 'downloaded' | 'error'>('idle');

  const handleDownloadAction = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // if (!jobPostId) {
    //   if (onDownloadResume) {
    //     onDownloadResume(candidate.name);
    //   } else {
    //     toast.error('Cannot download resume. Context missing.');
    //   }
    //   return;
    // }

    if (downloadResumeStatus === 'loading') return;

    setDownloadResumeStatus('loading');
    try {
      const resp = await jobService.downloadCandidateResume(
        Number(jobPostId),
        Number(candidate.userId || candidate.id)
      );

      const responseData = resp;
      if (responseData.status === 200 || responseData.status === 201 || responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked || responseData.message?.includes("already marked")) {
        setDownloadResumeStatus('downloaded');
        toast.success(responseData.message || "Resume download processed successfully!");

        let resumeUrlToOpen = candidate.resumeUrl;
        if (responseData.data && (responseData.data.resume_url || responseData.data.data?.resume_url)) {
          resumeUrlToOpen = responseData.data.resume_url || responseData.data.data?.resume_url;
        }

        if (resumeUrlToOpen) {
          window.open(resumeUrlToOpen, '_blank');
        } else {
          // Fallback to parent handler or error
          if (onDownloadResume) {
            onDownloadResume(candidate.name);
          } else {
            toast.error('Resume URL not available');
          }
        }

        if (user?.id && candidate.userId && String(user.id) !== String(candidate.userId)) {
          // Notify whenever a download is processed, even if already unlocked/marked
          notifyProfileActivity(candidate.userId, user.id, user.employerDetails?.company_name || `${user.first_name} ${user.last_name}`, user.picture || '', 'resume_download');
        }
      } else {
        throw new Error(responseData.message || "Failed to process resume download");
      }
    } catch (err: any) {
      console.error('Download resume error:', err);
      let errMsg = 'Failed to process resume download';
      if (err.response?.data?.data?.errors?.message?.[0]) {
        errMsg = err.response.data.data.errors.message[0];
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
      setDownloadResumeStatus('error');
      setTimeout(() => setDownloadResumeStatus('idle'), 3000);
    }
  };


  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isPrescreeningExpanded, setIsPrescreeningExpanded] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'shortlisted' | 'rejected'>('idle');
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Sync status with timeline from props
  useEffect(() => {
    if (candidate.timeline) {
      const shortlisted = candidate.timeline.find(t => t.status_code === 7 && (t.is_completed || t.is_current));
      const rejected = candidate.timeline.find(t => t.status_code === 11 && (t.is_completed || t.is_current));

      if (shortlisted) {
        setApplicationStatus('shortlisted');
      } else if (rejected) {
        setApplicationStatus('rejected');
      } else {
        setApplicationStatus('idle');
      }
    }
  }, [candidate.timeline]);
  console.log(candidate);

  const MediaBadge = () => {
    if (candidate.mediaCount || candidate.hasReel) {
      return (
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
          {candidate.mediaCount && (
            <div className="flex items-center gap-1">
              <FiImage className="text-white w-3 h-3" />
              <span className="text-white text-[10px] font-bold">{candidate.mediaCount}</span>
            </div>
          )}
          {candidate.hasReel && (
            <div className="flex items-center gap-1">
              {candidate.mediaCount && <span className="text-white/50 text-[10px] mx-0.5">|</span>}
              <FiVideo className="text-white w-3 h-3" />
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative h-full transition-all duration-300 ${candidate.is_premium ? 'p-[3px] rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 shadow-purple-500/20 shadow-lg hover:shadow-purple-500/40' : ''}`}>
      {candidate.is_premium && (
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black px-3 md:px-6 py-1 rounded-b-xl shadow-md z-50 tracking-widest uppercase border-x border-b border-white/20 backdrop-blur-sm whitespace-nowrap">
            Premium Candidate
          </div>
        </div>
      )}
      <Card
        className={`hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border-0 bg-white h-full ${candidate.is_premium ? 'rounded-[13px]' : ''}`}
        noPadding
        onClick={handleCardClick}
      >
        {/* Mobile Layout - Hero Image with Scrollable Overlay */}
        <div className="md:hidden relative h-[500px] w-full">
          {/* Background Image */}
          <div className="absolute inset-0">
            {candidate.image ? (
              <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${THEME.colors.gradient.sky} flex items-center justify-center text-white font-bold text-6xl`}>
                {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            {candidate.user_mode_type && candidate.user_mode_type !== 'None' && (
              <div className="absolute inset-[-10px] z-20 pointer-events-none rotate-45 scale-[0.6] origin-center">
                <img
                  src={candidate.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                  alt={candidate.user_mode_type}
                  className="w-full h-full object-contain drop-shadow-md -rotate-[15deg]"
                />
              </div>
            )}
          </div>

          {/* Selection Checkbox */}
          <div className="absolute top-4 left-4 z-20">
            <input
              type="checkbox"
              checked={checked}
              onClick={handleActionClick}
              onChange={(e) => {
                const newChecked = e.target.checked;
                if (onSelectionChange) {
                  onSelectionChange(candidate.id, newChecked);
                } else {
                  setIsChecked(newChecked);
                }
              }}
              className="w-5 h-5 rounded border-white/20 bg-black/40 text-purple-600 focus:ring-purple-500 cursor-pointer shadow-sm backdrop-blur-md"
            />
          </div>

          {/* Media Badge */}
          <div className="absolute top-4 right-4 z-10">
            <MediaBadge />
          </div>

          {/* Distance Badge */}
          {candidate.distance_display && candidate.distance_display !== "Location not available" && (
            <div className="absolute top-14 left-4 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
              <FiNavigation size={10} className="text-purple-300" />
              <span>{candidate.distance_display}</span>
            </div>
          )}

          {/* Overlay at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black via-black/95 to-transparent pt-12">
            <div className="p-4 flex flex-col text-left">
              {/* Name / Company */}
              <h3 className="text-sm sm:text-base font-semibold text-white truncate">{candidate.name.toUpperCase()}</h3>
              {candidate.company && <p className="text-white/70 text-xs font-medium mt-0.5">{candidate.company}</p>}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
                <div>
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Salary</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <FaRupeeSign size={10} className="text-green-400" />{formatSalaryLPA(candidate.salary)}
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Location</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                    <FiMapPin size={10} className="text-red-400" />{candidate.location.split(',')[0]}
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Experience</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <FiBriefcase size={10} className="text-purple-400" />{candidate.experience}
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Designation</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                    <FiBriefcase size={10} className="text-purple-400" />{candidate.title}
                  </div>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {candidate?.skills?.slice(0, 6)?.map((s: any, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-white/10 text-white/80 text-[9px] font-bold rounded-md border border-white/10 backdrop-blur-sm">
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pre-screening */}
              {isResponseView && (
                <div className="w-full text-left mt-3 mb-2">
                  <button onClick={(e) => { e.stopPropagation(); setIsPrescreeningExpanded(!isPrescreeningExpanded); }}
                    className="flex items-center gap-2 text-[10px] font-bold text-white/90 hover:text-white transition-colors uppercase tracking-wide mb-2">
                    <FiFileText size={12} className="text-purple-400" />
                    Pre-screening Responses
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isPrescreeningExpanded ? 'bg-purple-600 text-white rotate-180' : 'bg-purple-100 text-purple-600'}`}>
                      <FiChevronDown size={12} />
                    </div>
                  </button>
                  {isPrescreeningExpanded && (
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 space-y-3 border border-white/10">
                      {candidate.screeningAnswers?.length ? candidate.screeningAnswers.map((qa, i) => (
                        <div key={i} className="bg-white/10 rounded-lg p-3 space-y-1">
                          <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">{qa.question}</p>
                          <p className="text-sm font-medium text-white/90 leading-relaxed">{qa.answer}</p>
                        </div>
                      )) : <p className="text-xs font-medium text-white/60 text-center py-2">No screening responses available</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between w-full max-w-sm mx-auto gap-1 mt-2 pt-3 border-t border-white/10">
                {isResponseView ? (
                  <PlatformActionButton icon={FiPhone}
                    label={showContactStatus === 'loading' ? '...' : 'Contact'}
                    showLabelBelow isLoading={showContactStatus === 'loading'} isRevealed={showContactStatus === 'revealed'} onClick={handleShowContact} labelClassName="text-white" />
                ) : showInlineDropdown ? (
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                    <select className="bg-gray-900 text-white text-[9px] font-black uppercase tracking-wider rounded-lg px-2 py-1.5 border border-white/10 outline-none focus:ring-1 focus:ring-purple-500 max-w-[100px]"
                      value="" disabled={inviteStatus === 'loading'}
                      onChange={async (e) => { const v = e.target.value; if (v) await handleSendInviteWithJob(v); }}
                      onClick={(e) => e.stopPropagation()}>
                      <option value="" disabled>{isLoadingJobs ? 'Loading...' : inviteStatus === 'loading' ? 'Sending...' : 'Select Job'}</option>
                      {jobsList.map(job => (
                        <option key={job.id} value={job.id} className="bg-gray-900 text-white font-bold text-[10px] normal-case">{job.job_title || job.title} ({formatDate(job.created_at)})</option>
                      ))}
                    </select>
                    {inviteStatus === 'loading' ? (
                      <div className="w-6 h-6 flex items-center justify-center text-white shrink-0"><FiLoader className="animate-spin" size={12} /></div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); setShowInlineDropdown(false); }}
                        className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0"><FiX size={12} strokeWidth={3} /></button>
                    )}
                  </div>
                ) : (
                  <PlatformActionButton icon={inviteStatus === 'sent' ? FiCheck : FiBriefcase}
                    label={inviteStatus === 'loading' ? '...' : inviteStatus === 'error' ? 'Failed' : 'Job Invite'}
                    showLabelBelow isLoading={inviteStatus === 'loading'} disabled={inviteStatus === 'sent'} onClick={handleInviteButtonClick} labelClassName="text-white" />
                )}
                <PlatformActionButton icon={FiPhone}
                  label={showContactStatus === 'loading' ? '...' : 'Contact'}
                  showLabelBelow isLoading={showContactStatus === 'loading'} isRevealed={showContactStatus === 'revealed'} onClick={handleShowContact} labelClassName="text-white" />
                <PlatformActionButton icon={FiMail}
                  label={showEmailStatus === 'loading' ? '...' : 'Email'}
                  showLabelBelow isLoading={showEmailStatus === 'loading'} isRevealed={showEmailStatus === 'revealed'} onClick={handleShowEmail} labelClassName="text-white" />
                <PlatformActionButton icon={FiCalendar} label="Meetings" showLabelBelow labelClassName="text-white"
                  onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('openMeetingModal', { detail: { candidateName: candidate.name, candidateId: candidate.userId, jobPostId } })); }} />
                <PlatformActionButton icon={FiDownload}
                  label={downloadResumeStatus === 'loading' ? '...' : 'Download CV'}
                  showLabelBelow isLoading={downloadResumeStatus === 'loading'} isRevealed={downloadResumeStatus === 'downloaded'} onClick={handleDownloadAction} labelClassName="text-white" />
              </div>

              {/* Select / Reject */}
              {onStatusUpdate && (
                <div className="flex gap-3 w-full mt-3" onClick={handleActionClick}>
                  <button onClick={(e) => { e.stopPropagation(); setApplicationStatus('shortlisted'); onStatusUpdate(candidate.id, 'shortlisted'); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all duration-300 ${applicationStatus === 'shortlisted' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-900/40' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'}`}>
                    {applicationStatus === 'shortlisted' ? '✓ Shortlisted' : 'Shortlist'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setApplicationStatus('rejected'); onStatusUpdate(candidate.id, 'rejected'); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all duration-300 ${applicationStatus === 'rejected' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-900/40' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'}`}>
                    {applicationStatus === 'rejected' ? '✗ Rejected' : 'Reject'}
                  </button>
                </div>
              )}

              {/* Timeline */}
              {candidate.timeline && candidate.timeline.length > 0 && onStatusUpdate && (
                <div className="w-full mt-3">
                  <button onClick={(e) => { e.stopPropagation(); setIsTimelineOpen(!isTimelineOpen); }}
                    className="w-full py-2 px-3 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-between text-white/80 hover:text-white transition-colors">
                    <span className="text-[9px] font-black uppercase tracking-widest">Application Timeline</span>
                    {isTimelineOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                  {isTimelineOpen && (
                    <div className="mt-2 bg-black/50 backdrop-blur-md rounded-xl p-4 border border-white/10 max-h-[200px] overflow-y-auto">
                      <div className="space-y-0 relative pl-1">
                        <div className="absolute left-[11.25px] top-3 bottom-8 w-[1.5px] bg-white/20">
                          <div className="absolute top-0 left-0 w-full bg-green-400 transition-all duration-1000"
                            style={{ height: `${(candidate.timeline.filter(t => t.is_completed || t.is_current).length - 1) / Math.max(candidate.timeline.length - 1, 1) * 100}%` }} />
                        </div>
                        {candidate.timeline.map((step, idx) => (
                          <div key={idx} className="relative flex items-start gap-3 pb-6 last:pb-1">
                            <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 bg-black/60 ${step.is_completed || step.is_current ? 'border-green-400 text-green-400' : 'border-white/20 text-white/20'}`}>
                              {(step.is_completed || step.is_current) ? <FiCheck size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                            </div>
                            <div className="-mt-0.5">
                              <span className={`text-xs font-bold ${(step.is_completed || step.is_current) ? 'text-white' : 'text-white/40'}`}>{step.status_text}</span>
                              {step.event_date_relative && <p className="text-[10px] text-white/50">{step.event_date_relative}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout - Split Card */}
        <div className="hidden md:flex flex-row h-[320px]">
          {/* Left/Main Section - Info */}
          <div className="flex-1 p-6 flex flex-col relative bg-white overflow-y-auto">
            {/* Selection Checkbox */}
            <div className="absolute top-6 left-6 z-20">
              <input
                type="checkbox"
                checked={checked}
                onClick={handleActionClick}
                onChange={(e) => {
                  const newChecked = e.target.checked;
                  if (onSelectionChange) {
                    onSelectionChange(candidate.id, newChecked);
                  } else {
                    setIsChecked(newChecked);
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer shadow-sm"
              />
            </div>

            <div className="ml-8 flex flex-col">
              {/* Header */}
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate tracking-tight group-hover:text-purple-600 transition-colors">{candidate.name}</h3>
                    {candidate.isOnline && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold tracking-wider uppercase border border-green-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Online
                      </span>
                    )}
                  </div>
                </div>
                {/* Distance Badge */}
                {candidate.distance_display && candidate.distance_display !== "Location not available" && (
                  <div className="flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-100 w-fit">
                    <FiNavigation size={10} className="text-purple-400" />
                    <span>{candidate.distance_display}</span>
                  </div>
                )}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800 truncate">
                    <FiUserPlus className="text-blue-500" size={14} />
                    {candidate.company || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800 truncate">
                    <FiBriefcase className="text-purple-500" size={14} />
                    {candidate.title}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Salary</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                    <FaRupeeSign className="text-green-500" size={14} />
                    {formatSalaryLPA(candidate.salary)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <FiBriefcase className="text-purple-500" size={14} />
                    {candidate.experience}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <FiMapPin className="text-red-500" size={14} />
                    {candidate.location.split(',')[0]}
                  </div>
                </div>
                <div className="space-y-3 col-span-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skills</span>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidate?.skills?.slice(0, 3)?.map((s: any, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-100">
                          {s.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {isResponseView && (
                <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsPrescreeningExpanded(!isPrescreeningExpanded); }}
                    className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-wide group/accordion"
                  >
                    Pre-screening Responses
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${isPrescreeningExpanded ? 'bg-purple-600 text-white rotate-180 shadow-md shadow-purple-200' : 'bg-purple-50 text-purple-600 group-hover/accordion:bg-purple-100'}`}>
                      <FiChevronDown size={12} />
                    </div>
                  </button>

                  {isPrescreeningExpanded && (
                    <div className="mt-3 space-y-3">
                      {candidate.screeningAnswers && candidate.screeningAnswers.length > 0 ? (
                        candidate.screeningAnswers.map((qa, index) => (
                          <div key={index} className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 space-y-1.5">
                            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">{qa.question}</p>
                            <p className="text-sm font-medium text-gray-800 leading-relaxed">{qa.answer}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm font-medium text-gray-500 text-center py-2">No screening responses available</p>
                      )}
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>

          {/* Right Action Section - Full Image with Overlay */}
          <div className="w-[400px] relative flex-shrink-0 bg-gray-100 h-[320px]">
            {/* Candidate Image */}
            {candidate.image ? (
              <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${THEME.colors.gradient.sky} flex items-center justify-center text-white font-bold text-6xl`}>
                {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            {candidate.user_mode_type && candidate.user_mode_type !== 'None' && (
              <div className="absolute inset-[-10px] z-20 pointer-events-none rotate-45 scale-[0.6] origin-center">
                <img
                  src={candidate.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                  alt={candidate.user_mode_type}
                  className="w-full h-full object-contain drop-shadow-md -rotate-[15deg]"
                />
              </div>
            )}

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

            {/* Media Badge (Replaces Distance) */}
            <div className="absolute top-4 right-4 z-10">
              <MediaBadge />
            </div>

            {/* Action Icons Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
              <div className="flex items-center justify-between gap-2">
                {isResponseView ? (
                  <PlatformActionButton
                    icon={FiPhone}
                    label={showContactStatus === 'loading' ? '...' : 'Contact'}
                    showLabelBelow
                    isLoading={showContactStatus === 'loading'}
                    isRevealed={showContactStatus === 'revealed'}
                    onClick={handleShowContact}
                    labelClassName="text-white"
                  />
                ) : showInlineDropdown ? (
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20 animate-in zoom-in-95 duration-200">
                    <select
                      className="bg-gray-900 text-white text-[9px] font-black uppercase tracking-wider rounded-lg px-2 py-1.5 border border-white/10 outline-none focus:ring-1 focus:ring-purple-500 max-w-[110px]"
                      value=""
                      disabled={inviteStatus === 'loading'}
                      onChange={async (e) => {
                        const selectedId = e.target.value;
                        if (selectedId) {
                          await handleSendInviteWithJob(selectedId);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="" disabled>{isLoadingJobs ? 'Loading...' : inviteStatus === 'loading' ? 'Sending...' : 'Select Job'}</option>
                      {jobsList.map(job => (
                        <option key={job.id} value={job.id} className="bg-gray-900 text-white font-bold text-[10px] normal-case">
                          {job.job_title || job.title} ({formatDate(job.created_at)})
                        </option>
                      ))}
                    </select>
                    {inviteStatus === 'loading' ? (
                      <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
                        <FiLoader className="animate-spin" size={12} />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowInlineDropdown(false); }}
                        className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0"
                      >
                        <FiX size={12} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ) : (
                  <PlatformActionButton
                    icon={inviteStatus === 'sent' ? FiCheck : FiBriefcase}
                    label={inviteStatus === 'loading' ? '...' : inviteStatus === 'error' ? 'Failed' : 'Job Invite'}
                    showLabelBelow
                    isLoading={inviteStatus === 'loading'}
                    disabled={inviteStatus === 'sent'}
                    onClick={handleInviteButtonClick}
                    labelClassName="text-white"
                  />
                )}
                <PlatformActionButton
                  icon={FiPhone}
                  label={showContactStatus === 'loading' ? '...' : 'Contact'}
                  showLabelBelow
                  isLoading={showContactStatus === 'loading'}
                  isRevealed={showContactStatus === 'revealed'}
                  onClick={handleShowContact}
                  labelClassName="text-white"
                />
                <PlatformActionButton
                  icon={FiMail}
                  label={showEmailStatus === 'loading' ? '...' : 'Email'}
                  showLabelBelow
                  isLoading={showEmailStatus === 'loading'}
                  isRevealed={showEmailStatus === 'revealed'}
                  onClick={handleShowEmail}
                  labelClassName="text-white"
                />
                <PlatformActionButton
                  icon={FiCalendar}
                  label="Meetings"
                  showLabelBelow
                  className='text-white'
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('openMeetingModal', {
                      detail: {
                        candidateName: candidate.name,
                        candidateId: candidate.userId,
                        jobPostId: jobPostId
                      }
                    }));
                  }}
                  labelClassName="text-white"
                />
                <PlatformActionButton
                  icon={FiDownload}
                  label={downloadResumeStatus === 'loading' ? '...' : 'Download CV'}
                  showLabelBelow
                  isLoading={downloadResumeStatus === 'loading'}
                  isRevealed={downloadResumeStatus === 'downloaded'}
                  onClick={handleDownloadAction}
                  labelClassName="text-white"
                />
              </div>
            </div>
          </div>
        </div >

        {/* Select / Reject Buttons - Desktop */}
        {onStatusUpdate && (
          <div className="hidden md:flex border-t border-gray-100" onClick={handleActionClick}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setApplicationStatus('shortlisted');
                onStatusUpdate(candidate.id, 'shortlisted');
              }}
              className={`flex-1 py-3 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border-r border-gray-100 ${applicationStatus === 'shortlisted'
                ? 'bg-green-50 text-green-600'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <FiCheck size={16} /> {applicationStatus === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setApplicationStatus('rejected');
                onStatusUpdate(candidate.id, 'rejected');
              }}
              className={`flex-1 py-3 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${applicationStatus === 'rejected'
                ? 'bg-red-50 text-red-500'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <FiX size={16} /> {applicationStatus === 'rejected' ? 'Rejected' : 'Reject'}
            </button>
          </div>
        )}

        {/* Timeline Toggle - Desktop */}
        {candidate.timeline && candidate.timeline.length > 0 && onStatusUpdate && (
          <div className="hidden md:block border-t border-gray-100" onClick={handleActionClick}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsTimelineOpen(!isTimelineOpen); }}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Application Timeline</span>
              {isTimelineOpen ? <FiChevronUp size={14} className="text-purple-600" /> : <FiChevronDown size={14} className="text-purple-600" />}
            </button>
            {isTimelineOpen && (
              <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <div className="space-y-0 relative pl-1">
                    <div className="absolute left-[11.25px] top-3 bottom-8 w-[1.5px] bg-gray-200">
                      <div
                        className="absolute top-0 left-0 w-full bg-green-500 transition-all duration-1000"
                        style={{
                          height: `${(candidate.timeline.filter(t => t.is_completed || t.is_current).length - 1) / Math.max(candidate.timeline.length - 1, 1) * 100}%`
                        }}
                      />
                    </div>
                    {candidate.timeline.map((step, idx) => (
                      <div key={idx} className="relative flex items-start gap-4 pb-7 last:pb-1 group">
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-white border-2 ${step.is_completed || step.is_current ? 'border-green-500 text-green-500' : 'border-gray-200 text-gray-300'
                          }`}>
                          {(step.is_completed || step.is_current) ? <FiCheck size={12} /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                        </div>
                        <div className="-mt-0.5">
                          <span className={`text-sm font-bold ${(step.is_completed || step.is_current) ? 'text-gray-900' : 'text-gray-400'}`}>{step.status_text}</span>
                          {step.event_date_relative && <p className="text-xs text-gray-500">{step.event_date_relative}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showContactModal && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowContactModal(false); }}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
                <button onClick={(e) => { e.stopPropagation(); setShowContactModal(false); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                  <FiX size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FiPhone className="text-green-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{candidate.phone || "Not available"}</p>
                  </div>
                </div>
              </div>

              <button onClick={(e) => { e.stopPropagation(); setShowContactModal(false); }} className="mt-8 w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-sm">
                Done
              </button>
            </div>
          </div>
        )}

        {showEmailModal && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowEmailModal(false); }}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Email Details</h3>
                <button onClick={(e) => { e.stopPropagation(); setShowEmailModal(false); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                  <FiX size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FiMail className="text-blue-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email Address</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{candidate.email || "Not available"}</p>
                  </div>
                </div>
              </div>

              <button onClick={(e) => { e.stopPropagation(); setShowEmailModal(false); }} className="mt-8 w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-sm">
                Done
              </button>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}

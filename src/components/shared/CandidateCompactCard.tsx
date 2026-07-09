'use client';

import React from 'react';
import Image from 'next/image';
import { FiNavigation, FiBriefcase, FiPhone, FiCalendar, FiMail, FiDownload, FiCheck, FiLoader, FiX } from 'react-icons/fi';
import { Candidate } from '@/types/candidate';
import { THEME } from '@/styles/theme';
import { jobService } from '@/lib/api/services/jobService';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { notifyJobInvite } from '@/lib/firebaseNotifications';
import PlatformActionButton from './PlatformActionButton';


interface CandidateCompactCardProps {
  candidate: Candidate;
  onDownloadResume?: (name: string) => void;
  jobPostId?: string | number;
}

export default function CandidateCompactCard({ candidate, onDownloadResume, jobPostId }: CandidateCompactCardProps) {
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = React.useState<'idle' | 'sent'>(() => {
    return (candidate.is_invited || candidate.invite?.is_invited) ? 'sent' : 'idle';
  });
  const [revealedActions, setRevealedActions] = React.useState<{ contact?: boolean, email?: boolean, cv?: boolean }>({});
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [showInlineDropdown, setShowInlineDropdown] = React.useState(false);
  const [jobsList, setJobsList] = React.useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = React.useState(false);
  const router = useRouter();

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

  const handleInviteButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inviteStatus === 'sent' || loadingAction === 'invite') return;

    if (jobPostId) {
      await handleInvite(e);
    } else {
      setShowInlineDropdown(true);
      await fetchJobsForDropdown();
    }
  };

  React.useEffect(() => {
    setInviteStatus((candidate.is_invited || candidate.invite?.is_invited) ? 'sent' : 'idle');
  }, [candidate.id, candidate.userId, candidate.is_invited, candidate.invite?.is_invited]);

  React.useEffect(() => {
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
    if (inviteStatus === 'sent' || loadingAction === 'invite') return;

    setLoadingAction('invite');
    try {
      await jobService.sendJobInvite(selectedId, candidate.userId || candidate.id);
      setInviteStatus('sent');
      setShowInlineDropdown(false);
      toast.success("Job invitation sent!");

      // Dispatch global invite sync event
      window.dispatchEvent(new CustomEvent('staffbook_candidateInvited', { detail: { candidateId: candidate.userId || candidate.id } }));

      // Firebase notification
      if (user?.id && candidate.userId && String(user.id) !== String(candidate.userId)) {
        notifyJobInvite(candidate.userId, user.id, user.employerDetails?.company_name || `${user.first_name} ${user.last_name}`, user.picture || '', selectedId);
      }
    } catch (err: any) {
      console.error('Send invite error:', err);
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
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInvite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!jobPostId) {
      toast.error("Please select a job post to send invites.");
      return;
    }
    if (inviteStatus === 'sent' || loadingAction === 'invite') return;

    setLoadingAction('invite');
    try {
      await jobService.sendJobInvite(jobPostId, candidate.userId || candidate.id);
      setInviteStatus('sent');
      toast.success("Job invitation sent!");

      // Dispatch global invite sync event
      window.dispatchEvent(new CustomEvent('staffbook_candidateInvited', { detail: { candidateId: candidate.userId || candidate.id } }));

      // Firebase notification
      if (user?.id && candidate.userId && String(user.id) !== String(candidate.userId)) {
        notifyJobInvite(candidate.userId, user.id, user.employerDetails?.company_name || `${user.first_name} ${user.last_name}`, user.picture || '', jobPostId);
      }
    } catch (err: any) {
      let errMsg = "Failed to send invite";
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
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRevealAction = async (e: React.MouseEvent, type: 'contact' | 'email' | 'cv') => {
    e.stopPropagation();

    // If already revealed, just open modal (for contact/email)
    if (revealedActions[type as 'contact' | 'email']) {
      if (type === 'contact') setShowContactModal(true);
      if (type === 'email') setShowEmailModal(true);
      return;
    }

    // if (!jobPostId) {
    //   toast.error("Job context missing.");
    //   return;
    // }
    if (loadingAction) return;

    setLoadingAction(type);
    try {
      let res;
      const isEmployer = user?.user_type === 'employer';
      const payload: any = {
        job_post_id: Number(jobPostId),
        count: 1,
        user_type: isEmployer ? 'employer' : 'job_seeker',
        contact_flow: isEmployer ? 'employer_to_job_seeker' : 'job_seeker_to_employer'
      };

      if (isEmployer) {
        payload.candidate_id = Number(candidate.userId || candidate.id);
      } else {
        payload.employer_id = Number(candidate.userId || candidate.id);
      }

      if (type === 'contact') {
        res = await jobService.revealCandidateContact(jobPostId, candidate.userId || candidate.id, payload);
      } else if (type === 'email') {
        res = await jobService.revealCandidateEmail(jobPostId, candidate.userId || candidate.id, payload);
      } else if (type === 'cv') {
        res = await jobService.downloadCandidateResume(jobPostId, candidate.userId || candidate.id);
      }

      const responseData = res;
      if (responseData && (responseData.status === 200 || responseData.status === 201 || responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked)) {
        setRevealedActions(prev => ({ ...prev, [type]: true }));
        toast.success(responseData.message || `${type.toUpperCase()} details unlocked!`);

        if (type === 'contact') setShowContactModal(true);
        if (type === 'email') setShowEmailModal(true);

        if (type === 'cv' && (responseData.data?.resume_url || responseData.data?.data?.resume_url)) {
          window.open(responseData.data.resume_url || responseData.data.data?.resume_url, '_blank');
        }
      }
    } catch (err: any) {
      let errMsg = `Failed to unlock ${type}`;
      if (err.response?.data?.data?.errors?.message?.[0]) {
        errMsg = err.response.data.data.errors.message[0];
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setLoadingAction(null);
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

  return (
    <div onClick={handleCardClick} className={`relative transition-all duration-300 ${candidate.is_premium ? 'p-[3px] rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 shadow-purple-500/20 shadow-lg hover:shadow-purple-500/40' : ''}`}>
      {candidate.is_premium && (
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[7px] font-black px-3 md:px-6 py-1 rounded-b-xl shadow-md z-50 tracking-widest uppercase border-x border-b border-white/20 backdrop-blur-sm whitespace-nowrap">
            Premium Candidate
          </div>
        </div>
      )}
      <div className={`bg-white flex flex-col hover:shadow-lg transition-all duration-300 group cursor-pointer shadow-sm gap-5 ${candidate.is_premium ? 'rounded-[13px] p-4 h-full border-0' : 'rounded-2xl p-4 border border-gray-100'}`}>
        {/* Top: Profile Info */}
        <div className="flex items-center gap-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]`}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-[1px]">
                <img
                  src={candidate.image || "/images/user_profile_placeholder.jpeg"}
                  alt={candidate.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            {/* Online Status Dot */}
            {candidate.isOnline && (
              <div className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Name, Company, Title, and Distance */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight truncate">
                {candidate.name}
              </h3>
            </div>
            {candidate.company && (
              <span className="text-xs text-gray-600 font-semibold truncate block">{candidate.company}</span>
            )}
            <span className="text-xs text-gray-500 font-semibold truncate block">{candidate.title}</span>
            {candidate.distance_display && candidate.distance_display !== "Location not available" && (
              <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold whitespace-nowrap bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 mt-1 w-fit">
                <FiNavigation size={9} />
                <span>{candidate.distance_display} KM</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row - Below */}
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-gray-50">
          {showInlineDropdown ? (
            <div className="flex items-center gap-1 bg-purple-50 p-1.5 rounded-xl border border-purple-100 shrink-0 min-w-0">
              <select
                className="bg-white text-gray-800 text-[10px] font-black uppercase tracking-wider rounded-lg px-2 py-1.5 border border-purple-200 outline-none focus:ring-1 focus:ring-purple-500 max-w-[100px] shrink-0"
                value=""
                disabled={loadingAction === 'invite'}
                onChange={async (e) => {
                  const selectedId = e.target.value;
                  if (selectedId) {
                    await handleSendInviteWithJob(selectedId);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="" disabled>{isLoadingJobs ? 'Loading...' : loadingAction === 'invite' ? 'Sending...' : 'Select Job'}</option>
                {jobsList.map(job => (
                  <option key={job.id} value={job.id} className="bg-white text-gray-800 font-bold text-[10px] normal-case">
                    {job.job_title || job.title} ({formatDate(job.created_at)})
                  </option>
                ))}
              </select>
              {loadingAction === 'invite' ? (
                <div className="w-6 h-6 flex items-center justify-center text-purple-600 shrink-0">
                  <FiLoader className="animate-spin" size={12} />
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowInlineDropdown(false); }}
                  className="w-6 h-6 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-600 shrink-0"
                >
                  <FiX size={12} strokeWidth={3} />
                </button>
              )}
            </div>
          ) : (
            <PlatformActionButton
              icon={loadingAction === 'invite' ? FiLoader : inviteStatus === 'sent' ? FiCheck : FiBriefcase}
              label="Job Invite"
              showLabelBelow
              isLoading={loadingAction === 'invite'}
              disabled={inviteStatus === 'sent'}
              onClick={handleInviteButtonClick}
            />
          )}
          <PlatformActionButton
            icon={FiPhone}
            label="Contact"
            showLabelBelow
            isLoading={loadingAction === 'contact'}
            isRevealed={revealedActions.contact}
            onClick={(e: React.MouseEvent) => handleRevealAction(e, 'contact')}
          />
          <PlatformActionButton
            icon={FiMail}
            label="Email"
            showLabelBelow
            isLoading={loadingAction === 'email'}
            isRevealed={revealedActions.email}
            onClick={(e: React.MouseEvent) => handleRevealAction(e, 'email')}
          />
          <PlatformActionButton
            icon={FiCalendar}
            label="Meetings"
            showLabelBelow
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('openMeetingModal', {
                detail: {
                  candidateName: candidate.name,
                  candidateId: candidate.userId || candidate.id,
                  jobPostId: jobPostId || undefined
                }
              }));
            }}
          />
          <PlatformActionButton
            icon={FiDownload}
            label="Download CV"
            showLabelBelow
            isLoading={loadingAction === 'cv'}
            isRevealed={revealedActions.cv}
            onClick={(e: React.MouseEvent) => handleRevealAction(e, 'cv')}
          />
        </div>

        {/* Details Modals */}
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
      </div>
    </div>
  );
}

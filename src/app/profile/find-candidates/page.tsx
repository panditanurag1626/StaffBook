'use client';

import React, { useState, Suspense, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProfileLayout from '@/components/shared/ProfileLayout';
import ProfileSubMenu from '@/components/shared/ProfileSubMenu';
import Card from '@/components/shared/Card';
import CandidateCard from '@/components/shared/CandidateCard';
import CandidateCompactCard from '@/components/shared/CandidateCompactCard';
import ManageJobsContent from '@/components/profile/ManageJobsContent';
import CandidateFilter from '@/components/shared/CandidateFilter';
import JobPostAccordion, { AccordionJobPost } from '@/components/profile/JobPostAccordion';
import { useCandidateFilters } from '@/hooks/useCandidateFilters';
import { THEME } from '@/styles/theme';
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiNavigation,
  FiPhone,
  FiMail,
  FiUserPlus,
  FiFileText,
  FiDownload,
  FiX,
  FiBookmark,
  FiCalendar,
  FiChevronRight,
  FiChevronDown,
  FiCheck,
  FiUsers,
  FiExternalLink,
  FiTrash2,
  FiFolder,
  FiLoader,
  FiAlertCircle,
} from 'react-icons/fi';
import MapComponent from '@/components/shared/MapComponent';
import { Candidate } from '@/types/candidate';
import { jobService } from '@/lib/api/services/jobService';
import { connectionService } from '@/lib/api/services/connectionService';
import { useAuth } from '@/context/AuthContext';
import DownloadsPage from '../downloads/page';
import PlatformActionButton from '@/components/shared/PlatformActionButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface CandidateSection {
  candidates: Candidate[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  page: number;
}

interface DownloadRecord {
  id: string;
  jobTitle: string;
  jobId: string;
  folderName: string;
  downloadDate: string;
  candidateCount: number;
  candidates: string[];
  fileSize: string;
}

const mockDownloadHistory: DownloadRecord[] = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Developer',
    jobId: '1',
    folderName: 'Job_Senior_Frontend_Developer_2024-01-13',
    downloadDate: '2024-01-13T11:30:00',
    candidateCount: 3,
    candidates: ['Amit Sharma', 'Neha Gupta', 'Vikram Malhotra'],
    fileSize: '2.4 MB'
  },
];



const menuItems = [
  { icon: <FiBriefcase size={18} />, label: 'Job Posts', key: 'manage-jobs' },
  { icon: <FiMapPin size={18} />, label: 'Find Candidates', key: 'find-candidates' },
  { icon: <FiUserPlus size={18} />, label: 'Invited Candidates', key: 'invites' },
  { icon: <FiFileText size={18} />, label: 'Downloaded Resumes', key: 'resumes' },
];

// ─── Helper: map API candidate to Candidate type ──────────────────────────────

function mapApiCandidate(item: any): Candidate {
  const c = item.candidate || item;
  return {
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`,
    title: c.designation || c.preferred_role || 'Candidate',
    company: c.employerDetails?.company_name || '',
    location: c.location || `${c.city || ''}, ${c.country || ''}`.replace(/^, |, $/, ''),
    experience: c.total_experience || `${c.total_experience_years || 0} years`,
    skills: (c.skill && c.skill.length > 0
      ? c.skill
      : (c.experience && c.experience.length > 0 && c.experience[0].skills)
      ? c.experience[0].skills
      : []
    ).map((s: any) => {
      if (typeof s === 'string') return { title: s };
      return { title: s.title || s.skill_name || s.name || '' };
    }),
    education: '',
    distance_display: item?.distance?.display ?? item?.distance_display ?? item?.distance_from_job?.km ?? c?.distance_km ?? undefined,
    image: c.picture || '/images/user_profile_placeholder.jpeg',
    lastActive: c.last_active || '',
    isOnline: c.online === 1,
    email: c.email || '',
    phone: c.phone || '',
    matchScore: item.match_score,
    resumeUrl: c.resumeUpload?.url || null,
    userId: String(c.id),
    lat: c.latitude ? parseFloat(c.latitude) : undefined,
    lng: c.longitude ? parseFloat(c.longitude) : undefined,
    is_premium: Boolean(c.is_premium),
    is_invited: Boolean(item.invite?.is_invited || c.invite?.is_invited || item.invite_any?.is_invited || item.is_invited || c.is_invited),
    invite: item.invite || c.invite || item.invite_any || null,
  };
}

// ─── Pagination Component ─────────────────────────────────────────────────────

function Pagination({ pagination, onPageChange }: { pagination: PaginationInfo; onPageChange: (p: number) => void }) {
  const { page, total_pages } = pagination;
  if (total_pages <= 1) return null;

  const pages = Array.from({ length: Math.min(total_pages, 5) }, (_, i) => {
    if (total_pages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= total_pages - 2) return total_pages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-purple-50 hover:border-purple-200 text-gray-400 hover:text-purple-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
      >
        <FiChevronRight className="rotate-180" size={16} />
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-full font-bold text-sm transition-all ${page === p
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
            : 'bg-white border border-gray-100 text-gray-500 hover:border-purple-200 hover:text-purple-600'
            }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === total_pages}
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-purple-50 hover:border-purple-200 text-gray-400 hover:text-purple-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
      >
        <FiChevronRight size={16} />
      </button>

      <span className="text-xs text-gray-400 font-medium ml-2">
        {pagination.total} total
      </span>
    </div>
  );
}

// ─── Section Loading / Empty / Error states ───────────────────────────────────

function SectionState({ loading, error, empty, emptyMessage }: {
  loading: boolean; error: string | null; empty: boolean; emptyMessage: string;
}) {
  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3">
      <FiLoader className="text-purple-400 animate-spin" size={22} />
      <span className="text-gray-400 font-medium">Loading candidates...</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center py-12 gap-3 text-red-400">
      <FiAlertCircle size={20} />
      <span className="text-sm font-medium">{error}</span>
    </div>
  );
  if (empty) return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
        <FiSearch size={22} className="text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium">{emptyMessage}</p>
    </div>
  );
  return null;
}

// ── InviteStatusCard ──────────────────────────────────────────────────────────

interface InviteStatusCardProps {
  invite: any;
  selectedJobId: string | number | null;
  jobPosts: any[];
}

function InviteStatusCard({ invite, selectedJobId, jobPosts }: InviteStatusCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>(invite.connectionStatus || 'not_connected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showContactStatus, setShowContactStatus] = useState<'idle' | 'loading' | 'revealed' | 'error'>('idle');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEmailStatus, setShowEmailStatus] = useState<'idle' | 'loading' | 'revealed' | 'error'>('idle');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [downloadResumeStatus, setDownloadResumeStatus] = useState<'idle' | 'loading' | 'downloaded' | 'error'>('idle');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSendConnection = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || isConnecting || connectionStatus !== 'not_connected') return;
    setIsConnecting(true);
    try {
      const res = await connectionService.sendConnectionRequest(Number(user.id), Number(invite.candidateId));
      if (res.status === 200 || res.status === 201 || res.data) {
        toast.success("Connection request sent successfully!");
        setConnectionStatus('sent_connection');
      } else {
        throw new Error(res.message || "Failed to send connection request");
      }
    } catch (err: any) {
      console.error('Error sending connection request:', err);
      toast.error(err.message || 'Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRevealContact = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showContactStatus === 'revealed') {
      setShowContactModal(true);
      return;
    }
    if (showContactStatus === 'loading') return;

    setShowContactStatus('loading');
    try {
      const resp = await jobService.revealCandidateContact(
        Number(selectedJobId),
        Number(invite.candidateId)
      );
      if (resp.status === 200 || resp.status === 201 || resp.data?.already_unlocked || resp.data?.data?.already_unlocked) {
        setShowContactStatus('revealed');
        setShowContactModal(true);
        toast.success("Contact details unlocked!");
      } else {
        throw new Error(resp.message || "Failed to unlock contact");
      }
    } catch (err: any) {
      console.error('Reveal contact error:', err);
      toast.error(err.message || 'Failed to reveal contact');
      setShowContactStatus('error');
      setTimeout(() => setShowContactStatus('idle'), 3000);
    }
  };

  const handleRevealEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showEmailStatus === 'revealed') {
      setShowEmailModal(true);
      return;
    }
    if (showEmailStatus === 'loading') return;

    setShowEmailStatus('loading');
    try {
      const resp = await jobService.revealCandidateEmail(
        Number(selectedJobId),
        Number(invite.candidateId)
      );
      if (resp.status === 200 || resp.status === 201 || resp.data?.already_unlocked || resp.data?.data?.already_unlocked || resp.message?.includes("already unlocked")) {
        setShowEmailStatus('revealed');
        setShowEmailModal(true);
        toast.success("Email details unlocked!");
      } else {
        throw new Error(resp.message || "Failed to unlock email");
      }
    } catch (err: any) {
      console.error('Reveal email error:', err);
      setShowEmailStatus('error');
      setShowSubscriptionModal(true);
      setTimeout(() => setShowEmailStatus('idle'), 3000);
    }
  };

  const handleDownloadCVAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadResumeStatus === 'loading') return;

    const effectiveJobId = invite.jobPostId || selectedJobId || (jobPosts.length > 0 ? jobPosts[0].id : null);

    if (!effectiveJobId && invite.resumeUrl) {
      window.open(invite.resumeUrl, '_blank');
      toast.success("Resume download started!");
      return;
    }

    setDownloadResumeStatus('loading');
    try {
      const resp = await jobService.downloadCandidateResume(
        Number(effectiveJobId),
        Number(invite.candidateId)
      );
      if (resp.status === 200 || resp.status === 201 || resp.data?.already_unlocked || resp.data?.data?.already_unlocked || resp.message?.includes("already marked")) {
        setDownloadResumeStatus('downloaded');
        toast.success("Resume download processed successfully!");

        let resumeUrlToOpen = invite.resumeUrl || '';
        if (resp.data && (resp.data.resume_url || resp.data.data?.resume_url)) {
          resumeUrlToOpen = resp.data.resume_url || resp.data.data?.resume_url;
        }

        if (resumeUrlToOpen) {
          window.open(resumeUrlToOpen, '_blank');
        } else {
          toast.error('Resume URL not available');
        }
      } else {
        throw new Error(resp.message || "Failed to process resume download");
      }
    } catch (err: any) {
      console.error('Download CV error:', err);
      if (invite.resumeUrl) {
        setDownloadResumeStatus('downloaded');
        window.open(invite.resumeUrl, '_blank');
        toast.success("Resume download started!");
      } else {
        setDownloadResumeStatus('error');
        setShowSubscriptionModal(true);
        setTimeout(() => setDownloadResumeStatus('idle'), 3000);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
      <div className="flex items-start gap-4 mb-4">
        <Link href={`/user/${invite.candidateId}`} className="relative block hover:opacity-80 transition-opacity">
          <img src={invite.image} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
        </Link>
        <div className="flex-1">
          <Link href={`/user/${invite.candidateId}`} className="hover:text-purple-600 transition-colors">
            <h3 className="font-black text-gray-900 text-base leading-tight">{invite.name}</h3>
          </Link>
          <p className="text-purple-600 font-bold text-xs mt-0.5">{invite.position}</p>
          <p className="text-gray-400 text-[11px]">{invite.company}</p>
        </div>
        <span className="text-[10px] font-bold text-gray-400">{invite.appliedDate}</span>
      </div>

      <button
        onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
        className="w-full flex items-center justify-between bg-purple-50/50 rounded-xl px-4 py-3 border border-purple-100/50 hover:border-purple-200 transition-colors mb-4"
      >
        <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Candidate Screening Process</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isTimelineExpanded ? 'bg-purple-600 text-white rotate-180' : 'bg-purple-100 text-purple-600'}`}>
          <FiChevronDown size={14} />
        </div>
      </button>

      {isTimelineExpanded && (
        <div className="mt-4 mb-4 space-y-0 relative">
          {invite.timeline.map((step: any, idx: number) => (
            <div key={idx} className="flex gap-4 pb-6 last:pb-0 relative">
              {idx !== invite.timeline.length - 1 && (
                <div className={`absolute left-[10px] top-[22px] bottom-0 w-[2px] ${step.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
              <div className="relative z-10 flex-shrink-0">
                {step.status === 'completed' ? (
                  <div className="w-5 h-5 rounded-full bg-white border-2 border-green-500 flex items-center justify-center">
                    <FiCheck size={10} className="text-green-500" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  </div>
                )}
              </div>
              <div className="-mt-0.5">
                <p className={`font-bold text-sm ${step.status === 'completed' ? 'text-gray-900' : 'text-gray-400'}`}>{step.label === 'Invitation Sent' || step.label === 'Invitation sent' ? 'Job Invitation Sent' : step.label}</p>
                <p className="text-gray-400 text-xs">{(step as any).date || (step as any).subtext}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
        <PlatformActionButton
          icon={FiUserPlus}
          label="Connect"
          showLabelBelow
          isLocked={connectionStatus === 'sent_connection' || connectionStatus === 'received_connection' || connectionStatus === 'connected'}
          disabled={connectionStatus === 'sent_connection' || connectionStatus === 'received_connection'}
          isLoading={isConnecting}
          onClick={connectionStatus === 'sent_connection' || connectionStatus === 'received_connection' || connectionStatus === 'connected' ? undefined : handleSendConnection}
        />

        <PlatformActionButton
          icon={FiPhone}
          label={showContactStatus === 'loading' ? '...' : 'Contact'}
          showLabelBelow
          isLoading={showContactStatus === 'loading'}
          onClick={handleRevealContact}
        />

        <PlatformActionButton
          icon={FiMail}
          label={showEmailStatus === 'loading' ? '...' : 'Email'}
          showLabelBelow
          isLoading={showEmailStatus === 'loading'}
          onClick={handleRevealEmail}
        />

        <PlatformActionButton
          icon={FiCalendar}
          label="Meetings"
          showLabelBelow
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('openMeetingModal', {
              detail: {
                candidateName: invite.name,
                candidateId: invite.candidateId,
                jobPostId: selectedJobId
              }
            }));
          }}
        />

        <PlatformActionButton
          icon={FiDownload}
          label={downloadResumeStatus === 'loading' ? '...' : 'Download CV'}
          showLabelBelow
          isLoading={downloadResumeStatus === 'loading'}
          onClick={handleDownloadCVAction}
        />
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { e.stopPropagation(); setShowEmailModal(false); }}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Email Details</h3>
              <button onClick={() => setShowEmailModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900">
                <FiX size={16} />
              </button>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FiMail className="text-blue-600" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email Address</p>
                <p className="text-sm font-bold text-gray-900 truncate">{invite.email || "Not available"}</p>
              </div>
            </div>
            <button onClick={() => setShowEmailModal(false)} className="mt-8 w-full py-3 bg-gray-900 text-white font-bold rounded-xl">
              Done
            </button>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { e.stopPropagation(); setShowContactModal(false); }}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
              <button onClick={() => setShowContactModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900">
                <FiX size={16} />
              </button>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FiPhone className="text-green-600" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Contact Number</p>
                <p className="text-sm font-bold text-gray-900">{invite.phone || "Not available"}</p>
              </div>
            </div>
            <button onClick={() => setShowContactModal(false)} className="mt-8 w-full py-3 bg-gray-900 text-white font-bold rounded-xl">
              Done
            </button>
          </div>
        </div>
      )}

      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSubscriptionModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Subscription Required</h3>
              <button onClick={() => setShowSubscriptionModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900">
                <FiX size={16} />
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">Buy a subscription to download the CV.</p>
            <button
              onClick={() => { setShowSubscriptionModal(false); router.push('/premium-services'); }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity mb-2"
            >
              View Plans
            </button>
            <button onClick={() => setShowSubscriptionModal(false)} className="w-full py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function FindCandidatesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('find-candidates');
  const { filters, setters, helpers } = useCandidateFilters();
  const { radiusValue } = filters;

  // Sync tab from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  // ── Job posts state ──────────────────────────────────────────────────────────
  const [jobPosts, setJobPosts] = useState<AccordionJobPost[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | number | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('staffbook_selectedJobId');
    }
    return null;
  });

  useEffect(() => {
    const handleJobChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.jobId) {
        setSelectedJobId(customEvent.detail.jobId);
      }
    };
    window.addEventListener('staffbook_selectedJobChanged', handleJobChange);
    return () => window.removeEventListener('staffbook_selectedJobChanged', handleJobChange);
  }, []);

  const handleSelectJob = (jobId: string | number | null) => {
    setSelectedJobId(jobId);
    if (jobId) {
      localStorage.setItem('staffbook_selectedJobId', String(jobId));
    } else {
      localStorage.removeItem('staffbook_selectedJobId');
    }
  };
  const [isFiltered, setIsFiltered] = useState(false);

  // ── Candidate sections state ─────────────────────────────────────────────────
  const defaultSection: CandidateSection = { candidates: [], pagination: null, loading: false, error: null, page: 1 };
  const [readyToJoin, setReadyToJoin] = useState<CandidateSection>(defaultSection);
  const [nearby, setNearby] = useState<CandidateSection>(defaultSection);
  const [sameSkills, setSameSkills] = useState<CandidateSection>(defaultSection);

  // ── Other state ──────────────────────────────────────────────────────────────
  const [downloads, setDownloads] = useState<DownloadRecord[]>(mockDownloadHistory);
  const [sentInvites, setSentInvites] = useState<any[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesPage, setInvitesPage] = useState(1);
  const [invitesTotalPages, setInvitesTotalPages] = useState(1);
  const [invitesTotalCount, setInvitesTotalCount] = useState(0);
  const [invitesStatusFilter, setInvitesStatusFilter] = useState('');
  const [invitesFromDate, setInvitesFromDate] = useState('');
  const [invitesToDate, setInvitesToDate] = useState('');
  const [sentInvitesRefreshTrigger, setSentInvitesRefreshTrigger] = useState(0);
  const invitesPerPage = 10;

  // Listen for global invite event to refresh the sent invites list
  useEffect(() => {
    const handleInviteSent = () => {
      setSentInvitesRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('staffbook_candidateInvited', handleInviteSent);
    return () => window.removeEventListener('staffbook_candidateInvited', handleInviteSent);
  }, []);

  // Selected candidates for bulk CSV export
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isExcelDownloading, setIsExcelDownloading] = useState(false);

  // ── Fetch job posts ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        const res = await jobService.getMyJobPosts(100000000, 'apply');
        if (res?.data?.items && Array.isArray(res.data.items)) {
          const mapped: AccordionJobPost[] = res.data.items.map((j: any) => ({
            id: j.id,
            title: j.job_title || j.title || 'Untitled',
            company: j.company_name || '',
            location: j.location || j.city || '',
            status: (j.status?.toLowerCase() === 'active' ? 'active' : j.status?.toLowerCase() === 'closed' ? 'closed' : 'paused') as any,
            views: j.total_view || 0,
            applicants: j.total_applicants || 0,
          }));
          setJobPosts(mapped);
        }
      } catch (e) {
        console.error('Failed to fetch job posts:', e);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // ── Fetch sent invites ───────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'invites') {
      const fetchInvites = async () => {
        setInvitesLoading(true);
        try {
          // "viewed" isn't supported as an API filter, so fetch all and filter client-side
          const apiStatus = invitesStatusFilter === 'viewed' ? '' : invitesStatusFilter;
          const perPage = invitesStatusFilter === 'viewed' ? 100 : invitesPerPage;
          const res = await jobService.getMySentInvites(apiStatus, invitesPage, invitesFromDate || undefined, invitesToDate || undefined, perPage);
          const data = res?.data?.data?.data || [];
          setInvitesTotalPages(res?.data?.data?.pagination?.page_count || 1);
          setInvitesTotalCount(res?.data?.data?.pagination?.total_count || 0);
          let mapped = data.map((inv: any) => ({
            id: inv.id,
            name: inv.candidate?.first_name ? `${inv.candidate.first_name} ${inv.candidate.last_name || ''}` : 'Candidate',
            company: inv.job?.company_name || 'Company',
            position: inv.job?.job_title || 'Position',
            appliedDate: inv.formatted_created_at || 'Recently',
            email: inv.candidate?.email || '',
            phone: inv.candidate?.phone || '',
            candidateId: inv.candidate?.id || inv.candidate_id,
            image: inv.candidate?.picture || '/images/user_profile_placeholder.jpeg',
            isOnline: inv.candidate?.online === 1,
            connectionStatus: inv.candidate?.connection_status || 'not_connected',
            is_viewed: !!(inv.is_viewed || inv.invite?.is_viewed || inv.candidate?.invite?.is_viewed || inv.formatted_viewed_at),
            jobPostId: inv.job?.id || null,
            resumeUrl: inv.candidate?.resumeUpload?.url || null,
            timeline: [
              { label: 'Job Invitation Sent', date: inv.formatted_created_at, status: 'completed' },
              { label: 'Viewed', date: inv.formatted_viewed_at || 'Pending', status: inv.is_viewed || inv.invite?.is_viewed || inv.candidate?.invite?.is_viewed || inv.formatted_viewed_at ? 'completed' : 'pending' },
              { label: 'Responded', date: inv.formatted_responded_at || 'Pending', status: inv.status !== 'pending' ? 'completed' : 'pending' },
            ]
          }));
          // Client-side filter for "viewed"
          if (invitesStatusFilter === 'viewed') {
            mapped = mapped.filter((inv: any) => inv.is_viewed);
          }
          setSentInvites(mapped);
        } catch (err) {
          console.error('Failed to fetch invites', err);
        } finally {
          setInvitesLoading(false);
        }
      };
      fetchInvites();
    }
  }, [activeTab, invitesPage, invitesStatusFilter, invitesFromDate, invitesToDate, sentInvitesRefreshTrigger]);

  // ── Fetch all 3 sections when job changes ────────────────────────────────────
  const fetchSection = useCallback(async (
    jobId: string | number | null,
    section: 'readyToJoin' | 'nearby' | 'sameSkills',
    page: number,
    radius?: number,
    useFilters: boolean = true
  ) => {
    const setter = section === 'readyToJoin' ? setReadyToJoin : section === 'nearby' ? setNearby : setSameSkills;

    setter(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Prepare filters for API
      let apiFilters: any = {};

      if (useFilters) {
        apiFilters = {
          skills: filters.selectedSkills,
          min_experience: filters.selectedExperience.includes("Fresher") ? 0 :
            filters.selectedExperience.length > 0 ? Math.min(...filters.selectedExperience.map(e => parseInt(e) || 0)) : undefined,
          max_experience: filters.selectedExperience.length > 0 ? Math.max(...filters.selectedExperience.map(e => parseInt(e) || 0)) : undefined,
          min_salary: (filters.salaryRange[0] === 0 && filters.salaryRange[1] === 50) ? undefined : filters.salaryRange[0],
          max_salary: (filters.salaryRange[0] === 0 && filters.salaryRange[1] === 50) ? undefined : filters.salaryRange[1],
          city: filters.city,
          state: filters.state,
          employment_type: filters.employmentType,
          work_status: filters.workStatus,
          notice_period: filters.noticePeriod,
          preferred_shift: filters.preferredShift,
          gender: filters.gender,
          min_age: (filters.ageRange[0] === 18 && filters.ageRange[1] === 60) ? undefined : filters.ageRange[0],
          max_age: (filters.ageRange[0] === 18 && filters.ageRange[1] === 60) ? undefined : filters.ageRange[1],
          has_resume: filters.hasResume === null ? undefined : (filters.hasResume ? 1 : 0),
          keywords: filters.searchQuery
        };
      }


      let res: any;
      if (section === 'readyToJoin') {
        res = await jobService.findCandidates(jobId, page, 10, apiFilters);
      } else if (section === 'nearby') {
        res = await jobService.findNearbyCandidates(jobId, radius ?? 25, page, 10, apiFilters);
      } else {
        res = await jobService.matchJobSkillsWithCandidates(jobId, page, 10, apiFilters);
      }

      const data = res?.data?.data?.data || res?.data?.data || [];
      const pagination = res?.data?.data?.pagination || null;
      const candidates = Array.isArray(data) ? data.map(mapApiCandidate) : [];

      setter({ candidates, pagination, loading: false, error: null, page });
    } catch (e: any) {
      let errorMessage = 'Failed to load candidates';

      if (e?.response?.data?.data?.errors?.message?.[0]) {
        errorMessage = e.response.data.data.errors.message[0];
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }
      setter(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, [filters]);

  const fetchAllSections = useCallback((useFilters = false) => {
    setIsFiltered(useFilters);
    fetchSection(selectedJobId, 'readyToJoin', 1, undefined, useFilters);
    fetchSection(selectedJobId, 'nearby', 1, filters.radiusValue, useFilters);
    fetchSection(selectedJobId, 'sameSkills', 1, undefined, useFilters);
  }, [selectedJobId, fetchSection, filters.radiusValue]);

  useEffect(() => {
    fetchAllSections();
  }, [selectedJobId]);

  // Debounced search trigger
  const lastSearchRef = useRef(filters.searchQuery);
  useEffect(() => {
    if (filters.searchQuery === lastSearchRef.current) return;

    lastSearchRef.current = filters.searchQuery;

    // If it's the initial empty state, don't trigger (handled by first useEffect)
    if (filters.searchQuery === '' && !isFiltered) return;

    fetchAllSections(true);
  }, [filters.searchQuery, selectedJobId, fetchAllSections, isFiltered]);

  const handleApplyFilters = () => {
    fetchAllSections(true);
  };

  const handleDownloadResume = (candidateName: string) => {
    const el = document.createElement('a');
    const file = new Blob([`Resume for ${candidateName}`], { type: 'text/plain' });
    el.href = URL.createObjectURL(file);
    el.download = `${candidateName.replace(' ', '_')}_Resume.txt`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDeleteDownload = (id: string) => {
    if (confirm('Delete this download record?')) setDownloads(prev => prev.filter(d => d.id !== id));
  };

  const handleSelectCandidate = (candidateId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
  };

  const handleBulkExcelDownload = async () => {
    if (isExcelDownloading || selectedCandidates.length === 0) return;
    setIsExcelDownloading(true);
    try {
      const userIds = selectedCandidates.map(id => Number(id));
      const response = (await jobService.downloadBulkUsersExcel(userIds)) as any;
      
      const downloadUrl = response?.data?.data?.download_url || 
                          response?.data?.download_url || 
                          response?.download_url || 
                          response?.data?.excel_file_url || 
                          response?.excel_file_url;

      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        toast.success(response?.message || 'Candidates Excel generated successfully');
        setSelectedCandidates([]);
      } else {
        toast.error(response?.message || 'Failed to generate Excel download link');
      }
    } catch (error: any) {
      console.error('Excel download error:', error);
      let errMsg = 'Failed to download Excel file';
      if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setIsExcelDownloading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      {/* Bulk Action Bar - Floating */}
      {selectedCandidates.length > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top duration-300">
          <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/50 px-5 py-3 flex items-center gap-4">
            {/* Selection Count */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">{selectedCandidates.length}</span>
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkExcelDownload}
                disabled={isExcelDownloading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiFileText size={14} />
                {isExcelDownloading ? 'Processing...' : 'Download Excel'}
              </button>

              <button
                onClick={() => setSelectedCandidates([])}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ml-1"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`min-h-screen ${THEME.colors.background.page} pt-4 md:pt-6 lg:pt-8 -mt-[30px]`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6">

          {/* Sub Menu */}
          <Suspense fallback={<div>Loading menu...</div>}>
            <ProfileSubMenu
              menuItems={menuItems}
              activeTab={activeTab}
              onTabChange={(key) => setActiveTab(key)}
            />
          </Suspense>

          {/* Filter + Job Accordion */}
          {activeTab === 'find-candidates' && (
            <div className="mt-10 mb-8 space-y-6">
              <CandidateFilter filters={filters} setters={setters} helpers={helpers} onApply={handleApplyFilters} />
              <div className="mt-10">
                <JobPostAccordion
                  jobs={jobPosts}
                  selectedJobId={selectedJobId}
                  onSelectJob={handleSelectJob}
                  isLoading={jobsLoading}
                />
              </div>
            </div>
          )}

          {/* ── Find Candidates Tab ── */}
          {activeTab === 'find-candidates' && (
            <div className="space-y-8 mt-8">

              {/* Removed "No job selected warning" as candidates are now shown without job */}

              {/* ── Section 1: Ready To Join (find-candidates API) ── */}
              <div className="space-y-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className={`${THEME.components.typography.sectionTitle} text-xl mb-1`}>Ready To Join Candidates</h2>
                    {readyToJoin.pagination && (
                      <p className="text-sm text-gray-400">{readyToJoin.pagination.total} candidates found</p>
                    )}
                  </div>
                  <Link
                    href="/profile/find-candidates/category/ready-to-join"
                    className="flex items-center gap-1 text-purple-600 font-bold text-sm hover:text-purple-700 transition-colors group"
                  >
                    See All
                    <FiChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <SectionState
                  loading={readyToJoin.loading}
                  error={readyToJoin.error}
                  empty={!readyToJoin.loading && !readyToJoin.error && readyToJoin.candidates.length === 0}
                  emptyMessage="No ready-to-join candidates found for this job post."
                />

                {!readyToJoin.loading && !readyToJoin.error && readyToJoin.candidates.length > 0 && (
                  <>
                    <div className="flex md:flex-col gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible md:snap-none pb-2 md:pb-0">
                      {readyToJoin.candidates.slice(0, 3).map(candidate => (
                        <div key={candidate.id} className="min-w-[80vw] sm:min-w-[280px] md:min-w-0 snap-start">
                          <CandidateCard
                            candidate={candidate}
                            onDownloadResume={handleDownloadResume}
                            actionAction="invite"
                            jobPostId={selectedJobId ?? undefined}
                            isSelected={selectedCandidates.includes(candidate.id)}
                            onSelectionChange={handleSelectCandidate}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* ── Section 2: Nearby Candidates (find-nearby-candidates API) ── */}
              <div className="space-y-4 pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-1">
                    <div>
                      <h2 className={`${THEME.components.typography.sectionTitle} text-xl mb-1`}>Explore Candidates in Your Area</h2>
                      {nearby.pagination && (
                        <p className="text-sm text-gray-400">{nearby.pagination.total} candidates within {radiusValue}km</p>
                      )}
                    </div>
                    <Link
                      href="/profile/find-candidates/nearby-map"
                      className="flex items-center gap-1 text-purple-600 font-bold text-sm hover:text-purple-700 transition-colors group whitespace-nowrap"
                    >
                      See All
                      <FiChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                <Card className="mt-4">
                  {/* Radius slider */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Search Radius</span>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={radiusValue}
                            onChange={(e) => { setters.setRadiusValue(Number(e.target.value)); fetchSection(selectedJobId, 'nearby', 1, Number(e.target.value), isFiltered); }}
                            className="w-32 md:w-48 h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-purple-600"
                          />
                          <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100 min-w-[60px] text-center">
                            {radiusValue} km
                          </span>
                        </div>
                      </div>
                    </div>
                    {nearby.pagination && (
                      <h2 className="text-gray-500 text-sm font-normal">
                        <span className="font-semibold text-gray-900">{nearby.pagination.total} candidates</span> within {radiusValue}km
                      </h2>
                    )}
                  </div>

                  <div className="md:grid md:grid-cols-2 md:gap-8 relative">
                    {/* Map */}
                    <div className="sticky top-0 z-10 md:static md:z-auto h-[200px] md:h-[380px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                      <MapComponent
                        radius={radiusValue}
                        className="h-full w-full"
                        type="users"
                        context="find-candidates"
                        jobPostId={selectedJobId || undefined}
                        users={nearby.candidates.map(c => ({
                          id: String(c.userId || c.id), // Ensure ID is a string and provided
                          name: c.name,
                          role: c.title,
                          avatar: c.image,
                          lat: c.lat,
                          lng: c.lng,
                          is_premium: c.is_premium
                        }))}
                        onRadiusChange={(newRadius) => {
                          setters.setRadiusValue(newRadius)
                          fetchSection(selectedJobId, 'nearby', 1, Number(newRadius), isFiltered);
                        }}
                      />
                    </div>

                    {/* List */}
                    <div className="space-y-4 md:overflow-y-auto md:h-[480px] md:pr-2 md:scrollbar-thin md:scrollbar-thumb-gray-200 md:scrollbar-track-transparent">
                      <SectionState
                        loading={nearby.loading}
                        error={nearby.error}
                        empty={!nearby.loading && !nearby.error && nearby.candidates.length === 0}
                        emptyMessage="No candidates found nearby. Try increasing the radius."
                      />
                      {!nearby.loading && !nearby.error && nearby.candidates.map(candidate => (
                        <CandidateCompactCard
                          key={candidate.id}
                          candidate={candidate}
                          jobPostId={selectedJobId || undefined}
                          onDownloadResume={handleDownloadResume}
                        />
                      ))}
                    </div>
                  </div>

                  {nearby.pagination && (
                    <Pagination
                      pagination={nearby.pagination}
                      onPageChange={(p) => fetchSection(selectedJobId, 'nearby', p, radiusValue, isFiltered)}
                    />
                  )}
                </Card>
              </div>

              {/* ── Section 3: Same Skills (match-job-skills API) ── */}
              <div className="space-y-6 pt-8 border-t border-gray-200">
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                  <div>
                    <h2 className={`${THEME.components.typography.sectionTitle} text-xl mb-1`}>Candidates Having Same Skills</h2>
                    {sameSkills.pagination && (
                      <p className="text-sm text-gray-400">{sameSkills.pagination.total} skill-matched candidates</p>
                    )}
                  </div>
                  <Link
                    href="/profile/find-candidates/category/same-skills"
                    className="flex items-center gap-1 text-purple-600 font-bold text-sm hover:text-purple-700 transition-colors group whitespace-nowrap"
                  >
                    See All
                    <FiChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <SectionState
                  loading={sameSkills.loading}
                  error={sameSkills.error}
                  empty={!sameSkills.loading && !sameSkills.error && sameSkills.candidates.length === 0}
                  emptyMessage="No skill-matched candidates found for this job post."
                />

                {!sameSkills.loading && !sameSkills.error && sameSkills.candidates.length > 0 && (
                  <>
                    <div className="flex md:flex-col gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible md:snap-none pb-2 md:pb-0">
                      {sameSkills.candidates.slice(0, 3).map(candidate => (
                        <div key={candidate.id} className="min-w-[80vw] sm:min-w-[280px] md:min-w-0 snap-start">
                          <CandidateCard
                            candidate={candidate}
                            onDownloadResume={handleDownloadResume}
                            actionAction="invite"
                            jobPostId={selectedJobId ?? undefined}
                            isSelected={selectedCandidates.includes(candidate.id)}
                            onSelectionChange={handleSelectCandidate}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Invites Tab ── */}
          {activeTab === 'invites' && (
            <div className="mt-8 space-y-8">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={invitesStatusFilter}
                    onChange={(e) => { setInvitesStatusFilter(e.target.value); setInvitesPage(1); }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-700 font-medium"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="viewed">Viewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">From Date</label>
                  <input
                    type="date"
                    value={invitesFromDate}
                    onChange={(e) => { setInvitesFromDate(e.target.value); setInvitesPage(1); }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-700"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">To Date</label>
                  <input
                    type="date"
                    value={invitesToDate}
                    onChange={(e) => { setInvitesToDate(e.target.value); setInvitesPage(1); }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-700"
                  />
                </div>
                <button
                  onClick={() => { setInvitesStatusFilter(''); setInvitesFromDate(''); setInvitesToDate(''); setInvitesPage(1); }}
                  className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors font-semibold h-[46px] mt-auto whitespace-nowrap"
                >
                  Clear Filters
                </button>
              </div>

              {invitesLoading ? (
                <div className="flex justify-center py-10"><FiLoader className="animate-spin text-purple-600" size={32} /></div>
              ) : sentInvites.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {sentInvites.map(invite => (
                      <InviteStatusCard key={invite.id} invite={invite} selectedJobId={selectedJobId} jobPosts={jobPosts} />
                    ))}
                  </div>
                  {invitesTotalPages > 1 && (
                    <Pagination
                      pagination={{ total: invitesTotalCount, page: invitesPage, per_page: invitesPerPage, total_pages: invitesTotalPages }}
                      onPageChange={setInvitesPage}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                  <FiAlertCircle size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-600">No sent invitations match your criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Resumes Tab ── */}
          {activeTab === 'resumes' && (
            <DownloadsPage searchParams={{}} />
          )}

          {/* ── Manage Jobs Tab ── */}
          {activeTab === 'manage-jobs' && (
            <div className="mt-8">
              <ManageJobsContent />
            </div>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
}

export default function FindCandidatesPage() {
  return (
    <Suspense fallback={
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className="flex items-center justify-center min-h-screen">
          <FiLoader className="animate-spin text-purple-600" size={36} />
        </div>
      </ProfileLayout>
    }>
      <FindCandidatesContent />
    </Suspense>
  );
}

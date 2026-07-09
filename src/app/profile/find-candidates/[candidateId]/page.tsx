"use client";

import React, { useState, useEffect } from "react";
import { jobService } from "@/lib/api/services/jobService";
import { connectionService } from "@/lib/api/services/connectionService";
import apiClient from "@/lib/api/config";
import PostCard from "@/components/Networking/feed/PostCard";
import { useAuth } from "@/context/AuthContext";
import { sendNotificationToUser, notifyProfileActivity } from "@/lib/firebaseNotifications";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from 'react-hot-toast';
import Link from "next/link";
import { getRelativeTime } from "@/lib/utils";
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiBookmark,
  FiCalendar,
  FiUser,
  FiChevronRight,
  FiArrowLeft,
  FiNavigation,
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiDownload,
  FiGlobe,
  FiAward,
  FiUserPlus,
  FiMessageCircle,
  FiX,
  FiLinkedin,
  FiGithub,
  FiCheck,
  FiLoader
} from "react-icons/fi";
import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import { THEME } from "@/styles/theme";
import MeetingModal from "@/components/shared/MeetingModal";
import PlatformActionButton from "@/components/shared/PlatformActionButton";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = params.candidateId as string;
  const jobPostId = searchParams.get('jobId');

  const { user: currentUser, isEmployer } = useAuth();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'posts' | 'connections'>('overview');
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const [showContactStatus, setShowContactStatus] = useState<'idle' | 'loading' | 'revealed' | 'error'>('idle');
  const [showContactModal, setShowContactModal] = useState(false);

  const [showEmailStatus, setShowEmailStatus] = useState<'idle' | 'loading' | 'revealed' | 'error'>('idle');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [downloadResumeStatus, setDownloadResumeStatus] = useState<'idle' | 'loading' | 'downloaded' | 'error'>('idle');

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [candidatePosts, setCandidatePosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [candidateConnections, setCandidateConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const fetchPosts = async () => {
    if (!candidateId) return;
    try {
      setPostsLoading(true);
      const res = await apiClient.get('posts/search-post', {
        params: {
          user_id: candidateId,
          expand: 'user,user.userLiveDetail,clubDetail.createdByUser,clubDetail.totalJoinedUser',
          is_recent: 1
        }
      });
      const postsData = res.data?.data?.post || res.data?.post || res.data;
      const items = postsData?.items || [];

      const sanitizeUrl = (url: string) => {
        if (!url) return "";
        if (url.includes("http") && url.lastIndexOf("http") > 0) {
          return url.substring(url.lastIndexOf("http"));
        }
        return url;
      };

      const mappedPosts = items.map((item: any) => ({
        id: String(item.id),
        author: {
          id: String(item.user?.id || item.user_id || candidateId),
          name: `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim() || name || "Unknown User",
          avatar: sanitizeUrl(item.user?.picture || image || "/images/user_profile_placeholder.jpeg"),
          title: item.user?.designation ?? item.user?.employerDetails?.designation ?? title ?? "",
          is_premium: item.user?.is_premium || false,
          user_mode_type: item.user?.user_mode_type,
        },
        content: item.title || "",
        media: item.postGallary && item.postGallary.length > 0 ? {
          type: item.postGallary[0].media_type === 2 ? "video" : "image",
          url: sanitizeUrl(item.postGallary[0].filenameUrl),
          alt: item.title || "Post media",
        } : undefined,
        timestamp: item.created_at || "Recently",
        likes: item.total_like || 0,
        comments: item.total_comment || 0,
        shares: item.total_share || 0,
        isLiked: item.is_like,
        view_count: item.view_count || 0,
        connection_status: applicant?.connection_status || "not_connected",
        reposted_by: item.reposted_by || null,
        original_post: item.original_post || null,
      }));

      setCandidatePosts(mappedPosts);
    } catch (err) {
      console.error("Error fetching candidate posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchConnections = async () => {
    if (!candidateId) return;
    try {
      setConnectionsLoading(true);
      const res = await connectionService.getOtherConnections(1, Number(candidateId));
      const items =
        res?.data?.otherconnections?.items ||
        (res as any)?.otherconnections?.items ||
        res?.data?.myconnections?.items ||
        (res as any)?.myconnections?.items ||
        res?.data?.items ||
        (res as any)?.items ||
        [];
      setCandidateConnections(items);
    } catch (err) {
      console.error("Error fetching candidate connections:", err);
    } finally {
      setConnectionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'posts' && candidatePosts.length === 0) {
      fetchPosts();
    } else if (activeView === 'connections' && candidateConnections.length === 0) {
      fetchConnections();
    }
  }, [activeView, candidateId]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await jobService.getJobApplicantDetails(candidateId);
        if (res && res.data && res.data.user) {
          setCandidate(res.data.user);
        } else if (res && res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setCandidate({ ...res.data.data[0], _job_details: (res as any).job_details });
        } else if (res && res.data) {
          setCandidate(res.data);
        } else {
          setCandidate(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (candidateId) fetchDetails();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mt-2">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  const applicant = candidate?.applicant || candidate;

  const firstName = applicant?.first_name || '';
  const lastName = applicant?.last_name || '';
  const fallbackName = applicant?.name || applicant?.full_name || 'NA';
  const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : fallbackName;

  const title = applicant?.designation || applicant?.title || applicant?.job_title || 'NA';
  const location = applicant?.location || applicant?.city || 'NA';
  const experience = applicant?.total_experience || applicant?.experience || 'NA';
  const education = applicant?.education || applicant?.highest_education || 'NA';
  const image = applicant?.picture || applicant?.image || applicant?.profile_url || '/images/user_profile_placeholder.jpeg';

  const lastActiveRaw = applicant?.last_active
    ? applicant.last_active * 1000
    : (applicant?.lastActive || applicant?.last_seen);
  const lastActive = lastActiveRaw ? getRelativeTime(lastActiveRaw) : 'NA';
  const isOnline = applicant?.online === 1 || applicant?.isOnline || false;

  const formatCurrency = (amount: number, currency: string) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amount);
  };
  const currentSalaryObj = applicant?.current_salary ? formatCurrency(applicant.current_salary, applicant.current_salary_currency) : null;
  const currentSalary = currentSalaryObj || applicant?.currentSalary || 'NA';

  const expectedSalaryObj = applicant?.expected_salary ? formatCurrency(applicant.expected_salary, applicant.expected_salary_currency) : null;
  const expectedSalary = expectedSalaryObj || applicant?.salary || applicant?.expectedSalary || 'NA';

  const distance = applicant?.distance_display && applicant.distance_display === "Location not available" ? undefined : applicant?.distance_display
  const about = applicant?.bio || applicant?.description || applicant?.about || 'NA';
  const hasReel = applicant?.hasReel || applicant?.has_reel || false;

  const rawSkills = applicant?.skills || applicant?.key_skills || applicant?.skill;
  let skillsList: string[] = [];
  if (Array.isArray(rawSkills)) {
    if (rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0].title) {
      skillsList = rawSkills.map((s: any) => s.title);
    } else {
      skillsList = rawSkills;
    }
  } else if (typeof rawSkills === 'string') {
    skillsList = rawSkills.split(',').map((s: string) => s.trim());
  }

  const historyList = Array.isArray(applicant?.projectList) ? applicant.projectList : (Array.isArray(applicant?.history) ? applicant.history : []);
  const certList = Array.isArray(applicant?.certificationList) ? applicant.certificationList : [];
  const repScreeningAnswers = Array.isArray(candidate?.screening_answers) ? candidate.screening_answers : [];
  const resumeUrl = candidate?.resume_url || applicant?.resume?.file_path || applicant?.resumeUrl;

  const bannerImage = applicant?.backpicture || applicant?.back_picture || applicant?.cover_url || '';
  const linkedinUrl = applicant?.linkedin_profile || applicant?.linkedin_url || '';
  const githubUrl = applicant?.github_url || '';
  const portfolioUrl = applicant?.portfolio_url || '';
  const noticePeriodMonths = applicant?.notice_period_months || '';
  const dob = applicant?.dob || '';

  const calculateAge = (dobStr: string) => {
    if (!dobStr) return null;
    try {
      const birthDate = new Date(dobStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  };
  const ageValue = calculateAge(dob);

  const expData = applicant?.experience || [];
  const eduData = applicant?.educations || applicant?.education || [];

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#222] mb-4">Candidate Not Found</h1>
          <Link
            href="/profile/find-candidates"
            className="text-primary hover:underline"
          >
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  const handleConnect = async () => {
    if (!currentUser?.id || !applicant?.id) return;
    try {
      setIsConnecting(true);
      const res = await connectionService.sendConnectionRequest(Number(currentUser.id), Number(applicant.id));
      if (res && ((res as any).success || res.status === 200)) {
        await sendNotificationToUser(
          Number(applicant.id),
          Number(currentUser.id),
          `${currentUser.first_name} ${currentUser.last_name}`,
          currentUser.picture || '',
          'connection_request',
          `${currentUser.first_name} ${currentUser.last_name} sent you a connection request.`,
          '',
          {
            senderId: currentUser.id,
            senderName: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
            senderAvatar: currentUser.picture || '',
            senderTitle: currentUser.designation || currentUser.profileHeadline || '',
            receiverId: applicant.id,
            receiverName: name,
            receiverTitle: title
          }
        );
        setHasRequested(true);
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleShowContact = async () => {
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
      const resp = await jobService.revealCandidateContact(jobPostId, candidateId);
      const responseData = resp;
      if (responseData.status === 200 || responseData.status === 201 || responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked) {
        setShowContactStatus('revealed');
        setShowContactModal(true);
        toast.success(responseData.message || "Contact details unlocked!");

        if (currentUser?.id && candidateId && String(currentUser.id) !== String(candidateId) && !(responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked)) {
          notifyProfileActivity(candidateId, Number(currentUser.id), currentUser.employerDetails?.company_name || `${currentUser.first_name} ${currentUser.last_name}`, currentUser.picture || '', 'contact_view');
        }
      } else {
        throw new Error(responseData.message || "Failed to unlock contact");
      }
    } catch (err: any) {
      console.error('Show contact error:', err);
      let errMsg = err.response?.data?.message || err.message || 'Failed to reveal contact';
      toast.error(errMsg);
      setShowContactStatus('error');
      setTimeout(() => setShowContactStatus('idle'), 3000);
    }
  };

  const handleShowEmail = async () => {
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
      const resp = await jobService.revealCandidateEmail(jobPostId, candidateId);
      const responseData = resp;
      if (responseData.status === 200 || responseData.status === 201 || responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked || responseData.message?.includes("already unlocked")) {
        setShowEmailStatus('revealed');
        setShowEmailModal(true);
        toast.success(responseData.message || "Email details unlocked!");
      } else {
        throw new Error(responseData.message || "Failed to unlock email");
      }
    } catch (err: any) {
      console.error('Show email error:', err);
      let errMsg = err.response?.data?.message || err.message || 'Failed to reveal email';
      toast.error(errMsg);
      setShowEmailStatus('error');
      setTimeout(() => setShowEmailStatus('idle'), 3000);
    }
  };

  const handleDownloadResumeAction = async () => {
    if (!jobPostId) {
      if (resumeUrl) {
        window.open(resumeUrl, '_blank');
      } else {
        toast.error('Cannot download resume context missing, and no URL found.');
      }
      return;
    }
    if (downloadResumeStatus === 'loading') return;

    setDownloadResumeStatus('loading');
    try {
      const resp = await jobService.downloadCandidateResume(jobPostId, candidateId);
      const responseData = resp;
      if (responseData.status === 200 || responseData.status === 201 || responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked || responseData.message?.includes("already marked")) {
        setDownloadResumeStatus('downloaded');
        toast.success(responseData.message || "Resume download processed successfully!");

        let urlToOpen = resumeUrl;
        if (responseData.data && (responseData.data.resume_url || responseData.data.data?.resume_url)) {
          urlToOpen = responseData.data.resume_url || responseData.data.data?.resume_url;
        }

        if (urlToOpen) {
          window.open(urlToOpen, '_blank');
        } else {
          toast.error('Resume URL not available');
        }

        if (currentUser?.id && candidateId && String(currentUser.id) !== String(candidateId) && !(responseData.data?.already_unlocked || responseData.data?.data?.already_unlocked) && !responseData.message?.includes("already marked")) {
          notifyProfileActivity(candidateId, Number(currentUser.id), currentUser.employerDetails?.company_name || `${currentUser.first_name} ${currentUser.last_name}`, currentUser.picture || '', 'resume_download');
        }
      } else {
        throw new Error(responseData.message || "Failed to process resume download");
      }
    } catch (err: any) {
      console.error('Download resume error:', err);
      let errMsg = err.response?.data?.message || err.message || 'Failed to process resume download';
      toast.error(errMsg);
      setDownloadResumeStatus('error');
      setTimeout(() => setDownloadResumeStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-4 lg:p-8 mt-[60px] bg-[#f3f2ed]">
      <div className="w-full px-3 sm:px-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#666] hover:text-primary transition-colors"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Back to Candidates
          </button>
          <FiChevronRight className="mx-2 text-gray-400" size={14} />
          <span className="text-[#222] font-medium">{name}</span>
        </nav>

        {/* Main Layout - 3 Column */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Candidate Profile (Sticky) */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* Profile Card */}
              <Card className="overflow-hidden p-0">
                <div className="h-24 w-full bg-gray-200 relative overflow-hidden">
                  {bannerImage ? (
                    <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} opacity-20`} />
                  )}
                </div>
                <div className="px-6 pb-6 -mt-14 relative z-10">
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="relative mb-4 w-28 h-28 mx-auto">
                      {/* Main Image & Reel Ring */}
                      <div className={`w-full h-full rounded-full p-[3px] ${hasReel
                        ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                        : `bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end}`
                        }`}>
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white relative z-10">
                          <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Job Seeking Badge */}
                      {applicant?.user_mode_type && applicant.user_mode_type !== 'None' && (
                        <div className="absolute inset-[-4px] z-20 pointer-events-none rotate-45">
                          <img
                            src={applicant.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                            alt={applicant.user_mode_type}
                            className="w-full h-full object-contain drop-shadow-md -rotate-[15deg]"
                          />
                        </div>
                      )}

                      {/* Online Dot */}
                      {isOnline && (
                        <div className="absolute bottom-3 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-20"></div>
                      )}

                      {/* Bottom "100%" Badge */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30">
                        <div className="bg-white text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-100 shadow-sm flex items-center gap-0.5">
                          <span className="text-[11px]">100%</span>
                        </div>
                      </div>
                    </div>
                    <h3 className={`text-lg font-bold ${THEME.colors.text.heading} text-center`}>
                      {name}
                    </h3>
                    <p className={`text-sm ${THEME.colors.text.body} text-center truncate w-full`}>
                      {title}
                    </p>
                    <p className={`text-xs ${THEME.colors.text.body} text-center mt-1 text-gray-500`}>
                      {location}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <div className="text-[10px] font-bold text-green-600 px-2 py-0.5 bg-green-50 rounded border border-green-100">
                      ✓ Phone
                    </div>
                    <div className="text-[10px] font-bold text-green-600 px-2 py-0.5 bg-green-50 rounded border border-green-100">
                      ✓ Email
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setActiveView(activeView === 'posts' ? 'overview' : 'posts')}
                  className={`bg-white rounded-2xl p-4 border shadow-sm flex flex-col items-center justify-center hover:border-purple-200 hover:scale-[1.03] transition-all cursor-pointer group ${activeView === 'posts' ? 'border-purple-400 bg-purple-50/50' : 'border-gray-100'}`}
                >
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{candidate?.totalActivePost || 0}</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Posts</div>
                </div>
                <div
                  onClick={() => setActiveView(activeView === 'connections' ? 'overview' : 'connections')}
                  className={`bg-white rounded-2xl p-4 border shadow-sm flex flex-col items-center justify-center hover:border-purple-200 hover:scale-[1.03] transition-all cursor-pointer group ${activeView === 'connections' ? 'border-purple-400 bg-purple-50/50' : 'border-gray-100'}`}
                >
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{candidate?.totalConnection || 0}</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Connection</div>
                </div>
              </div>

              <Card className="p-6">
                <div className="grid grid-cols-3 gap-x-2 gap-y-6 justify-items-center">
                  {/* Send Invite / Connection Status */}
                  {(() => {
                    const connStatus = hasRequested ? 'sent_connection' : (applicant?.connection_status || 'not_connected');
                    const isStandardStatus = ['connected', 'sent_connection', 'received_connection'].includes(connStatus);

                    return (
                      <PlatformActionButton
                        icon={FiUserPlus}
                        label="Connect"
                        showLabelBelow
                        isLoading={isConnecting}
                        disabled={connStatus === 'sent_connection' || connStatus === 'received_connection' || connStatus === 'connected'}
                        isLocked={connStatus === 'sent_connection' || connStatus === 'received_connection' || connStatus === 'connected'}
                        onClick={handleConnect}
                      />
                    );
                  })()}

                  {/* Show Contact */}
                  <PlatformActionButton
                    icon={FiPhone}
                    label={showContactStatus === 'loading' ? '...' : 'Contact'}
                    showLabelBelow
                    isLoading={showContactStatus === 'loading'}
                    onClick={handleShowContact}
                  />

                  {/* Email */}
                  <PlatformActionButton
                    icon={FiMail}
                    label={showEmailStatus === 'loading' ? '...' : 'Email'}
                    showLabelBelow
                    isLoading={showEmailStatus === 'loading'}
                    onClick={handleShowEmail}
                  />

                  {/* Meet */}
                  <PlatformActionButton
                    icon={FiCalendar}
                    label="Meet"
                    showLabelBelow
                    onClick={() => setIsMeetingModalOpen(true)}
                  />

                  {/* Download CV */}
                  {(resumeUrl || jobPostId) && (
                    <PlatformActionButton
                      icon={FiDownload}
                      label={downloadResumeStatus === 'loading' ? '...' : 'Resume'}
                      showLabelBelow
                      isLoading={downloadResumeStatus === 'loading'}
                      onClick={handleDownloadResumeAction}
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Center Column - Dynamic Content */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="p-8 min-h-[600px]">
              {activeView === 'overview' && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h1 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>
                      Profile Overview
                    </h1>
                    {/* <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold border border-purple-200">
                      <FiUser size={14} />
                      <span>Immediate Joiner</span>
                    </div> */}
                  </div>

                  {/* About */}
                  <section className="mb-8">
                    <h2 className={`text-lg font-bold ${THEME.colors.text.heading} mb-3 flex items-center gap-2`}>
                      <FiUser className="text-purple-500" /> About
                    </h2>
                    <p className={`${THEME.colors.text.body} leading-relaxed whitespace-pre-line text-sm`}>
                      {about}
                    </p>
                  </section>

                  <hr className="my-6 border-gray-100" />

                  {/* Screening Answers */}
                  {repScreeningAnswers && repScreeningAnswers.length > 0 && (
                    <>
                      <section className="mb-8">
                        <h2 className={`text-lg font-bold ${THEME.colors.text.heading} mb-3 flex items-center gap-2`}>
                          <FiMessageCircle className="text-purple-500" /> Screening Answers
                        </h2>
                        <div className="space-y-4">
                          {repScreeningAnswers.map((item: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <h4 className="font-bold text-gray-900 text-sm mb-1">Q: {item.question}</h4>
                              <p className="text-sm text-gray-700">A: {item.answer}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                      <hr className="my-6 border-gray-100" />
                    </>
                  )}

                  {/* Skills */}
                  {skillsList && skillsList.length > 0 && (
                    <>
                      <section className="mb-8">
                        <h2 className={`text-lg font-bold ${THEME.colors.text.heading} mb-3 flex items-center gap-2`}>
                          <FiAward className="text-purple-500" /> Key Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((skill: string, index: number) => (
                            <span key={index} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </section>
                      <hr className="my-6 border-gray-100" />
                    </>
                  )}
                  {/* Experience */}
                  <section className="mb-8">
                    <h2 className={`text-lg font-bold ${THEME.colors.text.heading} mb-3 flex items-center gap-2`}>
                      <FiBriefcase className="text-purple-500" /> Experience
                    </h2>

                    {expData.length > 0 ? (
                      <div className="space-y-6">
                        {expData.map((exp: any, index: number) => (
                          <div key={index} className="relative pl-4 border-l-2 border-purple-100">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-100 border-2 border-white"></div>
                            <h3 className="text-base font-bold text-gray-900">{exp.title || 'NA'}</h3>
                            <p className="text-sm text-purple-600 font-medium mb-1">
                              {exp.company_name ? `${exp.company_name} • ` : ''}
                              {exp.start_date || 'NA'} - {exp.end_date || 'Present'}
                              {exp.location ? ` • ${exp.location}` : ''}
                            </p>
                            {exp.description ? (
                              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                                {exp.description}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <FiBriefcase className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{experience}</h4>
                          <p className="text-xs text-gray-500">Experience</p>
                        </div>
                      </div>
                    )}
                  </section>
                  {/* Education */}
                  <section className="mb-8">
                    <h2 className={`text-lg font-bold ${THEME.colors.text.heading} mb-3 flex items-center gap-2`}>
                      <FiAward className="text-purple-500" /> Education
                    </h2>

                    {eduData.length > 0 ? (
                      <div className="space-y-4">
                        {eduData.map((edu: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FiAward className="text-purple-600" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{edu.course || edu.university_institute || 'NA'}</h4>
                              <p className="text-xs text-black">{edu.specialization || 'NA'}</p>
                              <p className="text-xs text-gray-500">{edu.start_year || 'NA'} - {edu.end_year || 'Present'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <FiAward className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{education}</h4>
                          <p className="text-xs text-gray-500">Highest Education</p>
                        </div>
                      </div>
                    )}
                  </section>
                  {/* Projects */}
                  {historyList && historyList.length > 0 && (
                    <section className="mb-8">
                      <h2 className={`text-lg font-bold ${THEME.colors.text.heading} mb-4 flex items-center gap-2`}>
                        <FiBriefcase className="text-purple-500" />Projects
                      </h2>
                      <div className="space-y-6">
                        {historyList.map((item: any, index: number) => (
                          <div key={index} className="relative pl-4 border-l-2 border-purple-100">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-100 border-2 border-white"></div>
                            <h3 className="text-base font-bold text-gray-900">{item.role || item.title || 'NA'}</h3>
                            <p className="text-sm text-purple-600 font-medium mb-1">
                              {item.company ? `${item.company} • ` : ''}
                              {item.duration ? item.duration : (item.start_date ? `${item.start_date} to ${item.end_date || 'Present'}` : '')}
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {item.description || 'NA'}
                            </p>
                            {item.project_url && (
                              <a href={item.project_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">View Project</a>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Certifications */}
                  {certList && certList.length > 0 && (
                    <section className="mb-8">
                      <h2 className={`text-lg font-bold ${THEME.colors.text.heading} mb-3 flex items-center gap-2`}>
                        <FiAward className="text-purple-500" /> Certifications
                      </h2>
                      <div className="space-y-4">
                        {certList.map((cert: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FiAward className="text-purple-600" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{cert.name || 'NA'}</h4>
                              <p className="text-sm text-gray-600 mb-1">{cert.issuing_organization || 'NA'}</p>
                              {cert.issue_date && (
                                <p className="text-xs text-gray-500 mb-1">Issued: {cert.issue_date} {cert.expiration_date ? `- Expire: ${cert.expiration_date}` : ''}</p>
                              )}
                              {cert.credential_url && (
                                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View Credential</a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}


                </>
              )}

              {activeView === 'posts' && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setActiveView('overview')}>
                    <FiArrowLeft className="text-gray-500 hover:text-purple-600 transition-colors" size={20} />
                    <h1 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>Recent Posts</h1>
                  </div>

                  {postsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <FiLoader className="animate-spin text-purple-600" size={32} />
                      <p className="text-gray-500 text-sm mt-3">Loading candidate posts...</p>
                    </div>
                  ) : candidatePosts.length > 0 ? (
                    <div className="space-y-4">
                      {candidatePosts.map((post) => (
                        <PostCard key={post.id} post={post} onPostUpdate={fetchPosts} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
                      <p className="text-gray-400 font-medium">No posts shared yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'connections' && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setActiveView('overview')}>
                    <FiArrowLeft className="text-gray-500 hover:text-purple-600 transition-colors" size={20} />
                    <h1 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>Connections</h1>
                  </div>

                  {connectionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <FiLoader className="animate-spin text-purple-600" size={32} />
                      <p className="text-gray-500 text-sm mt-3">Loading connections...</p>
                    </div>
                  ) : candidateConnections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidateConnections.map((conn: any) => {
                        const detail = conn.connectionUserDetail || conn.userDetail || conn;
                        const connFirstName = detail?.first_name || '';
                        const connLastName = detail?.last_name || '';
                        const connName = connFirstName || connLastName ? `${connFirstName} ${connLastName}`.trim() : (detail?.name || 'NA');
                        const connPic = detail?.picture || '/images/user_profile_placeholder.jpeg';
                        const connTitle = detail?.designation || detail?.headline || 'Professional';
                        const connLocation = detail?.location || detail?.city || 'NA';

                        return (
                          <div
                            key={conn.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 hover:shadow-sm transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={connPic} className="w-12 h-12 rounded-full object-cover border border-purple-50 shrink-0" alt={connName} />
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-gray-900 truncate">{connName}</div>
                                <div className="text-xs text-gray-500 truncate">{connTitle}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5 truncate">{connLocation}</div>
                              </div>
                            </div>
                            <Link
                              href={`/profile/find-candidates/${detail?.id || detail?.user_id}`}
                              className="text-xs font-bold text-purple-600 border border-purple-200 px-3 py-1.5 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-colors shrink-0 ml-2"
                            >
                              View
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
                      <p className="text-gray-400 font-medium">No connections yet.</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Details (Sticky) */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* Quick Info */}
              <Card className="p-6 space-y-4">
                <h4 className={`font-bold ${THEME.colors.text.heading} mb-2 text-sm uppercase tracking-wider`}>Details</h4>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <FiDollarSign className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className={THEME.colors.text.body}>Current Salary</p>
                      <p className={`font-semibold ${THEME.colors.text.heading}`}>{currentSalary || 'Not Disclosed'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiDollarSign className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className={THEME.colors.text.body}>Expected Salary</p>
                      <p className={`font-semibold ${THEME.colors.text.heading}`}>{expectedSalary}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className={THEME.colors.text.body}>Location</p>
                      <p className={`font-semibold ${THEME.colors.text.heading}`}>{location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiBriefcase className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className={THEME.colors.text.body}>Experience</p>
                      <p className={`font-semibold ${THEME.colors.text.heading}`}>{experience}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiClock className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className={THEME.colors.text.body}>Last Active</p>
                      <p className={`font-semibold ${THEME.colors.text.heading}`}>{lastActive}</p>
                    </div>
                  </div>

                  {noticePeriodMonths && (
                    <div className="flex items-start gap-3">
                      <FiClock className="text-gray-400 mt-0.5" size={16} />
                      <div>
                        <p className={THEME.colors.text.body}>Notice Period</p>
                        <p className={`font-semibold ${THEME.colors.text.heading}`}>{noticePeriodMonths} Months</p>
                      </div>
                    </div>
                  )}

                  {ageValue && (
                    <div className="flex items-start gap-3">
                      <FiUser className="text-gray-400 mt-0.5" size={16} />
                      <div>
                        <p className={THEME.colors.text.body}>Age</p>
                        <p className={`font-semibold ${THEME.colors.text.heading}`}>{ageValue} Years</p>
                      </div>
                    </div>
                  )}

                  {distance && (
                    <div className="flex items-start gap-3">
                      <FiNavigation className="text-gray-400 mt-0.5" size={16} />
                      <div>
                        <p className={THEME.colors.text.body}>Distance</p>
                        <p className={`font-semibold ${THEME.colors.text.heading}`}>{distance}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Social Links */}
              {/* {(linkedinUrl || githubUrl || portfolioUrl) && (
                <Card className="p-6">
                  <h4 className={`font-bold ${THEME.colors.text.heading} mb-4 text-sm uppercase tracking-wider`}>Social Profiles</h4>
                  <div className="space-y-4">
                    {linkedinUrl && (
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <FiLinkedin size={16} />
                        </div>
                        <span className="font-medium">LinkedIn Profile</span>
                      </a>
                    )}
                    {githubUrl && (
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 group-hover:bg-black group-hover:text-white transition-all">
                          <FiGithub size={16} />
                        </div>
                        <span className="font-medium">GitHub Repo</span>
                      </a>
                    )}
                    {portfolioUrl && (
                      <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-purple-600 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <FiGlobe size={16} />
                        </div>
                        <span className="font-medium">Portfolio Website</span>
                      </a>
                    )}
                  </div>
                </Card>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowContactModal(false); }}>
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
                  <p className="text-sm font-bold text-gray-900 truncate">{applicant?.phone || "Not available"}</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowEmailModal(false); }}>
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
                  <p className="text-sm font-bold text-gray-900 truncate">{applicant?.email || "Not available"}</p>
                </div>
              </div>
            </div>

            <button onClick={(e) => { e.stopPropagation(); setShowEmailModal(false); }} className="mt-8 w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-sm">
              Done
            </button>
          </div>
        </div>
      )}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        initialCandidateName={name}
        initialCandidateId={Number(candidateId)}
        initialJobPostId={jobPostId ? Number(jobPostId) : null}
        mode={isEmployer ? 'employer' : 'seeker'}
        isFromNavbar={false}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import JobInviteCard from '@/components/shared/JobInviteCard';
import {
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiBookmark,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiEye,
  FiNavigation,
  FiCalendar,
  FiUserPlus,
  FiFileText,
  FiX,
  FiSend,
  FiCheck,
  FiMail,
  FiPhone
} from "react-icons/fi";
import AppliedJobCard from '@/components/shared/AppliedJobCard';
import FindJobCard from '@/components/shared/FindJobCard';
import { FaRupeeSign } from 'react-icons/fa';
import { useAuth } from "@/context/AuthContext";
import ProfileSidebar from "@/components/shared/ProfileSidebar";
import { useSearchParams, useRouter } from "next/navigation";
import JobsContent from "./JobsContent";
import ResumeContent from "@/components/profile/ResumeContent";
import ProfileSubMenu from "@/components/shared/ProfileSubMenu";
import ProfileLayout from "@/components/shared/ProfileLayout";
import Card from "@/components/shared/Card";
import PlatformActionButton from "@/components/shared/PlatformActionButton";
import MapComponent from "@/components/shared/MapComponent";

import JobFilter from "@/components/shared/JobFilter";
import { useJobFilters } from "@/hooks/useJobFilters";
import { THEME } from "@/styles/theme";
import { jobService } from "@/lib/api/services/jobService";
import { connectionService } from "@/lib/api/services/connectionService";
import { JobPost, JobPostApplication } from "@/lib/api/types";
import { sendNotificationToUser } from "@/lib/firebaseNotifications";
import { getCurrentLocation, formatSalaryLPA, formatDateTime } from "@/lib/utils";
import toast from 'react-hot-toast';
import ApplyJobModal from "@/components/jobs/ApplyJobModal";
import WithdrawApplicationModal from "@/components/jobs/WithdrawApplicationModal";


const menuItems = [
  { icon: <FiSearch size={18} />, label: 'Find Jobs', key: 'browse' },
  { icon: <FiBriefcase size={18} />, label: 'Recruiter Invitations', key: 'applications' },
  { icon: <FiCheck size={18} />, label: 'Applied Jobs', key: 'applied-jobs' },
  { icon: <FiBookmark size={18} />, label: 'Saved Jobs', key: 'saved-jobs' },
  { icon: <FiFileText size={18} />, label: 'Resume', key: 'resume' },
];

const itemsPerPage = 9;

const inputLabels = [
  'Job Title/ Role',
  'Skills',
  'Experience',
  'Company',
  'Location',
  'Date Posted',
];

interface JobApplication {
  id: string;
  company: string;
  recruiterName?: string;
  position: string;
  status: "applied" | "interviewing" | "offered" | "rejected";
  appliedDate: string;
  salary: string;
  location: string;
  logo: string | undefined;
  distance?: string;
  distanceDisplay?: string;
  workMode?: string;
  type?: string;
  skills?: string[];
  screeningQuestions?: string[];
  jobId?: string;
  is_saved?: boolean;
  connection_status?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactUserId?: number;
  posterImage?: string;
  companyLogo?: string;
  postedDate?: string;
  posterDesignation?: string;
  experienceLevel?: string;
  isOnline?: boolean;
}

interface JobRecommendation {
  id: string;
  company: string;
  position: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  matchScore: number;
  skills: string[];
  logo?: string;
  companyLogo?: string;
  distance?: number;
  distanceDisplay?: string;
  workMode?: string;
  posterName?: string;
}

// Add Employer/Applicant types
interface EmployerPosting {
  id: string;
  company: string;
  position: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  logo?: string;
  companyLogo?: string;
  posterName?: string;
  posterImage?: string;
  posterDesignation?: string;
  isOnline?: boolean;
  lastActive?: string;
  workMode?: string; // "Remote", "Office", "Hybrid"
  experienceLevel?: string; // "Both", "Fresher", "Experienced"
  distance?: number;
  lat?: number;
  lng?: number;
  isSaved?: boolean;
  isApplied?: boolean;
  is_saved?: boolean;
  is_applied?: boolean;
  distanceDisplay?: string;
  skills?: string[];
  contactUserId?: number;
  contactEmail?: string;
  contactPhone?: string;
  connection_status?: string;
  postedDate?: string;
}

interface ApplicantProfile {
  id: string;
  name: string;
  position: string;
  email: string;
  resumeId: string;
}

interface MeetingItem {
  id: string;
  candidateId: string;
  candidateName: string;
  datetime: string; // ISO datetime
  notes?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "applied":
      return "bg-blue-100 text-blue-600";
    case "interviewing":
      return "bg-yellow-100 text-yellow-600";
    case "offered":
      return "bg-green-100 text-green-600";
    case "rejected":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600 bg-green-100";
  if (score >= 80) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

export default function JobManagement() {
  return (
    <Suspense fallback={
      <div className={`profile-page min-h-screen ${THEME.colors.background.page} pt-4 md:pt-6 lg:pt-8 mt-[50px]`}>
        <div className="flex gap-6 w-full">
          <div className="w-[20%] flex-shrink-0 -mt-[50px] sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
            <ProfileSidebar />
          </div>
          <div className="w-[80%] flex-1 m-4">
            <div className="flex items-center justify-center h-64">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${THEME.colors.primary}]`}></div>
              <span className={`${THEME.components.typography.body} ml-3`}>Loading jobs...</span>
            </div>
          </div>
        </div>
      </div>
    }>
      <JobManagementContent />
    </Suspense>
  );
}

// Component that uses useSearchParams
function JobManagementContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [contactModalInfo, setContactModalInfo] = useState<{ isOpen: boolean; email: string; phone: string; name: string; type: 'email' | 'phone' | null }>({
    isOpen: false,
    email: '',
    phone: '',
    name: '',
    type: null
  });

  const handleConnectRequest = async (e: React.MouseEvent, targetUserId: number | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id || !targetUserId) {
      toast.error('Unable to send connection request.');
      return;
    }
    try {
      await connectionService.sendConnectionRequest(Number(user.id), targetUserId);
      await sendNotificationToUser(
        targetUserId,
        Number(user.id),
        `${user.first_name} ${user.last_name}`,
        user.picture || '',
        'connection_request',
        `${user.first_name} ${user.last_name} sent you a connection request.`
      );
      toast.success('Connection request sent!');
    } catch (error: any) {
      const apiError = error?.response?.data?.data?.errors?.message?.[0] || error?.response?.data?.message || 'Failed to send connection request.';
      toast.error(apiError);
    }
  };

  // Format connection_status for display
  const formatConnStatus = (status?: string) => {
    if (status === 'connected') return 'Connected';
    if (!status || status === 'not_connected') return 'Connect';
    return 'Pending';
  };

  const handleShowEmployerContact = async (e: React.MouseEvent, p: EmployerPosting) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if we need to call the API or it's already fetched/available
    try {
      const resp = await jobService.getEmployerContactDetails(p.id);
      const data = resp as any;
      const isSuccess = data?.status === 200 ||
        data?.status === 201 ||
        data?.data?.already_unlocked ||
        data?.data?.data?.already_unlocked ||
        data?.data?.credit_consumed ||
        data?.data?.data?.credit_consumed;

      if (isSuccess) {
        toast.success(data?.message || 'Contact unlocked');
        // Actually show modal
        setContactModalInfo({
          isOpen: true,
          email: p.contactEmail || 'Not available',
          phone: p.contactPhone || 'Not available',
          name: p.posterName || 'Employer',
          type: 'phone'
        });
      } else {
        throw new Error(data?.message || "Failed to reveal contact");
      }
    } catch (err: any) {
      console.error('Show contact error:', err);
      let errMsg = err?.response?.data?.data?.errors?.message?.[0] || err?.response?.data?.message || err.message || 'Failed to reveal contact';
      toast.error(errMsg);
    }
  };

  const handleShowEmployerEmail = async (e: React.MouseEvent, p: EmployerPosting) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const resp = await jobService.getEmployerEmailDetails(p.id);
      const data = resp as any;
      const isSuccess = data?.status === 200 ||
        data?.status === 201 ||
        data?.data?.already_unlocked ||
        data?.data?.data?.already_unlocked ||
        data?.data?.credit_consumed ||
        data?.data?.data?.credit_consumed;

      if (isSuccess) {
        toast.success(data?.message || 'Email unlocked');
        setContactModalInfo({
          isOpen: true,
          email: p.contactEmail || 'Not available',
          phone: p.contactPhone || 'Not available',
          name: p.posterName || 'Employer',
          type: 'email'
        });
      } else {
        throw new Error(data?.message || "Failed to reveal email");
      }
    } catch (err: any) {
      console.error('Show email error:', err);
      let errMsg = err?.response?.data?.data?.errors?.message?.[0] || err?.response?.data?.message || err.message || 'Failed to reveal email';
      toast.error(errMsg);
    }
  };

  // Dual-view mode: seeker vs employer
  const [mode, setMode] = useState<"seeker" | "employer">("seeker");

  // Update mode based on URL params
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "employer" || modeParam === "seeker") {
      setMode(modeParam);
    }
  }, [searchParams]);

  // Seeker tabs (extended)
  // Seeker tabs (extended)
  const [activeTab, setActiveTab] = useState<
    "applications" | "recommendations" | "saved" | "meetings" | "browse" | "resume" | "applied-jobs" | "saved-jobs"
  >(
    searchParams.get("tab") as "applications" | "recommendations" | "saved" | "meetings" | "browse" | "resume" | "applied-jobs" | "saved-jobs" || "browse"
  );

  // Update activeTab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab as "applications" | "recommendations" | "saved" | "meetings" | "browse" | "resume" | "applied-jobs" | "saved-jobs");
    }
  }, [searchParams]);

  // Location-based job discovery state
  const [locationFilter, setLocationFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("25");
  const [showMap, setShowMap] = useState(false);
  const [mapView, setMapView] = useState<"map" | "list">("map");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [nearbyJobs, setNearbyJobs] = useState<EmployerPosting[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<EmployerPosting[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedCurrentPage, setAppliedCurrentPage] = useState(1);
  const [savedCurrentPage, setSavedCurrentPage] = useState(1);
  const [isJobsLoading, setIsJobsLoading] = useState(false);

  interface AppliedJobData {
    id: string;
    applicationId?: number | string;
    jobId?: string;
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
    timeline: any[];
    is_saved?: boolean;
    connection_status?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactUserId?: number;
    skills?: string[];
    workMode?: string;
    experienceLevel?: string;
    salary?: string;
    companyLogo?: string;
  }

  const [appliedJobs, setAppliedJobs] = useState<AppliedJobData[]>([]);
  const [selectedWithdrawJob, setSelectedWithdrawJob] = useState<AppliedJobData | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const getWithdrawnIds = (): Set<string> => {
    try { return new Set(JSON.parse(localStorage.getItem('withdrawnJobIds') || '[]')); }
    catch { return new Set(); }
  };
  const addWithdrawnId = (id: string) => {
    const ids = getWithdrawnIds();
    ids.add(id);
    localStorage.setItem('withdrawnJobIds', JSON.stringify([...ids]));
  };
  // Filter out withdrawn jobs from appliedJobs
  const visibleAppliedJobs = appliedJobs.filter(j => !getWithdrawnIds().has(j.id));

  // Store withdrawn job details for browse-tab matching
  interface WithdrawnJobInfo { id: string; title: string; company: string; browseId?: string; }
  const getWithdrawnJobs = (): WithdrawnJobInfo[] => {
    try { return JSON.parse(localStorage.getItem('withdrawnJobDetails') || '[]'); }
    catch { return []; }
  };
  const addWithdrawnJobInfo = (info: WithdrawnJobInfo) => {
    const list = getWithdrawnJobs().filter(i => i.id !== info.id);
    list.push(info);
    localStorage.setItem('withdrawnJobDetails', JSON.stringify(list));
  };
  const isJobWithdrawn = (job: any) => {
    const infoList = getWithdrawnJobs();
    if (!infoList.length) return false;
    const jobId = job.id?.toString();
    const jobTitle = (job.position || '').toLowerCase().trim();
    const jobComp = (job.company || '').toLowerCase().trim();
    return infoList.some(info =>
      info.id === jobId ||
      info.browseId === jobId ||
      (!!info.title && !!info.company && info.title.toLowerCase().trim() === jobTitle && info.company.toLowerCase().trim() === jobComp)
    );
  };
  const clearWithdrawnJobInfo = (job: any) => {
    try {
      const jobId = job.id?.toString();
      // Remove from withdrawnJobIds
      const ids = getWithdrawnIds();
      ids.delete(jobId);
      localStorage.setItem('withdrawnJobIds', JSON.stringify([...ids]));
      // Remove from withdrawnJobDetails by matching id, browseId, or title+company
      const jobTitle = (job.position || '').toLowerCase().trim();
      const jobComp = (job.company || '').toLowerCase().trim();
      const list = getWithdrawnJobs().filter(i =>
        i.id !== jobId &&
        i.browseId !== jobId &&
        !(!!i.title && !!i.company && i.title.toLowerCase().trim() === jobTitle && i.company.toLowerCase().trim() === jobComp)
      );
      localStorage.setItem('withdrawnJobDetails', JSON.stringify(list));
    } catch { /* ignore localStorage errors */ }
  };

  // Filter state management using custom hook
  const { filters, appliedFilters, applyFilters, setters, helpers } = useJobFilters();
  const {
    searchQuery: appliedSearchQuery,
    selectedLocation: appliedLocation,
    selectedWorkMode: appliedWorkMode,
    selectedExperience: appliedExperience,
    selectedIndustry: appliedIndustry,
    selectedJobType: appliedJobType,
    selectedCompanySize: appliedCompanySize,
    selectedSkills: appliedSkills,
    selectedEducation: appliedEducation,
    selectedBenefits: appliedBenefits,
    selectedJobRole: appliedJobRole,
    selectedDepartments: appliedDepartments,
    selectedPostedBy: appliedPostedBy,
    selectedPostedDate: appliedPostedDate,
    salaryRange: appliedSalaryRange,
    experienceRange: appliedExperienceRange,
    radiusValue: appliedRadiusValue,
    showTopCompanies: appliedShowTopCompanies,
    showVerifiedOnly: appliedShowVerifiedOnly,
  } = appliedFilters;

  // Applications state
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationsTotalPages, setApplicationsTotalPages] = useState(1);
  const [applicationsTotalCount, setApplicationsTotalCount] = useState(0);
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [appLocation, setAppLocation] = useState<string[]>([]);

  // States for Accept Invite Modal
  const [selectedInviteForAccept, setSelectedInviteForAccept] = useState<JobApplication | null>(null);

  // Saved jobs
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  // Apply filters to applications (Recruiters Invitation) -- [NEW]

  // Apply filters to applications (Recruiters Invitation) -- [NEW]
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      appSearchQuery === "" ||
      app.position.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(appSearchQuery.toLowerCase());

    const matchesLocation =
      appLocation.length === 0 ||
      appLocation.some((loc: string) => app.location.includes(loc));

    // Note: 'applications' state currently has limited fields (company, position, salary, location).
    // Work Mode and other filters might not apply unless data is enriched.
    // For now, filtering by Search and Location is safe.

    return matchesSearch && matchesLocation;
  });

  // Removed obsolete handleLocationSearch

  const markJobApplied = (jobId: string, applied = true) => {
    const update = (prev: any[]) => prev.map(j =>
      j.id.toString() === jobId.toString()
        ? { ...j, is_applied: applied, isApplied: applied }
        : j
    );
    setPostings(update);
    setNearbyJobs(update);
    setRecommendedJobs(update);
    setSavedJobs(update);
  };

  const unmarkAppliedJobByDetails = (appliedJob: AppliedJobData) => {
    const normalize = (s: string) => (s || '').toLowerCase().trim();
    const pTitle = normalize(appliedJob.job.title);
    const pCompany = normalize(appliedJob.recruiter.company);
    const matchTarget = (j: any) =>
      normalize(j.position) === pTitle &&
      normalize(j.company) === pCompany;
    const found = postings.find(matchTarget)
      || nearbyJobs.find(matchTarget)
      || recommendedJobs.find(matchTarget)
      || savedJobs.find(matchTarget);
    if (found) {
      markJobApplied(found.id, false);
      // Also store the browse-tab ID for reliable render-time matching
      const existing = getWithdrawnJobs().filter(i => i.id !== appliedJob.id);
      existing.push({
        id: appliedJob.id,
        title: appliedJob.job.title,
        company: appliedJob.recruiter.company,
        browseId: found.id,
      });
      localStorage.setItem('withdrawnJobDetails', JSON.stringify(existing));
    }
  };

  const applyFromRecommendation = (job: any) => {
    clearWithdrawnJobInfo(job);
    markJobApplied(job.id);
    router.push(`/profile/jobs/${job.id}`);
  };

  // Employer: job postings
  const [postings, setPostings] = useState<EmployerPosting[]>([]);

  // Helper to format API job response to EmployerPosting
  const isActiveJob = (job: JobPost) => {
    const status = (job.status || '').toLowerCase();
    return status === 'active' || status === '';
  };

  const mapJobResponse = (job: JobPost): EmployerPosting => ({
    id: job.id.toString(),
    company: job.company_name || job.user?.employerDetails?.company_name || job.user?.company_name || "Company",
    position: job.job_title || job.jobtitle || "Position",
    location: job.location || `${job.city || ''}, ${job.state || ''}`.trim().replace(/^,|,$/g, '') || "N/A",
    salary: job.min_salary ? `${formatSalaryLPA(job.min_salary)} - ${formatSalaryLPA(job.max_salary)}` : (job.minimumfixedsalary ? `${formatSalaryLPA(job.minimumfixedsalary)} - ${formatSalaryLPA(job.maximumfixedsalary)}` : "Salary Not Disclosed"),
    type: job.employment_type || job.jobtype || "Full-time",
    description: job.job_description || job.jobdescription || "No description provided.",
    posterName: job.posted_by_name || (job.user ? `${job.user.first_name} ${job.user.last_name}` : "Recruiter"),
    posterImage: job.user?.picture || job.user?.image || "/images/user_profile_placeholder.jpeg",
    posterDesignation: job.user?.employerDetails?.designation || job.user?.designation || job.user?.employerDetails?.job_title || (job as any).poster_designation || (job as any).poster_designation_text || null,
    isOnline: job.user?.online === 1,
    lastActive: job.user?.last_active ? "Active" : "Away",
    companyLogo: job.user?.employerDetails?.company_logo_url || job.companyLogoUrl || job.company_logo_url || job.user?.picture || job.user?.image || null,
    workMode: job.work_mode || job.joblocation || "On-site",
    experienceLevel: job.min_experience_years ? `${job.min_experience_years}-${job.max_experience_years} Yrs` : (job.minimumexperience || "Both"),
    distance: job.distance || 0,
    lat: job.latitude ? parseFloat(job.latitude) : (job.maplat as number),
    lng: job.longitude ? parseFloat(job.longitude) : (job.maplong as number),
    isSaved: job.is_saved,
    isApplied: job.is_applied,
    is_applied: job.is_applied,
    is_saved: job.is_saved,
    distanceDisplay: job.distance_display,
    skills: job.key_skills ? job.key_skills.split(',').map(s => s.trim()) : [],
    contactUserId: job.user?.id,
    contactEmail: job.user?.email || job.user?.employerDetails?.professional_email,
    contactPhone: job.user?.phone,
    connection_status: (job.user as any)?.connection_status || 'not_connected',
    postedDate: String((job as any).created_at || (job as any).postedDate || (job as any).updated_at || ''),
  });

  // Fetch API Jobs with filters
  useEffect(() => {
    const fetchApiJobs = async () => {
      setIsJobsLoading(true);
      try {
        const filterParams: any = {
          expand: 'apply,save',
          status: 'Active',
          location: appliedLocation.length > 0 ? appliedLocation.join(',') : undefined,
          work_mode: appliedWorkMode.length > 0 ? appliedWorkMode[0] : undefined,
          employment_type: appliedJobType.length > 0 ? appliedJobType[0] : undefined,
          min_salary: appliedSalaryRange[0] > 0 ? appliedSalaryRange[0] * 100000 : undefined,
          max_salary: appliedSalaryRange[1] < 50 ? appliedSalaryRange[1] * 100000 : undefined,
          min_experience: appliedExperienceRange[0] > 0 ? appliedExperienceRange[0] : undefined,
          max_experience: appliedExperienceRange[1] < 50 ? appliedExperienceRange[1] : undefined,
          page: currentPage,
          'per-page': 3,
          keywords: appliedSearchQuery || undefined,
        };

        if (filterParams.work_mode === "Work from office") filterParams.work_mode = "WFO";
        if (filterParams.employment_type === "Full-time") filterParams.employment_type = "Permanent";

        // 1. Browse Jobs (Default or 'browse' tab)
        if (mode === "seeker" && (activeTab === 'browse' || !activeTab)) {
          // Fetch Recommended Jobs
          const recommendedResponse = await jobService.getRecommendedJobs(filterParams);
          if (recommendedResponse.data?.items) {
            const filtered = recommendedResponse.data.items.filter(isActiveJob);
            setRecommendedJobs(filtered.map(mapJobResponse));
          }

          // Fetch Recent Jobs (Browse List)
          const recentResponse = await jobService.getRecentlyJobPostsWithFilters(filterParams);
          if (recentResponse.data?.items) {
            const filtered = recentResponse.data.items.filter(isActiveJob);
            setPostings(filtered.map(mapJobResponse));
          }
        } else if (mode === "employer") {
          // Fetch Employer's Jobs
          const recentResponse = await jobService.getMyJobPosts(currentPage, 'apply');
          if (recentResponse.data?.items) {
            setPostings(recentResponse.data.items.map(mapJobResponse));
          }
        }

        // 2. Saved Jobs
        if (mode === "seeker" && activeTab === 'saved-jobs') {
          const savedResponse = await jobService.getSavedJobPosts(savedCurrentPage, 50);
          if (savedResponse.data?.items) {
            const savedFiltered = savedResponse.data.items.filter((job: any) => {
              const status = (job.status || job.job_post?.status || '').toLowerCase();
              return status === 'active' || status === '';
            });
            setSavedJobs(savedFiltered.map(mapJobResponse));
          }
        }

        // 3. Applied Jobs
        if (mode === "seeker" && activeTab === 'applied-jobs') {
          const appliedResponse = await jobService.getMyAppliedJobs(appliedCurrentPage, itemsPerPage);
          console.log('Applied Jobs Response:', appliedResponse);

          // The API returns: { data: { success: true, data: [...], pagination: {...} } }
          if (appliedResponse.data?.data && Array.isArray(appliedResponse.data.data)) {
            setAppliedJobs(appliedResponse.data.data.map((job: any) => ({
              id: job.id.toString(),
              applicationId: job.application?.id,
              jobId: job.id.toString(),
              recruiter: {
                id: job.user?.id,
                name: job.posted_by_name || (job.user ? `${job.user.first_name} ${job.user.last_name || ''}` : "Recruiter"),
                company: job.company_name || "Company Name",
                avatar: job.user?.employerDetails?.company_logo_url || job.companyLogoUrl || job.company_logo_url || job.user?.picture || job.user?.image || null,
                email: job.user?.email || "",
                designation: job.user?.employerDetails?.designation || job.user?.designation || job.user?.employerDetails?.job_title || (job as any).poster_designation || (job as any).poster_designation_text || "",
              },
              job: {
                title: job.job_title || "Job Title",
                appliedDate: job.application?.applied_at_formatted || (job.application?.applied_at ? new Date(job.application.applied_at * 1000).toLocaleDateString() : "Recently"),
                location: job.location || job.city || "Location",
              },
              timeline: [
                {
                  status: 'Applied',
                  date: job.application?.applied_at_formatted || (job.application?.applied_at ? new Date(job.application.applied_at * 1000).toLocaleDateString() : 'Just now'),
                  active: true
                },
                { status: 'Screening', date: 'Pending', active: false },
                { status: 'Interview', date: 'Pending', active: false },
                { status: 'Offer', date: 'Pending', active: false },
              ],
              is_saved: job.is_saved || false,
              connection_status: job.user?.connection_status || 'not_connected',
              contactEmail: job.user?.email || '',
              contactPhone: job.user?.phone || '',
              contactUserId: job.user?.id,
              skills: job.key_skills ? job.key_skills.split(',').map((s: string) => s.trim()) : [],
              workMode: job.work_mode || 'Work from office',
              experienceLevel: job.min_experience_years ? `${job.min_experience_years}-${job.max_experience_years} Yrs` : (job.minimumexperience || 'Both'),
              salary: job.min_salary ? `${formatSalaryLPA(job.min_salary)} - ${formatSalaryLPA(job.max_salary)}` : (job.minimumfixedsalary ? `${formatSalaryLPA(job.minimumfixedsalary)} - ${formatSalaryLPA(job.maximumfixedsalary)}` : "Salary Not Disclosed"),
    companyLogo: job.user?.employerDetails?.company_logo_url || job.companyLogoUrl || job.company_logo_url || job.user?.picture || job.user?.image || null,
            })));
          }
        }

        // 4. Received Invites (Applications tab)
        if (mode === "seeker" && activeTab === 'applications') {
          const invitationsResponse = await jobService.getMyReceivedInvites('pending', currentPage);
          console.log('Invitations Response:', invitationsResponse);

          let invitesArray: any[] = [];
          if (Array.isArray(invitationsResponse?.data?.data?.data)) {
            invitesArray = invitationsResponse.data.data.data;
            setApplicationsTotalPages(invitationsResponse?.data?.data?.pagination?.page_count || 1);
            setApplicationsTotalCount(invitationsResponse?.data?.data?.pagination?.total_count || 0);
          } else if (Array.isArray(invitationsResponse?.data?.data)) {
            invitesArray = invitationsResponse.data.data;
            setApplicationsTotalPages(invitationsResponse?.data?.pagination?.page_count || 1);
            setApplicationsTotalCount(invitationsResponse?.data?.pagination?.total_count || 0);
          } else if (Array.isArray(invitationsResponse?.data)) {
            invitesArray = invitationsResponse.data;
          } else if (Array.isArray(invitationsResponse as any)) {
            invitesArray = invitationsResponse as any;
          }

          setApplications(invitesArray
            .filter((invite: any) => {
              const jobData = invite.job || invite.job_post || invite;
              return !jobData.is_applied && !invite.is_applied;
            })
            .map((invite: any) => {
            const jobData = invite.job || invite.job_post || invite;
            return {
              id: invite.id?.toString() || Math.random().toString(),
              jobId: jobData.id?.toString(),
              company: jobData.company_name || jobData.user?.employerDetails?.company_name || jobData.user?.company_name || "Company",
              recruiterName: jobData.posted_by_name || (jobData.user ? `${jobData.user.first_name} ${jobData.user.last_name || ''}`.trim() : "Recruiter"),
              position: jobData.job_title || jobData.jobtitle || "Position",
              status: "applied",
              appliedDate: invite.created_at_formatted || new Date().toLocaleDateString(),
              salary: jobData.min_salary ? `₹${jobData.min_salary} - ₹${jobData.max_salary}` : (jobData.minimumfixedsalary ? `₹${jobData.minimumfixedsalary} - ₹${jobData.maximumfixedsalary}` : "Not Disclosed"),
              location: jobData.location || jobData.city || "Location",
              logo: jobData.user?.employerDetails?.company_logo_url || jobData.companyLogoUrl || jobData.company_logo_url || jobData.user?.picture || jobData.user?.image || null,
              distance: jobData.distance || 0,
              distanceDisplay: jobData.distance_display || undefined,
              workMode: jobData.work_mode || jobData.joblocation || "Office",
              type: jobData.employment_type || jobData.jobtype || "Full-time",
              skills: jobData.key_skills ? jobData.key_skills.split(',').map((s: string) => s.trim()) : [],
              screeningQuestions: jobData.screening_questions || [],
              is_saved: jobData.is_saved || false,
              connection_status: jobData.user?.connection_status || 'not_connected',
              contactEmail: jobData.user?.email || '',
              contactPhone: jobData.user?.phone || '',
              contactUserId: jobData.user?.id,
              posterImage: jobData.user?.picture || jobData.user?.image || '/images/user_profile_placeholder.jpeg',
              companyLogo: jobData.user?.employerDetails?.company_logo_url || jobData.companyLogoUrl || jobData.company_logo_url || jobData.user?.picture || jobData.user?.image || null,
              postedDate: (invite as any).created_at || (jobData as any).created_at || (jobData as any).updated_at || '',
              posterDesignation: (jobData as any).user?.employerDetails?.designation || (jobData as any).user?.designation || (jobData as any).poster_designation || (jobData as any).poster_designation_text || (jobData as any).user?.employerDetails?.job_title || null,
              experienceLevel: (jobData as any).min_experience_years ? `${(jobData as any).min_experience_years}-${(jobData as any).max_experience_years} Yrs` : ((jobData as any).minimumexperience || 'Both'),
              isOnline: (jobData as any).user?.online === 1,
            };
          }));
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setIsJobsLoading(false);
      }
    };

    fetchApiJobs();
  }, [
    mode,
    appliedLocation,
    appliedWorkMode,
    appliedJobType,
    appliedSalaryRange,
    appliedExperienceRange,
    currentPage,
    savedCurrentPage,
    appliedCurrentPage,
    appliedSearchQuery,
    appliedExperience,
    activeTab,
    refreshCounter,
  ]);

  // Fetch initial precise location
  useEffect(() => {
    getCurrentLocation()
      .then(loc => setUserLocation(loc))
      .catch(err => {
        console.error("Job page location fetch failed:", err);
        // Silently fail, MapComponent has its own fallback or will use defaultCenter
      });
  }, []);

  // Fetch Nearby Jobs uniquely tracked by real-time slider updates globally
  useEffect(() => {
    const fetchNearbyOnly = async () => {
      if (mode === "seeker" && (activeTab === 'browse' || !activeTab)) {
        try {
          const filterParams: any = {
            expand: 'apply,save',
            status: 'Active',
            location: appliedLocation.length > 0 ? appliedLocation.join(',') : undefined,
            work_mode: appliedWorkMode.length > 0 ? appliedWorkMode[0] : undefined,
            employment_type: appliedJobType.length > 0 ? appliedJobType[0] : undefined,
            min_salary: appliedSalaryRange[0] > 0 ? appliedSalaryRange[0] * 100000 : undefined,
            max_salary: appliedSalaryRange[1] < 50 ? appliedSalaryRange[1] * 100000 : undefined,
            min_experience: appliedExperienceRange[0] > 0 ? appliedExperienceRange[0] : undefined,
            max_experience: appliedExperienceRange[1] < 50 ? appliedExperienceRange[1] : undefined,
            page: currentPage,
            'per-page': 10,
            keywords: appliedSearchQuery || undefined,
            max_distance: filters.radiusValue,
            lat: userLocation?.lat,
            lng: userLocation?.lng,
          };

          if (filterParams.work_mode === "Work from office") filterParams.work_mode = "Work from office";
          if (filterParams.employment_type === "Full-time") filterParams.employment_type = "Permanent";

          const nearbyResponse = await jobService.getNearbyJobs(filterParams);
          if (nearbyResponse.data?.items) {
            setNearbyJobs(nearbyResponse.data.items.map(mapJobResponse));
          }
        } catch (err) {
          console.error("Failed to fetch nearby jobs individually:", err);
        }
      }
    };

    // Add brief debounce so rapidly dragging the slider doesn't spam the server
    const timeoutId = setTimeout(() => {
      fetchNearbyOnly();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [
    mode,
    appliedLocation,
    appliedWorkMode,
    appliedJobType,
    appliedSalaryRange,
    appliedExperienceRange,
    currentPage,
    appliedSearchQuery,
    appliedExperience,
    filters.radiusValue, // Triggers solely this effect
    activeTab
  ]);


  const [newPosting, setNewPosting] = useState<EmployerPosting>({
    id: "",
    company: "",
    position: "",
    location: "",
    salary: "",
    type: "Full-time",
    description: "",
  });
  const [editingPostingIndex, setEditingPostingIndex] = useState<number | null>(
    null
  );

  const handleSavePosting = () => {
    if (!newPosting.company || !newPosting.position) return;
    if (editingPostingIndex !== null) {
      const next = postings.slice();
      next[editingPostingIndex] = {
        ...newPosting,
        id: next[editingPostingIndex].id,
      };
      setPostings(next);
      setEditingPostingIndex(null);
    } else {
      const id = "p" + (postings.length + 1);
      setPostings([...postings, { ...newPosting, id }]);
    }
    setNewPosting({
      id: "",
      company: "",
      position: "",
      location: "",
      salary: "",
      type: "Full-time",
      description: "",
    });
  };

  const handleEditPosting = (idx: number) => {
    setEditingPostingIndex(idx);
    setNewPosting(postings[idx]);
  };

  const handleDeletePosting = (idx: number) => {
    const next = postings.slice();
    next.splice(idx, 1);
    setPostings(next);
    if (editingPostingIndex === idx) {
      setEditingPostingIndex(null);
      setNewPosting({
        id: "",
        company: "",
        position: "",
        location: "",
        salary: "",
        type: "Full-time",
        description: "",
      });
    }
  };

  // Employer: applicants & meetings
  const [applicants] = useState<ApplicantProfile[]>([
    {
      id: "c1",
      name: "Riya Gopi",
      position: "Frontend Developer",
      email: "riya@example.com",
      resumeId: "c1-resume",
    },
    {
      id: "c2",
      name: "Arun Verma",
      position: "Full Stack Engineer",
      email: "arun@example.com",
      resumeId: "c2-resume",
    },
    {
      id: "c3",
      name: "Neha Shah",
      position: "UI/UX Engineer",
      email: "neha@example.com",
      resumeId: "c3-resume",
    },
  ]);

  const [meetings, setMeetings] = useState<MeetingItem[]>([
    {
      id: "m1",
      candidateId: "c1",
      candidateName: "Riya Gopi",
      datetime: new Date().toISOString(),
      notes: "Initial screening",
    },
  ]);

  const [scheduleForm, setScheduleForm] = useState<{
    candidateId: string;
    datetime: string;
    notes: string;
  }>({ candidateId: "", datetime: "", notes: "" });
  const handleSchedule = () => {
    if (!scheduleForm.candidateId || !scheduleForm.datetime) return;
    const candidate = applicants.find((a) => a.id === scheduleForm.candidateId);
    if (!candidate) return;
    const m: MeetingItem = {
      id: "m" + (meetings.length + 1),
      candidateId: candidate.id,
      candidateName: candidate.name,
      datetime: scheduleForm.datetime,
      notes: scheduleForm.notes,
    };
    setMeetings([...meetings, m]);
    setScheduleForm({ candidateId: "", datetime: "", notes: "" });
  };

  // Secure resume download
  const handleDownloadResume = async (
    resumeId: string,
    candidateName: string
  ) => {
    try {
      const res = await fetch(`/api/resume/${encodeURIComponent(resumeId)}`, {
        headers: { "x-user-email": user?.email ?? "" },
      });
      if (!res.ok) {
        toast.error("Unauthorized or file not found");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${candidateName}-resume.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download resume");
    }
  };

  // Seeker actions
  const applyToPosting = (posting: EmployerPosting) => {
    clearWithdrawnJobInfo(posting);
    markJobApplied(posting.id);
    router.push(`/profile/jobs/${posting.id}`);
  };
  const toggleSaveJob = async (job: any) => {
    try {
      const isCurrentlySaved = job.is_saved !== undefined ? job.is_saved : job.isSaved;
      const numericId = typeof job.id === 'string' ? parseInt(job.id) : job.id;

      if (isCurrentlySaved) {
        await jobService.unsaveJob(numericId);
      } else {
        await jobService.saveJob(numericId);
      }

      // Update local state across all relevant lists
      const updateList = (prev: any[]) => prev.map(j => {
        if (j.id.toString() === job.id.toString()) {
          // Handle both camelCase and snake_case based on what the object has
          const updated = { ...j };
          if (updated.isSaved !== undefined) updated.isSaved = !isCurrentlySaved;
          if (updated.is_saved !== undefined) updated.is_saved = !isCurrentlySaved;
          return updated;
        }
        return j;
      });

      setPostings(updateList);
      setNearbyJobs(updateList);
      setRecommendedJobs(updateList);

      if (isCurrentlySaved) {
        setSavedJobs(prev => prev.filter(j => j.id.toString() !== job.id.toString()));
      } else {
        // Don't add AppliedJobData (has applicationId/timeline) to savedJobs — shape mismatch
        if (job.applicationId || job.timeline) return;

        setSavedJobs(prev => {
          const exists = prev.find(j => j.id.toString() === job.id.toString());
          if (exists) return updateList(prev);
          return [job, ...prev];
        });
      }
    } catch (err) {
      console.error("Failed to toggle save job:", err);
    }
  };

  const removeSavedJob = (job: any) => {
    toggleSaveJob(job as any)
    setSavedJobs((prev) => prev.filter((j) => j.id.toString() !== job.id.toString()));
  }

  const handleSaveApplication = (app: JobApplication) => {
    // [NEW] Align with JobPost schema for savedJobs
    const jobToSave: any = {
      id: typeof app.id === 'string' && app.id.startsWith('p') ? parseInt(app.id.substring(1)) : parseInt(app.id),
      company_name: app.company,
      job_title: app.position,
      location: app.location,
      min_salary: app.salary,
      employment_type: app.type || "Full-time",
      job_description: "",
      posted_by_name: app.recruiterName,
      company_logo_url: app.logo,
      is_saved: true,
      status: "Active",
      department: "Other",
      city: app.location.split(',')[0] || "",
      state: "",
      country: "India"
    };

    setSavedJobs((prev) => [jobToSave as JobPost, ...prev]);
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
  };

  // Seeker meetings management
  const [seekerMeetings, setSeekerMeetings] = useState<
    { id: string; datetime: string; with: string; notes?: string }[]
  >([
    {
      id: "sm1",
      datetime: new Date().toISOString(),
      with: "TechCorp HR",
      notes: "Portfolio discussion",
    },
  ]);
  const [seekerMeetingForm, setSeekerMeetingForm] = useState<{
    datetime: string;
    with: string;
    notes: string;
  }>({ datetime: "", with: "", notes: "" });
  const addSeekerMeeting = () => {
    if (!seekerMeetingForm.datetime || !seekerMeetingForm.with) return;
    const m = { id: "sm" + (seekerMeetings.length + 1), ...seekerMeetingForm };
    setSeekerMeetings([...seekerMeetings, m]);
    setSeekerMeetingForm({ datetime: "", with: "", notes: "" });
  };

  // Scroll to Schedule Meeting section when URL has specific parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    const modeParam = urlParams.get("mode");

    if (tab === "meetings" && modeParam === "employer") {
      // Wait for the DOM to be fully rendered
      setTimeout(() => {
        const scheduleMeetingSection = document.getElementById("schedule-meeting");
        if (scheduleMeetingSection) {
          scheduleMeetingSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 300); // Increased timeout to ensure DOM is ready
    }
  }, [activeTab, mode]);

  const resumeTab = searchParams.get("resumeTab");
  const hideResumeSidebar = activeTab === "resume" && (resumeTab === "builder" || resumeTab === "uploadBuilder");

  return (
    <ProfileLayout showSidebar={!hideResumeSidebar} showStories={false} showJobSearchBar={false}>
      <div className={`profile-page min-h-screen ${THEME.colors.background.page} pt-4 md:pt-6 lg:pt-8 pb-24 lg:pb-8 -mt-[30px]`}>
        <div className="flex gap-2 md:gap-4 w-full px-1 md:px-3">
          <div className="w-full flex-1">
            {/* Enhanced Breadcrumb */}
            {/* Enhanced Breadcrumb */}
            {/* <Card className="mb-6 p-4 shadow-sm border border-gray-100" noPadding>
          <nav
            className="flex items-center text-sm font-medium"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center space-x-1">
              <li>
                <Link
                  href="/networking"
                  className="group flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-light-bg hover:to-light-bg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </li>
              <li>
                <FiChevronRight
                  className="mx-2 text-gray-400 group-hover:text-primary transition-colors duration-200"
                  size={16}
                />
              </li>
              <li>
                <Link
                  href="/profile"
                  className="group flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-light-bg hover:to-light-bg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative">
                    Profile
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </li>
              <li>
                <FiChevronRight className="mx-2 text-gray-400" size={16} />
              </li>
              <li>
                <span className="flex items-center px-4 py-2.5 rounded-lg text-primary bg-gradient-to-r ${THEME.colors.gradient.light} font-semibold shadow-sm border border-[#E5E3FF]">
                  <FiBriefcase className="mr-2" size={16} />
                  Jobs
                </span>
              </li>
            </ol>
          </nav>
        </Card> */}

            {/* Dual view toggle */}
            {/* <div className="flex justify-center mb-6">
          <Card className="flex gap-2 border border-[#E8E4FF] p-2 shadow-sm" noPadding>
            {["seeker", "employer"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m as "seeker" | "employer")}
                className={`px-5 py-2 rounded-xl font-medium transition-all ${
                  mode === m
                    ? "bg-gradient-to-r from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white shadow-lg"
                    : "text-[#666] hover:text-primary hover:bg-light-bg"
                }`}
              >
                {m === "seeker" ? "Job Seeking Mode" : "Employer Mode"}
              </button>
            ))}
          </Card>
        </div> */}

            {mode === "employer" ? (
              <>
                <ProfileSubMenu
                  menuItems={menuItems}
                  activeTab={activeTab}
                  onTabChange={(key) => setActiveTab(key as any)}
                />
                <div className="space-y-8 mt-12">
                  {/* Employer: Post Job */}
                  <Card className="p-6" noPadding>
                    <h2 className={`${THEME.components.typography.sectionTitle} text-2xl mb-6`}>
                      Post a Job
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        className={`${THEME.components.input.default}`}
                        placeholder="Company"
                        value={newPosting.company}
                        onChange={(e) =>
                          setNewPosting((p) => ({ ...p, company: e.target.value }))
                        }
                      />
                      <input
                        className={`${THEME.components.input.default}`}
                        placeholder="Position"
                        value={newPosting.position}
                        onChange={(e) =>
                          setNewPosting((p) => ({ ...p, position: e.target.value }))
                        }
                      />
                      <input
                        className={`${THEME.components.input.default}`}
                        placeholder="Location"
                        value={newPosting.location}
                        onChange={(e) =>
                          setNewPosting((p) => ({ ...p, location: e.target.value }))
                        }
                      />
                      <input
                        className={`${THEME.components.input.default}`}
                        placeholder="Salary"
                        value={newPosting.salary}
                        onChange={(e) =>
                          setNewPosting((p) => ({ ...p, salary: e.target.value }))
                        }
                      />
                      <select
                        className={`${THEME.components.input.default}`}
                        value={newPosting.type}
                        onChange={(e) =>
                          setNewPosting((p) => ({ ...p, type: e.target.value }))
                        }
                      >
                        <option>Full-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                      <textarea
                        className={`${THEME.components.input.default} md:col-span-2 min-h-[100px]`}
                        placeholder="Description"
                        value={newPosting.description}
                        onChange={(e) =>
                          setNewPosting((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="mt-6 flex gap-3 justify-end">
                      {editingPostingIndex !== null && (
                        <button
                          onClick={() => {
                            setEditingPostingIndex(null);
                            setNewPosting({
                              id: "",
                              company: "",
                              position: "",
                              location: "",
                              salary: "",
                              type: "Full-time",
                              description: "",
                            });
                          }}
                          className="px-6 py-2 border border-gray-200 rounded-full text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleSavePosting}
                        className={`${THEME.components.button.primary} px-8 py-2`}
                      >
                        {editingPostingIndex !== null ? "Update Job" : "Create Job"}
                      </button>
                    </div>
                  </Card>

                  {/* Employer: Manage Listings */}
                  <div className="space-y-4">
                    <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>
                      Manage Listings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {postings.map((p, idx) => (
                        <Card
                          key={p.id}
                          className="hover:shadow-lg transition-all duration-300"
                          noPadding
                        >
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className={`${THEME.components.typography.cardTitle} text-lg mb-1`}>
                                  {p.position}
                                </h3>
                                <div className={`flex items-center gap-2 ${THEME.components.typography.body} text-xs`}>
                                  <span>{p.company}</span>
                                  <span>•</span>
                                  <span>{p.location}</span>
                                  <span>•</span>
                                  <span>{p.type}</span>
                                </div>
                              </div>
                              <div className={`px-3 py-1 bg-purple-50 text-[${THEME.colors.primary}] rounded-full text-xs font-medium`}>
                                {p.salary}
                              </div>
                            </div>

                            <p className={`${THEME.components.typography.body} mb-6 line-clamp-2`}>{p.description}</p>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                              <button
                                className="flex-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                onClick={() => handleEditPosting(idx)}
                              >
                                Edit
                              </button>
                              <button
                                className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                onClick={() => handleDeletePosting(idx)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Employer: Applicants */}
                  <div className="space-y-4">
                    <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>
                      Applicants
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {applicants.map((a) => (
                        <Card
                          key={a.id}
                          className="hover:shadow-lg transition-all duration-300 text-center"
                          noPadding
                        >
                          <div className="p-6">
                            <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} text-white font-bold text-xl flex items-center justify-center mb-3 shadow-md`}>
                              {(a.name || '?').charAt(0)}
                            </div>
                            <h3 className={`${THEME.components.typography.cardTitle} text-lg mb-1`}>{a.name}</h3>
                            <p className={`${THEME.components.typography.body} text-xs mb-4`}>
                              Applied for: <span className="font-medium text-gray-900">{a.position}</span>
                            </p>
                            <div className={`inline-block px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 mb-4`}>
                              {a.email}
                            </div>
                            <button
                              className={`w-full ${THEME.components.button.primary} px-4 py-2 text-sm`}
                              onClick={() => handleDownloadResume(a.resumeId, a.name)}
                            >
                              Download Resume
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Employer: Schedule meetings */}
                  <Card className="p-6" noPadding>
                    <h2 className={`${THEME.components.typography.sectionTitle} text-2xl mb-6`}>
                      Schedule Meeting
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        className={`${THEME.components.input.default}`}
                        value={scheduleForm.candidateId}
                        onChange={(e) =>
                          setScheduleForm((s) => ({
                            ...s,
                            candidateId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Candidate</option>
                        {applicants.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="datetime-local"
                        className={`${THEME.components.input.default}`}
                        value={scheduleForm.datetime}
                        onChange={(e) =>
                          setScheduleForm((s) => ({ ...s, datetime: e.target.value }))
                        }
                      />
                      <input
                        className={`${THEME.components.input.default}`}
                        placeholder="Notes (optional)"
                        value={scheduleForm.notes}
                        onChange={(e) =>
                          setScheduleForm((s) => ({ ...s, notes: e.target.value }))
                        }
                      />
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSchedule}
                        className={`${THEME.components.button.primary} px-8 py-2`}
                      >
                        Add Meeting
                      </button>
                    </div>

                    {meetings.length > 0 && (
                      <div className="mt-8">
                        <h3 className={`${THEME.components.typography.sectionTitle} text-lg mb-4`}>
                          Upcoming Meetings
                        </h3>
                        <div className={`overflow-x-auto rounded-xl border ${THEME.colors.border}`}>
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr className="text-left">
                                <th className={`py-3 px-4 font-semibold ${THEME.colors.text.subheading}`}>Candidate</th>
                                <th className={`py-3 px-4 font-semibold ${THEME.colors.text.subheading}`}>Date & Time</th>
                                <th className={`py-3 px-4 font-semibold ${THEME.colors.text.subheading}`}>Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {meetings.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                  <td className={`py-3 px-4 font-medium ${THEME.colors.text.heading}`}>
                                    {m.candidateName}
                                  </td>
                                  <td className={`py-3 px-4 ${THEME.colors.text.body}`}>
                                    {new Date(m.datetime).toLocaleString()}
                                  </td>
                                  <td className={`py-3 px-4 ${THEME.colors.text.body}`}>{m.notes || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </>
            ) : (
              <>
                <ProfileSubMenu
                  menuItems={menuItems}
                  activeTab={activeTab}
                  onTabChange={(key) => setActiveTab(key as any)}
                />

                {/* Stats Cards */}
                {/* <div className="mt-[6px] mb-[3px]">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat mb-8">
                Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 hover:shadow-lg transition-all duration-300" noPadding>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                      <FiBriefcase size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#222]">12</h3>
                      <p className="text-sm text-[#666]">Applications</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all duration-300" noPadding>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                      <FiEye size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#222]">3</h3>
                      <p className="text-sm text-[#666]">Interviews</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all duration-300" noPadding>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                      <FiBookmark size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#222]">8</h3>
                      <p className="text-sm text-[#666]">Saved Jobs</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all duration-300" noPadding>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                      <FiTrendingUp size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#222]">92%</h3>
                      <p className="text-sm text-[#666]">Match Score</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div> */}


                {/* Content based on active tab */}
                {activeTab === 'resume' && (
                  <div className="mt-6">
                    <ResumeContent queryParam="resumeTab" />
                  </div>
                )}

                {activeTab === "applications" && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-6">
                      {/* <JobFilter filters={filters} setters={setters} helpers={helpers} onApply={applyFilters} /> */}
                      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center px-2">
                        <h2 className={`${THEME.components.typography.sectionTitle} mt-10 text-2xl`}>
                          Recruiters Invitation
                        </h2>
                      </div>
                    </div>

                    {filteredApplications.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4">
                          {filteredApplications.map((app) => (
                            <div key={app.id}>
                              <JobInviteCard
                                jobId={app.id}
                                companyName={app.company}
                                recruiterName={app.recruiterName}
                                companyLogo={app.logo || ""}
                                posterImage={app.posterImage}
                                distance={app.distanceDisplay || app.distance || "2.5 km away"}
                                jobTitle={app.position}
                                workType={app.workMode || "Work from office"}
                                jobType={app.type || "Both"}
                                location={app.location}
                                salary={app.salary}
                                skills={app.skills}
                                isSaved={app.is_saved}
                                connectionStatus={app.connection_status}
                                onAccept={() => setSelectedInviteForAccept(app)}
                                onDecline={async () => {
                                  try {
                                    const formData = new FormData();
                                    formData.append('action', 'decline');
                                    await jobService.respondToInvite(app.id, formData);
                                    setApplications(prev => prev.filter(inv => inv.id !== app.id));
                                  } catch (err) {
                                    console.error("Failed to decline invite:", err);
                                  }
                                }}
                                onSave={() => toggleSaveJob({ ...app, id: app.jobId || app.id })}
                                onConnect={(e) => handleConnectRequest(e, app.contactUserId)}
                                onShowEmail={(e) => handleShowEmployerEmail(e, { ...app, id: app.jobId || app.id } as any)}
                                onShowContact={(e) => handleShowEmployerContact(e, { ...app, id: app.jobId || app.id } as any)}
                                postedDate={app.postedDate}
                                posterDesignation={app.posterDesignation}
                                experienceLevel={app.experienceLevel}
                                isOnline={app.isOnline}
                                onMeeting={(e) => {
                                  e.stopPropagation();
                                  if (!user?.is_premium) {
                                    setShowSubscriptionPopup(true);
                                    return;
                                  }
                                  window.dispatchEvent(new CustomEvent('openMeetingModal', {
                                    detail: {
                                      candidateName: app.recruiterName || app.company,
                                      candidateId: app.contactUserId,
                                      jobPostId: app.jobId ? Number(app.jobId) : null,
                                      isFromNavbar: false,
                                    }
                                  }));
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {applicationsTotalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                                }`}
                            >
                              <FiChevronLeft size={20} />
                            </button>

                            {Array.from({ length: applicationsTotalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${currentPage === page
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                              >
                                {page}
                              </button>
                            ))}

                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, applicationsTotalPages))}
                              disabled={currentPage === applicationsTotalPages}
                              className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${currentPage === applicationsTotalPages
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                                }`}
                            >
                              <FiChevronRight size={20} />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center text-gray-500 text-sm">
                        No invitations match your filters
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "applied-jobs" && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center px-2">
                        <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>
                          Applied Jobs
                        </h2>
                      </div>
                    </div>

                    {visibleAppliedJobs.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                            {visibleAppliedJobs
                            .slice((appliedCurrentPage - 1) * itemsPerPage, appliedCurrentPage * itemsPerPage)
                            .map((job) => (
                              <div key={job.id}>
                                <AppliedJobCard
                                  jobId={job.id}
                                  recruiter={job.recruiter}
                                  job={job.job}
                                  timeline={job.timeline}
                                  applicationId={job.applicationId}
                                  onWithdraw={() => setSelectedWithdrawJob(job)}
                                  isSaved={job.is_saved}
                                  onSave={(e) => toggleSaveJob(job)}
                                  connectionStatus={job.connection_status}
                                  onConnect={(e) => handleConnectRequest(e, job.contactUserId)}
                                  onContactEmail={(e) => handleShowEmployerEmail(e, job as any)}
                                  onContactPhone={(e) => handleShowEmployerContact(e, job as any)}
                                  skills={job.skills}
                                />
                              </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {visibleAppliedJobs.length > itemsPerPage && (
                          <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                            <button
                              onClick={() => setAppliedCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={appliedCurrentPage === 1}
                              className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${appliedCurrentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                                }`}
                            >
                              <FiChevronLeft size={20} />
                            </button>

                            {Array.from({ length: Math.ceil(visibleAppliedJobs.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setAppliedCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${appliedCurrentPage === page
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                              >
                                {page}
                              </button>
                            ))}

                            <button
                              onClick={() => setAppliedCurrentPage(prev => Math.min(prev + 1, Math.ceil(visibleAppliedJobs.length / itemsPerPage)))}
                              disabled={appliedCurrentPage === Math.ceil(visibleAppliedJobs.length / itemsPerPage)}
                              className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${appliedCurrentPage === Math.ceil(visibleAppliedJobs.length / itemsPerPage)
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                                }`}
                            >
                              <FiChevronRight size={20} />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center text-gray-500 text-sm">
                        No applied jobs found
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "saved-jobs" && (
                  <div className="space-y-6">
                    <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>
                      Saved Jobs
                    </h2>
                    {savedJobs.length > 0 ? (
                      <>
                        <div className="flex md:grid md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible md:snap-none pb-2 md:pb-0">
                          {savedJobs
                            .slice((savedCurrentPage - 1) * itemsPerPage, savedCurrentPage * itemsPerPage)
                            .map((job) => (
                              <div key={job.id} className="min-w-[75vw] sm:min-w-[280px] md:min-w-0 snap-start">
                                <FindJobCard
                                  job={job}
                                  onSave={() => toggleSaveJob(job)}
                                  onConnect={(e) => handleConnectRequest(e, job.contactUserId)}
                                  onShowEmail={(e) => handleShowEmployerEmail(e, job)}
                                  onShowContact={(e) => handleShowEmployerContact(e, job)}
                                  onApply={() => applyFromRecommendation(job)}
                                  formatConnStatus={formatConnStatus}
                                />
                              </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {savedJobs.length > itemsPerPage && (
                          <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                            <button
                              onClick={() => setSavedCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={savedCurrentPage === 1}
                              className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${savedCurrentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                                }`}
                            >
                              <FiChevronLeft size={20} />
                            </button>

                            {Array.from({ length: Math.ceil(savedJobs.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setSavedCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${savedCurrentPage === page
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                              >
                                {page}
                              </button>
                            ))}

                            <button
                              onClick={() => setSavedCurrentPage(prev => Math.min(prev + 1, Math.ceil(savedJobs.length / itemsPerPage)))}
                              disabled={savedCurrentPage === Math.ceil(savedJobs.length / itemsPerPage)}
                              className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${savedCurrentPage === Math.ceil(savedJobs.length / itemsPerPage)
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                                }`}
                            >
                              <FiChevronRight size={20} />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} text-white flex items-center justify-center`}>
                          <FiBookmark size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#222] mb-2">
                          No Saved Jobs Yet
                        </h3>
                        <p className="text-[#666] mb-6">
                          Start saving jobs you're interested in to view them here
                        </p>
                        <button className={`px-6 py-3 bg-gradient-to-r ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300`}>
                          Find Jobs
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "recommendations" && (
                  <div className="space-y-6 mt-[4rem]">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>
                        Job Recommendations
                      </h2>
                      <div className="flex gap-3">
                        <button className={`${THEME.components.button.primary} flex items-center gap-2`}>
                          <FiFilter size={16} />
                          Preferences
                        </button>
                      </div>
                    </div>

                    {/* Location-based Job Discovery Controls */}
                    <Card className="p-6" noPadding>
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Location Controls */}
                        <div className="flex-1 space-y-4">
                          <h3 className={`${THEME.components.typography.sectionTitle} mb-4`}>
                            Discover Jobs Near You
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                            <div>
                              {/* <label className={`block text-sm font-medium ${THEME.components.typography.body} mb-2`}>
                                Location
                              </label> */}
                              <div className="relative">
                                <FiMapPin
                                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${THEME.colors.text.muted}`}
                                  size={16}
                                />
                                <input
                                  type="text"
                                  placeholder="Enter city or address"
                                  className={`${THEME.components.input.default} pl-10`}
                                  value={locationFilter}
                                  onChange={(e) =>
                                    setLocationFilter(e.target.value)
                                  }
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                className={`flex-1 ${THEME.components.button.primary} px-6 py-2.5 h-[42px]`}
                                onClick={() => { }}
                              >
                                <FiSearch size={16} className="inline mr-2" />
                                Search
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Map View */}
                    {showMap && (
                      <Card className="p-6" noPadding>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-100 pb-4">
                          {/* Left: Search Radius Bar */}
                          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                              Radius
                            </span>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              step="1"
                              value={distanceFilter}
                              onChange={(e) => setDistanceFilter(e.target.value)}
                              className="w-32 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600 hover:bg-gray-300 transition-all"
                            />
                            <span className="text-sm font-bold text-purple-600 min-w-[50px] text-right">
                              {distanceFilter} km
                            </span>
                          </div>

                          {/* Right: Title & View Buttons */}
                          <div className="flex items-center gap-6">
                            <h3 className={`${THEME.components.typography.sectionTitle} text-lg`}>
                              {nearbyJobs.length} jobs within {distanceFilter}km
                            </h3>

                            <div className="flex bg-gray-100 p-1 rounded-lg">
                              <button
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${mapView === "list"
                                  ? "bg-white text-purple-600 shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                                  }`}
                                onClick={() => setMapView("list")}
                              >
                                List
                              </button>
                              <button
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${mapView === "map"
                                  ? "bg-white text-purple-600 shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                                  }`}
                                onClick={() => setMapView("map")}
                              >
                                Map
                              </button>
                            </div>
                          </div>
                        </div>

                        {mapView === "map" ? (
                          <div className="relative h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden">
                            {/* Interactive Map Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <FiMapPin
                                  size={48}
                                  className={`text-[${THEME.colors.primary}] mx-auto mb-4`}
                                />
                                <h4 className={`${THEME.components.typography.sectionTitle} mb-2`}>
                                  Interactive Map View
                                </h4>
                                <p className={`${THEME.components.typography.body}`}>
                                  Visualize nearby job opportunities
                                </p>
                              </div>
                            </div>

                            {/* Map Markers for Jobs */}
                            {nearbyJobs.map((job, index) => (
                              <div
                                key={job.id}
                                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                                style={{
                                  left: `${20 + ((index * 15) % 60)}%`,
                                  top: `${30 + ((index * 10) % 40)}%`,
                                }}
                                onClick={() => setSelectedJob(job)}
                              >
                                <div className={`w-8 h-8 bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-110 transition-transform`}>
                                  {index + 1}
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    {job.position} at {job.company}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Selected Job Info Panel */}
                            {selectedJob && (
                              <div className={`absolute bottom-4 left-4 right-4 bg-white rounded-lg p-4 shadow-lg border ${THEME.colors.border}`}>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className={`${THEME.components.typography.cardTitle}`}>
                                      {selectedJob.position}
                                    </h4>
                                    <p className={`${THEME.components.typography.body}`}>
                                      {selectedJob.company} • {selectedJob.location}
                                    </p>
                                    <p className={`${THEME.components.typography.body}`}>
                                      {selectedJob.salary} • {selectedJob.distance}
                                      km away
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <PlatformActionButton
                                      label="Apply"
                                      icon={FiSend}
                                      isRevealed={selectedJob.isApplied || selectedJob.is_applied}
                                      disabled={selectedJob.isApplied || selectedJob.is_applied}
                                      onClick={selectedJob.isApplied || selectedJob.is_applied ? undefined : () =>
                                        applyFromRecommendation(selectedJob)
                                      }
                                    />
                                    <button
                                      className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                      onClick={() => setSelectedJob(null)}
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {nearbyJobs.map((job) => (
                              <div
                                key={job.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => setSelectedJob(job)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} rounded-lg flex items-center justify-center text-white font-bold`}>
                                    {job.logo}
                                  </div>
                                  <div>
                                    <h4 className={`${THEME.components.typography.cardTitle}`}>
                                      {job.position}
                                    </h4>
                                    <p className={`${THEME.components.typography.body}`}>
                                      {job.company} • {job.location}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${THEME.components.typography.cardTitle}`}>
                                    {job.distance}km away
                                  </p>
                                  <p className={`${THEME.components.typography.caption}`}>
                                    {job.salary}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {recommendedJobs.map((job) => (
                        <Card
                          key={job.id}
                          className="hover:shadow-lg transition-all duration-300"
                          noPadding
                        >
                          <div className="p-6 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} text-white font-bold flex items-center justify-center`}>
                                {(job.company || '?').charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`${THEME.components.typography.cardTitle} mb-1 truncate`}>
                                  {job.position}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600`}
                                >
                                  Recommended
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-col gap-0.5">
                                <p className={`${THEME.components.typography.body} font-medium truncate`}>
                                  {job.company}
                                </p>
                                <p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                  <FiClock size={10} />
                                  {job.postedDate ? `Posted at ${formatDateTime(job.postedDate)}` : "Recently"}
                                </p>
                              </div>
                              <div className={`space-y-1 ${THEME.components.typography.body}`}>
                                <div className="flex items-center gap-1">
                                  <FiMapPin size={14} />
                                  <span className="truncate">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FiDollarSign size={14} />
                                  <span>{job.salary}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FiClock size={14} />
                                  <span>Recently</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              <span className="px-2 py-1 bg-[#F3EFFF] text-primary text-xs font-medium rounded-lg">
                                {job.type}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                              <PlatformActionButton
                                icon={FiBookmark}
                                label="Save"
                                className="w-full"
                                isSaved={job.isSaved}
                                onClick={() => toggleSaveJob(job as any)}
                              />
                              <PlatformActionButton
                                label="Apply Now"
                                icon={FiSend}
                                isRevealed={job.isApplied || job.is_applied}
                                className="w-full"
                                disabled={job.isApplied || job.is_applied}
                                onClick={job.isApplied || job.is_applied ? undefined : () => applyFromRecommendation(job)}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "saved" && (
                  <div className="space-y-6 mt-[4rem]">
                    <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>
                      Saved Jobs
                    </h2>
                    {savedJobs.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                        {savedJobs.map((job: any) => (
                          <JobInviteCard
                            key={job.id}
                            companyName={job.company}
                            companyLogo={job.logo || ''}
                            distance={`${job.distance || 0} km away`}
                            jobTitle={job.position}
                            workType="Work from office"
                            jobType={job.type}
                            location={job.location}
                            salary={job.salary}
                            primaryActionLabel="Apply Now"
                            onAccept={() => applyFromRecommendation(job)}
                            onSave={() => removeSavedJob(job)} // Allow unsaving
                            isSaved={true}
                            disabled={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white flex items-center justify-center">
                          <FiBookmark size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#222] mb-2">
                          No Saved Jobs Yet
                        </h3>
                        <p className="text-[#666] mb-6">
                          Start saving jobs you're interested in to view them here
                        </p>
                        <button
                          onClick={() => setActiveTab('browse')}
                          className="px-6 py-3 bg-gradient-to-r from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300"
                        >
                          Find Jobs
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "browse" && (
                  <>
                    {isJobsLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-purple-100 mt-8">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                          <FiBriefcase className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600" size={24} />
                        </div>
                        <p className="mt-6 text-purple-900 font-bold text-lg animate-pulse">Finding the best matches...</p>
                        <p className="text-purple-400 text-sm mt-1">Fetching latest opportunities near you</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <JobFilter filters={filters} setters={setters} helpers={helpers} onApply={applyFilters} />
                        {/* Recently Posted Jobs Section */}
                        <div className="mt-4">
                          <div className="flex flex-row gap-4 justify-between items-center mb-3">
                            <h2 className={`text-lg sm:text-xl font-bold ${THEME.colors.text.heading} font-Montserrat`}>
                              Latest Job Openings
                            </h2>
                            <Link
                              href="/profile/jobs/category/recent"
                              className="text-sm text-purple-600 font-semibold hover:text-purple-700 hover:underline flex items-center gap-1"
                            >
                              View All
                              <FiChevronRight size={16} />
                            </Link>
                          </div>

                          <div className="flex md:grid md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible md:snap-none pb-2 md:pb-0">
                            {postings.map((p) => {
                              const withdrawn = isJobWithdrawn(p);
                              const adjusted = withdrawn ? { ...p, is_applied: false, isApplied: false } : p;
                              return (
                              <div key={`recent-${p.id}`} className="min-w-[75vw] sm:min-w-[280px] md:min-w-0 snap-start">
                                <FindJobCard
                                  job={adjusted}
                                  onSave={() => toggleSaveJob(p as any)}
                                  onConnect={(e) => handleConnectRequest(e, p.contactUserId)}
                                  onShowEmail={(e) => handleShowEmployerEmail(e, p as EmployerPosting)}
                                  onShowContact={(e) => handleShowEmployerContact(e, p as EmployerPosting)}
                                  onApply={() => applyToPosting(adjusted)}
                                  formatConnStatus={formatConnStatus}
                                />
                              </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Find Jobs Section */}
                        <div>
                          {/* <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#222] font-Montserrat">
                      Find Jobs
                    </h2>
                    <Link
                      href="/profile/jobs/category/recommended"
                      className="text-sm text-purple-600 font-semibold hover:text-purple-700 hover:underline flex items-center gap-1"
                    >
                      See More
                      <FiChevronRight size={16} />
                    </Link>
                  </div> */}

                          {/* Nearby Jobs Map Section */}
                          <div className="mb-0">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-3">
                              <h2 className={`text-lg sm:text-xl font-bold ${THEME.colors.text.heading} font-Montserrat`}>
                                Nearby Jobs
                              </h2>
                              <Link
                                href="/profile/jobs/nearby-map"
                                className="text-sm text-purple-600 font-semibold hover:text-purple-700 hover:underline flex items-center gap-1"
                              >
                                View All
                                <FiChevronRight size={16} />
                              </Link>
                            </div>
                            <NearbyJobsMapView
                              postings={nearbyJobs.map(j => isJobWithdrawn(j) ? { ...j, is_applied: false, isApplied: false } : j)}
                              radius={filters.radiusValue}
                              setRadius={(val) => {
                                setters.setRadiusValue(val);
                              }}
                              center={userLocation || undefined}
                              onSave={(posting) => toggleSaveJob({
                                id: posting.id,
                                company: posting.company,
                                position: posting.position,
                                location: posting.location,
                                salary: posting.salary,
                                type: posting.type,
                                postedDate: "Recently",
                                matchScore: 0,
                                skills: [],
                                logo: posting.companyLogo || (posting.company ? posting.company.charAt(0) : ""),
                                distance: posting.distance || 0,
                                is_saved: posting.isSaved || posting.is_saved
                              })}
                              onConnectRequest={handleConnectRequest}
                              onShowContact={handleShowEmployerContact}
                              onShowEmail={handleShowEmployerEmail}
                            />
                          </div>
                        </div>
                        {/* End of Find Jobs Section */}


                        {/* Recommended Jobs Section - Separate from Find Jobs */}
                        <div className="mt-0">
                          <div className="flex flex-row gap-4 justify-between items-center mb-3">
                            <h2 className={`text-lg sm:text-xl font-bold ${THEME.colors.text.heading} font-Montserrat`}>
                                Job Recommendations
                              </h2>
                              <Link
                                href="/profile/jobs/category/recommended"
                                className="text-sm text-purple-600 font-semibold hover:text-purple-700 hover:underline flex items-center gap-1"
                              >
                                View All
                                <FiChevronRight size={16} />
                              </Link>
                          </div>

                          <div className="flex md:grid md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible md:snap-none pb-2 md:pb-0">
                            {recommendedJobs.length == 0 && (<p className="text-center text-gray-500 col-span-full hidden md:block">No Recommended jobs found</p>)}
                            {recommendedJobs.map((job) => {
                              const withdrawn = isJobWithdrawn(job);
                              const adjusted = withdrawn ? { ...job, is_applied: false, isApplied: false } : job;
                              return (
                              <div key={job.id} className="min-w-[75vw] sm:min-w-[280px] md:min-w-0 snap-start">
                                <FindJobCard
                                  job={adjusted}
                                  onSave={() => toggleSaveJob(job)}
                                  onConnect={(e) => handleConnectRequest(e, job.contactUserId)}
                                  onShowEmail={(e) => handleShowEmployerEmail(e, job)}
                                  onShowContact={(e) => handleShowEmployerContact(e, job)}
                                  onApply={() => applyFromRecommendation(adjusted)}
                                  formatConnStatus={formatConnStatus}
                                />
                              </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Accept Invite Modal */}
      {selectedInviteForAccept && (
        <ApplyJobModal
          isOpen={!!selectedInviteForAccept}
          onClose={() => setSelectedInviteForAccept(null)}
          jobId={selectedInviteForAccept.jobId || ""}
          jobTitle={selectedInviteForAccept.position}
          screeningQuestions={selectedInviteForAccept.screeningQuestions || []}
          onSubmit={async (formData) => {
            formData.append('action', 'accept');
            formData.delete('job_post_id');
            formData.delete('described');
            try {
              const resp = await jobService.respondToInvite(selectedInviteForAccept.id, formData);
              const resData = (resp as any);
              if (resData.success === false || resData.data?.success === false) {
                let errorMessage = resData.message || "Failed to accept invite";
                const errorsObj = resData.data?.errors || resData.errors;
                if (errorsObj) {
                  const firstErrorKey = Object.keys(errorsObj)[0];
                  if (firstErrorKey && Array.isArray(errorsObj[firstErrorKey])) {
                    errorMessage = errorsObj[firstErrorKey][0];
                  }
                }
                throw new Error(errorMessage);
              }
              setApplications(prev => prev.filter(app => app.id !== selectedInviteForAccept.id));
            } catch (err: any) {
              console.error("Failed to accept invite:", err);
              const errMsg = err.response?.data?.message || err.message || "";
              if (errMsg.toLowerCase().includes('already applied')) {
                setApplications(prev => prev.filter(app => app.id !== selectedInviteForAccept.id));
              }
              throw err;
            }
          }}
        />
      )}

      {/* Withdraw Application Modal */}
      {selectedWithdrawJob && (
        <WithdrawApplicationModal
          isOpen={!!selectedWithdrawJob}
          onClose={() => setSelectedWithdrawJob(null)}
          jobTitle={selectedWithdrawJob.job.title}
          jobId={selectedWithdrawJob.id}
          applicationId={selectedWithdrawJob.applicationId}
          onSubmit={async (formData) => {
            try {
              const resp = await jobService.withdrawApplication(formData);
              const responseData = resp as any;
              // Check if the API actually succeeded (some backends return 200 with success:false)
              if (responseData?.status === 200 || responseData?.status === 201 || responseData?.success === true || responseData?.data?.success === true || !responseData?.error) {
                toast.success(responseData?.message || "Application withdrawn successfully");
                addWithdrawnId(selectedWithdrawJob.id);
                addWithdrawnJobInfo({
                  id: selectedWithdrawJob.id,
                  title: selectedWithdrawJob.job.title,
                  company: selectedWithdrawJob.recruiter.company,
                });
                setAppliedJobs(prev => prev.filter(job => job.id !== selectedWithdrawJob.id));
                unmarkAppliedJobByDetails(selectedWithdrawJob);
                setSelectedWithdrawJob(null);
                setRefreshCounter(c => c + 1);
              } else {
                throw new Error(responseData?.message || "Failed to withdraw application");
              }
            } catch (err) {
              console.error("Failed to withdraw application:", err);
              const msg = (err as any)?.response?.data?.message || (err as any)?.message || "Failed to withdraw application";
              toast.error(msg);
            }
          }}
        />
      )}

      {/* Contact Info Modal */}
      {contactModalInfo.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setContactModalInfo(prev => ({ ...prev, isOpen: false }))}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-scaleIn p-6 flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
              {contactModalInfo.type === 'email' ? <FiMail size={32} /> : <FiPhone size={32} />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center">{contactModalInfo.name}</h3>
            <div className="w-full space-y-3 mt-2">
              {contactModalInfo.type === 'email' && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FiMail className="text-gray-500" size={20} />
                  <span className="text-sm font-medium text-gray-800 break-all">{contactModalInfo.email}</span>
                </div>
              )}
              {contactModalInfo.type === 'phone' && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FiPhone className="text-gray-500" size={20} />
                  <span className="text-sm font-medium text-gray-800">{contactModalInfo.phone}</span>
                </div>
              )}
            </div>
            <button onClick={() => setContactModalInfo(prev => ({ ...prev, isOpen: false }))} className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Subscription Popup */}
      {showSubscriptionPopup && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Subscription Required</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Buy a subscription to schedule a meeting with the recruiter.
              </p>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  onClick={() => setShowSubscriptionPopup(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                  onClick={() => {
                    setShowSubscriptionPopup(false);
                    router.push('/services');
                  }}
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
}

// Nearby Jobs Map View Component
function NearbyJobsMapView({ postings, radius, setRadius, onSave, onConnectRequest, onShowContact, onShowEmail, center }: {
  postings: EmployerPosting[],
  radius: number,
  setRadius: (val: number) => void,
  onSave: (job: EmployerPosting) => void,
  onConnectRequest: (e: React.MouseEvent, userId: number | undefined) => void,
  onShowContact: (e: React.MouseEvent, job: EmployerPosting) => void,
  onShowEmail: (e: React.MouseEvent, job: EmployerPosting) => void,
  center?: { lat: number; lng: number }
}) {
  const [revealedJobContacts, setRevealedJobContacts] = useState<Record<string, 'email' | 'contact' | 'both'>>({});

  const markRevealed = (jobId: string, type: 'email' | 'contact') => {
    setRevealedJobContacts(prev => {
      const current = prev[jobId];
      if (current === type || current === 'both') return prev;
      const next = type === 'email'
        ? (current === 'contact' ? 'both' : 'email')
        : (current === 'email' ? 'both' : 'contact');
      return { ...prev, [jobId]: next };
    });
  };
  const router = useRouter();

  const nearbyJobs = postings.map((job, idx) => ({
    ...job,
    distance: job.distance || [2.3, 5.7, 8.1][idx] || Math.random() * 10,
    lat: job.lat || (center?.lat || 28.6139) + (Math.random() - 0.5) * 0.1,
    lng: job.lng || (center?.lng || 77.209) + (Math.random() - 0.5) * 0.1,
  }));

  const filteredJobs = nearbyJobs.filter((job) => job.distance <= radius);

  const handleApply = (job: EmployerPosting & { distance: number }) => {
    router.push(`/profile/jobs/${job.id}`);
  };

  return (
    <Card className="p-0 overflow-hidden border border-[#E8E4FF] shadow-sm" noPadding>
      <style jsx global>{`
        .glass-purple-scrollbar {
          overflow-y: scroll !important;
          scrollbar-gutter: stable !important;
          scrollbar-width: auto;
          scrollbar-color: #9333EA #F3F4F6;
        }
        .glass-purple-scrollbar::-webkit-scrollbar {
          width: 14px !important;
          height: 14px !important;
          display: block !important;
        }
        .glass-purple-scrollbar::-webkit-scrollbar-track {
          background-color: #F3F4F6 !important;
          border-left: 1px solid #E5E7EB;
        }
        .glass-purple-scrollbar::-webkit-scrollbar-thumb {
          background-color: #9333EA !important;
          border: 3px solid #F3F4F6;
          border-radius: 10px;
        }
        .glass-purple-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #7E22CE;
        }
      `}</style>

      {/* Header */}
      <div className="p-4 pb-2 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Search Radius</span>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-32 md:w-48 h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-purple-600 hover:bg-gray-200 transition-all"
                />
                <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100 min-w-[60px] text-center shadow-sm">
                  {radius} km
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <p className="text-sm text-gray-500 font-medium mt-1">
              {filteredJobs.length} jobs within {radius}km
            </p>
          </div>
        </div>
      </div>

      {/* Map + Cards */}
      <div className="p-6 bg-gray-50/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2">
            <div className="sticky top-4">
              <div
                className="relative group cursor-pointer h-[340px] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100"
                onClick={() => router.push('/profile/jobs/nearby-map')}
              >
                <MapComponent
                  className="w-full h-full"
                  embedded={true}
                  radius={radius}
                  onRadiusChange={setRadius}
                  type="jobs"
                  center={center}
                  jobs={filteredJobs.map(job => ({
                    id: job.id,
                    lat: job.lat,
                    lng: job.lng,
                    title: job.position,
                    company: job.company,
                    salary: job.salary,
                    phone: job.contactPhone,
                    email: job.contactEmail,
                    posterName: job.posterName,
                    posterImage: job.posterImage,
                    distance: job.distance,
                    isOnline: job.isOnline
                  }))}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                    <span className="text-sm font-bold text-purple-700">Click to Expand</span>
                    <FiChevronRight className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="space-y-3 h-[400px] overflow-y-scroll glass-purple-scrollbar">
              {filteredJobs.length === 0 && (<p className="text-center text-gray-500">No Nearby jobs found</p>)}
              {filteredJobs.map((job) => {
                const cacheKey = job.postedDate || String(Date.now());
                const logoUrl = job.companyLogo?.startsWith('/') || job.companyLogo?.startsWith('http')
                  ? `${job.companyLogo}${job.companyLogo.includes('?') ? '&' : '?'}_t=${cacheKey}`
                  : null;
                return (
                <div
                  key={job.id}
                  onClick={() => router.push(`/profile/jobs/${job.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 flex flex-col p-5 cursor-pointer"
                >
                  {/* Top row: Logo + Info */}
                  <div className="flex gap-4">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                      {logoUrl ? (
                        <img src={logoUrl} alt={job.company} className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-xl font-bold text-gray-300">
                          {(job.company || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {job.position}
                      </h4>
                      <div className="my-2 border-t border-gray-100" />
                      <p className="text-xs font-medium text-gray-600 truncate">
                        {job.company}
                      </p>
                      {job.distanceDisplay && (
                        <p className="text-[10px] text-purple-500 font-medium mt-0.5 flex items-center gap-1">
                          <FiNavigation size={9} />
                          {job.distanceDisplay}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {[job.location, job.type, job.salary].filter(Boolean).join(" • ") || ""}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-around gap-1">
                    <PlatformActionButton
                      icon={FiBookmark}
                      label="Save"
                      showLabelBelow
                      isSaved={job.isSaved || job.is_saved}
                      onClick={(e) => { e.stopPropagation(); onSave(job); }}
                      size="sm"
                    />
                    <PlatformActionButton
                      icon={FiUserPlus}
                      label="Connect"
                      showLabelBelow
                      isRevealed={job.connection_status === 'connected'}
                      isLocked={job.connection_status === 'pending'}
                      disabled={!!(job.connection_status && job.connection_status !== 'not_connected')}
                      onClick={(e) => { e.stopPropagation(); onConnectRequest(e, job.contactUserId); }}
                      size="sm"
                    />
                    <PlatformActionButton
                      icon={FiMail}
                      label="Email"
                      showLabelBelow
                      isRevealed={revealedJobContacts[job.id] === 'email' || revealedJobContacts[job.id] === 'both'}
                      onClick={(e) => { e.stopPropagation(); markRevealed(job.id, 'email'); onShowEmail(e, job); }}
                      size="sm"
                    />
                    <PlatformActionButton
                      icon={FiPhone}
                      label="Contact"
                      showLabelBelow
                      isRevealed={revealedJobContacts[job.id] === 'contact' || revealedJobContacts[job.id] === 'both'}
                      onClick={(e) => { e.stopPropagation(); markRevealed(job.id, 'contact'); onShowContact(e, job); }}
                      size="sm"
                    />
                    {job.isApplied || job.is_applied ? (
                      <PlatformActionButton
                        icon={FiCheck}
                        label="Applied"
                        showLabelBelow
                        isLocked
                        size="sm"
                      />
                    ) : (
                      <PlatformActionButton
                        icon={FiSend}
                        label="Apply"
                        showLabelBelow
                        onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

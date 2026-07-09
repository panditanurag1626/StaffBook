"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiBriefcase,
  FiChevronRight,
  FiChevronLeft,
  FiArrowLeft,
  FiLoader,
  FiMail,
  FiPhone,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { connectionService } from "@/lib/api/services/connectionService";
import { sendNotificationToUser } from "@/lib/firebaseNotifications";
import { THEME } from "@/styles/theme";
import { formatSalaryLPA } from "@/lib/utils";
import Button from "@/components/shared/Button";
import { jobService } from "@/lib/api/services/jobService";
import { JobPost } from "@/lib/api/types";
import JobFilter from "@/components/shared/JobFilter";
import { useJobFilters } from "@/hooks/useJobFilters";
import FindJobCard from "@/components/shared/FindJobCard";

// Add custom styles for scrollbar
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .scrollbar-thin::-webkit-scrollbar {
      width: 8px;
    }
    .scrollbar-thin::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 10px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
  `;
  if (!document.head.querySelector('#custom-scrollbar-styles')) {
    style.id = 'custom-scrollbar-styles';
    document.head.appendChild(style);
  }
}
const categoryTitles: Record<string, string> = {
  recommended: "Recommended Jobs",
  "skills-match": "Jobs Matching Your Skills",
  recent: "Recently Posted Jobs",
};

const itemsPerPage = 9;

export default function JobCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const categoryTitle = categoryTitles[category] || "Jobs";
  const { user } = useAuth();

  // Contact Modal State & Handlers
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
      const apiError = error?.response?.data?.errors?.message?.[0] || error?.response?.data?.message || 'Failed to send connection request.';
      toast.error(apiError);
    }
  };

  // Format connection_status for display
  const formatConnStatus = (status?: string) => {
    if (status === 'connected') return 'Connected';
    if (!status || status === 'not_connected') return 'Connect';
    return 'Pending';
  };

  const handleShowEmployerContact = async (e: React.MouseEvent, p: any) => {
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

  const handleShowEmployerEmail = async (e: React.MouseEvent, p: any) => {
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

  // Layout and Pagination states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Utilize global shared Job Filters hook
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

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch jobs from API
  React.useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const filterParams: any = {
          expand: category === 'recommended' ? 'apply,save,skill,experience,educations' : 'apply,save',
          status: 'Active',
          location: appliedLocation.length > 0 ? appliedLocation.join(',') : undefined,
          work_mode: appliedWorkMode.length > 0 ? appliedWorkMode[0] : undefined,
          employment_type: appliedJobType.length > 0 ? appliedJobType[0] : undefined,
          min_salary: appliedSalaryRange[0] > 0 ? appliedSalaryRange[0] * 100000 : undefined,
          max_salary: appliedSalaryRange[1] < 50 ? appliedSalaryRange[1] * 100000 : undefined,
          min_experience: appliedExperienceRange[0] > 0 ? appliedExperienceRange[0] : undefined,
          max_experience: appliedExperienceRange[1] < 50 ? appliedExperienceRange[1] : undefined,
          page: currentPage,
          'per-page': itemsPerPage,
          keywords: appliedSearchQuery || undefined,
          ...(category === 'nearby' ? { max_distance: appliedRadiusValue || undefined } : {}),
        };

        if (filterParams.work_mode === "Work from office") filterParams.work_mode = "WFO";

        let response;
        if (category === 'recommended') {
          response = await jobService.getRecommendedJobs(filterParams);
        } else if (category === 'nearby') {
          response = await jobService.getNearbyJobs(filterParams);
        } else {
          response = await jobService.getRecentlyJobPostsWithFilters(filterParams);
        }

        if (response.data && response.data.items) {
          const activeJobs = response.data.items.filter((job: JobPost) => {
            const status = (job.status || '').toLowerCase();
            return status === 'active' || status === '';
          });
          const mappedJobs = activeJobs.map((job: JobPost) => ({
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
            distance_display: job.distance_display || `${job.distance?.toFixed(1) || '0.0'} km`,
            lat: job.latitude ? parseFloat(job.latitude) : 0,
            lng: job.longitude ? parseFloat(job.longitude) : 0,
            postedDate: String((job as any).created_at || (job as any).postedDate || (job as any).updated_at || job.posted_at || ''),
            skills: job.key_skills ? job.key_skills.split(',').map(s => s.trim()) : [],
            industry: "Technology",
            isSaved: job.is_saved,
            isApplied: job.is_applied,
            contactUserId: job.user?.id,
            contactEmail: job.user?.email || job.user?.employerDetails?.professional_email,
            contactPhone: job.user?.phone,
            connection_status: (job.user as any)?.connection_status || 'not_connected',
          }));
          setJobs(mappedJobs);

          if (response.data._meta) {
            setTotalPages(response.data._meta.pageCount || 1);
          } else if ((response.data as any).pagination) {
            setTotalPages((response.data as any).pagination.pageCount || 1);
          } else {
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categorized jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [
    category,
    appliedLocation,
    appliedWorkMode,
    appliedJobType,
    appliedSalaryRange,
    appliedExperienceRange,
    appliedSearchQuery,
    appliedRadiusValue,
    currentPage
  ]);

  const filteredJobs = jobs; // Filtered by API already
  const paginatedJobs = jobs; // Paginated by API already

  const handleSaveJob = async (jobId: string, isCurrentlySaved: boolean) => {
    try {
      const numericId = parseInt(jobId);
      if (isCurrentlySaved) {
        await jobService.unsaveJob(numericId);
      } else {
        await jobService.saveJob(numericId);
      }
      // Update local state
      setJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, isSaved: !isCurrentlySaved } : job
      ));
    } catch (err) {
      console.error("Failed to toggle save job:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f2ed] pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto pt-[80px] px-2 sm:px-4 lg:px-8">
        {/* Breadcrumb - outside flex for full width */}
        <nav className="flex items-center text-sm mb-6 mt-10" aria-label="Breadcrumb">
          <Link
            href="/profile/jobs?tab=browse"
            className="flex items-center text-[#666] hover:text-primary transition-colors"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Back to Jobs
          </Link>
          <FiChevronRight className="mx-2 text-gray-400" size={14} />
          <span className="text-[#222] font-medium">{categoryTitle}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#222] mb-2">
              {categoryTitle} <span className="text-gray-400 font-bold ml-1">({filteredJobs.length})</span>
            </h1>
          </div>
        </div>

        {/* Sidebar + Cards layout */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">

          {/* Sidebar column */}
          <div className="w-full lg:w-[280px] lg:min-w-[280px]">

            {/* Mobile: search always visible */}
            <div className="lg:hidden">
              <div className="flex flex-row gap-2 mb-3">
                <div className="flex-1 relative">
                  <FiSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search jobs by title, company, or keyword…"
                    value={filters.searchQuery}
                    onChange={(e) => setters.setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="w-full h-9 pl-10 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-xs text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={() => applyFilters()}
                  className="flex items-center gap-2 px-4 h-9 rounded-xl font-semibold text-xs transition-all duration-300 bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  Search
                </button>
              </div>
              {/* Mobile filter toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full py-3 px-4 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-between"
                >
                  <span>Filters</span>
                  <FiChevronRight size={16} className={`transition-transform ${showMobileFilters ? 'rotate-90' : ''}`} />
                </button>
              </div>
              {showMobileFilters && (
                <div className="mb-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-[#E8E4FF] overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                        <FiFilter size={12} className="text-purple-600" />
                        Filters
                        {helpers.activeFiltersCount > 0 && (
                          <span className="ml-auto bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {helpers.activeFiltersCount}
                          </span>
                        )}
                      </h3>
                    </div>
                    <JobFilter filters={filters} setters={setters} helpers={helpers} onApply={applyFilters} sidebar hideSearch />
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: sticky sidebar */}
            <div className="hidden lg:block lg:sticky lg:top-[100px] lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:overscroll-contain">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E8E4FF] overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                    <FiFilter size={12} className="text-purple-600" />
                    Filters
                    {helpers.activeFiltersCount > 0 && (
                      <span className="ml-auto bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {helpers.activeFiltersCount}
                      </span>
                    )}
                  </h3>
                </div>
                <JobFilter filters={filters} setters={setters} helpers={helpers} onApply={applyFilters} sidebar />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

            {/* Job Cards Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-[#E8E4FF]">
                  <FiLoader className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-500 font-medium italic">Finding jobs...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#E8E4FF]">
                  <FiBriefcase size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-[#222] mb-2">
                    No jobs found
                  </h3>
                  <p className="text-[#666] mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  <Button
                    onClick={() => {
                      helpers.clearAllFilters();
                      applyFilters({});
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginatedJobs.map((job) => (
                      <FindJobCard
                        key={job.id}
                        job={job}
                        onSave={() => handleSaveJob(job.id, job.isSaved)}
                        onConnect={(e) => handleConnectRequest(e, job.contactUserId)}
                        onShowEmail={(e) => handleShowEmployerEmail(e, job)}
                        onShowContact={(e) => handleShowEmployerContact(e, job)}
                        onApply={() => router.push(`/profile/jobs/${job.id}`)}
                        formatConnStatus={formatConnStatus}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {filteredJobs.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pb-8">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                          }`}
                      >
                        <FiChevronLeft size={20} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${currentPage === page
                            ? `${THEME.components.button.primary} shadow-md`
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                          }`}
                      >
                        <FiChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
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
    </div>
  );
}

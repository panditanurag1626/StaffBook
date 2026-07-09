"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiChevronRight,
  FiChevronLeft,
  FiArrowLeft,
  FiLoader,
  FiSearch,
  FiFileText,
  FiX,
} from "react-icons/fi";
import { THEME } from "@/styles/theme";
import ProfileLayout from "@/components/shared/ProfileLayout";
import CandidateCard from "@/components/shared/CandidateCard";
import CandidateFilter from "@/components/shared/CandidateFilter";
import { useCandidateFilters } from "@/hooks/useCandidateFilters";
import { jobService } from "@/lib/api/services/jobService";
import { Candidate } from "@/types/candidate";
import toast from "react-hot-toast";

const categoryTitles: Record<string, string> = {
  "ready-to-join": "Ready To Join Candidates",
  "same-skills": "Candidates Having Same Skills",
};

const itemsPerPage = 10;

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

export default function CandidateCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const categoryTitle = categoryTitles[category] || "Candidates";

  const { filters, setters, helpers } = useCandidateFilters();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isExcelDownloading, setIsExcelDownloading] = useState(false);

  const selectedJobId = typeof window !== 'undefined' ? localStorage.getItem('staffbook_selectedJobId') : null;

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = {
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

      let res: any;
      if (category === "ready-to-join") {
        res = await jobService.findCandidates(selectedJobId, currentPage, itemsPerPage, apiFilters);
      } else if (category === "same-skills") {
        res = await jobService.matchJobSkillsWithCandidates(selectedJobId, currentPage, itemsPerPage, apiFilters);
      }

      const data = res?.data?.data || res?.data || [];
      const pagination = res?.data?.pagination || res?.pagination || null;

      setCandidates(Array.isArray(data) ? data.map(mapApiCandidate) : []);
      if (pagination) {
        setTotalPages(pagination.total_pages || 1);
        setTotalCount(pagination.total || 0);
      } else {
        // Fallback if no pagination object but data is present
        setTotalCount(Array.isArray(data) ? data.length : 0);
        setTotalPages(1);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [category, currentPage, filters.searchQuery, selectedJobId]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchCandidates();
  };

  const handleDownloadResume = (name: string) => {
    // Basic download logic
    toast.success(`Downloading resume for ${name}`);
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
                {isExcelDownloading ? 'Processing...' : 'Download CSV'}
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

          {/* Breadcrumb */}
          <nav className="flex items-center text-sm mb-6 mt-10" aria-label="Breadcrumb">
            <Link
              href="/profile/find-candidates?tab=find-candidates"
              className="flex items-center text-[#666] hover:text-primary transition-colors"
            >
              <FiArrowLeft className="mr-2" size={16} />
              Back to Candidates
            </Link>
            <FiChevronRight className="mx-2 text-gray-400" size={14} />
            <span className="text-[#222] font-medium">{categoryTitle}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-lg md:text-2xl font-bold text-[#222] mb-2">
              {categoryTitle} <span className="text-gray-400 font-bold ml-1">({totalCount})</span>
            </h1>
          </div>

          {/* Filter Section */}
          <div className="mb-8">
            <CandidateFilter
              filters={filters}
              setters={setters}
              helpers={helpers}
              onApply={handleApplyFilters}
            />
          </div>

          {/* Candidate List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FiLoader className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic">Finding candidates...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-red-100">
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <FiSearch size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-[#222] mb-2">No candidates found</h3>
                <p className="text-[#666]">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {candidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onDownloadResume={handleDownloadResume}
                      actionAction="invite"
                      jobPostId={selectedJobId ? parseInt(selectedJobId) : undefined}
                      isSelected={selectedCandidates.includes(candidate.id)}
                      onSelectionChange={handleSelectCandidate}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pb-12">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                        }`}
                    >
                      <FiChevronLeft size={20} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${currentPage === page ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`w-10 h-10 rounded-lg border border-gray-200 transition-colors flex items-center justify-center ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
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
    </ProfileLayout>
  );
}

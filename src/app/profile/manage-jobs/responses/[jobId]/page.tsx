'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProfileLayout from '@/components/shared/ProfileLayout';
import { THEME } from '@/styles/theme';
import { FiArrowLeft, FiBriefcase, FiUsers, FiFilter, FiChevronDown, FiCheck, FiDownload, FiX, FiFileText } from 'react-icons/fi';
import CandidateCard from '@/components/shared/CandidateCard';
import { Candidate } from '@/types/candidate';
import { jobService } from '@/lib/api';
import toast from 'react-hot-toast';

// Map API applicant to Candidate type
const mapApplicantToCandidate = (applicant: any): Candidate => ({
  id: applicant.application_id.toString(),
  name: `${applicant.applicant.first_name} ${applicant.applicant.last_name}`,
  title: applicant.applicant.designation || applicant.applicant.tagline || 'Job Seeker',
  location: applicant.applicant.city || applicant.applicant.location || 'Location not specified',
  experience: applicant.applicant.total_experience || '0 years',
  skills: [], // Skills not provided in API response
  education: '', // Education not provided in API response
  image: applicant.applicant.picture || '/images/user_profile_placeholder.jpeg',
  lastActive: applicant.applied_at_formatted || '',
  isOnline: applicant.applicant.online === 1,
  email: applicant.applicant.email,
  phone: applicant.applicant.phone || '',
  resumeUrl: applicant.resume_url,
  coverLetter: applicant.cover_letter,
  screeningAnswers: applicant.screening_answers,
  appliedAt: applicant.applied_at_formatted,
  status: applicant.status_text,
  userId: applicant.applicant.id.toString(),
  distance_display: applicant.applicant.distance_display ?? applicant.applicant.distance_km ?? undefined,
  salary: applicant.applicant.expected_salary ?? applicant.applicant.preferred_salary,
  timeline: applicant.timeline || []
});

export default function JobResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [applicants, setApplicants] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [isExcelDownloading, setIsExcelDownloading] = useState(false);
  const [showExcelDropdown, setShowExcelDropdown] = useState(false);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  const excelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (excelDropdownRef.current && !excelDropdownRef.current.contains(event.target as Node)) {
        setShowExcelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      const response = await jobService.getJobApplicants(jobId);

      if (response.data && response.data.data) {
        const mappedApplicants = response.data.data.map(mapApplicantToCandidate);
        setApplicants(mappedApplicants);
        setJobDetails(response.data.job_details);
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch job applicants
  useEffect(() => {
    if (jobId) {
      fetchApplicants();
    }
  }, [jobId]);

  const jobTitle = jobDetails?.title || 'Job Posting';

  // Bulk action handlers
  const handleSelectCandidate = (candidateId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === applicants.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(applicants.map(c => c.id));
    }
  };

  const handleBulkShortlist = () => {
    console.log('Bulk shortlisting:', selectedCandidates);
    // TODO: Implement API call
    toast.success(`Shortlisted ${selectedCandidates.length} candidates`);
    setSelectedCandidates([]);
  };

  const handleBulkDownload = async () => {
    if (isBulkDownloading || selectedCandidates.length === 0) return;

    setIsBulkDownloading(true);
    try {
      // selectedCandidates hold applicant IDs (application_ids) mapped as strings
      const applicationIds = selectedCandidates.map(id => Number(id));

      const response = await jobService.downloadBulkResume(jobId, applicationIds);
      const data = (response as any).data || response;

      toast.success(data?.message || 'Bulk resume ZIP created successfully');

      const zipUrl = data?.data?.zip_download?.zip_file_url;
      if (zipUrl) {
        window.open(zipUrl, '_blank');
      }

      // Clear selection
      setSelectedCandidates([]);

      // Redirect to the downloads folder view page
      router.push(`/profile/find-candidates?tab=resumes`);
    } catch (error: any) {
      console.error('Bulk download error:', error);
      let errMsg = 'Failed to bulk download resumes';
      if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const handleExcelDownload = async (type: 'all' | 'selected') => {
    if (isExcelDownloading) return;
    if (type === 'selected' && selectedCandidates.length === 0) {
      toast.error('No candidates selected');
      return;
    }

    setIsExcelDownloading(true);
    try {
      let data;
      if (type === 'selected') {
        const applicationIds = selectedCandidates.map(id => Number(id));
        data = await jobService.downloadSelectedApplicantsExcel(jobId, applicationIds);
      } else {
        data = await jobService.downloadAllApplicantsExcel(jobId);
      }

      // Parse download url from response structure: data.data.data.download_url
      const downloadUrl = data?.data?.data?.download_url || 
                          data?.data?.download_url || 
                          data?.download_url || 
                          data?.data?.excel_file_url || 
                          data?.excel_file_url;

      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        toast.success(data?.message || 'Applicants Excel generated successfully');
      } else {
        toast.error(data?.message || 'Failed to generate Excel download link');
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
      <div className={`min-h-screen ${THEME.colors.background.page} pt-8 pb-20`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          {/* Bulk Action Bar - Floating */}
          {selectedCandidates.length > 0 && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
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
                    onClick={handleBulkDownload}
                    disabled={isBulkDownloading}
                    className={`px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-full transition-all duration-200 flex items-center gap-1.5 border hover:border-gray-300 ${isBulkDownloading ? 'opacity-50 cursor-not-allowed border-gray-200' : 'border-gray-200'}`}
                  >
                    <FiDownload size={14} />
                    {isBulkDownloading ? 'Processing...' : 'Download Resumes'}
                  </button>

                  <div className="relative" ref={excelDropdownRef}>
                    <button
                      onClick={() => setShowExcelDropdown(!showExcelDropdown)}
                      disabled={isExcelDownloading}
                      className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <FiFileText size={14} />
                      {isExcelDownloading ? 'Processing...' : 'Export Excel'}
                      <FiChevronDown size={12} className={`transition-transform duration-200 ${showExcelDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showExcelDropdown && (
                      <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => {
                            setShowExcelDropdown(false);
                            handleExcelDownload('selected');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                        >
                          <FiCheck size={14} className="text-purple-600" />
                          Download Selected ({selectedCandidates.length})
                        </button>
                        <button
                          onClick={() => {
                            setShowExcelDropdown(false);
                            handleExcelDownload('all');
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                        >
                          <FiUsers size={14} className="text-purple-600" />
                          Download All ({applicants.length})
                        </button>
                      </div>
                    )}
                  </div>

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

          {/* Header Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-purple-600 font-bold text-sm hover:text-purple-700 transition-colors group"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Manage Jobs
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-outfit">{jobTitle}</h1>
                <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
                  <FiUsers size={16} className="text-purple-400" />
                  {isLoading ? 'Loading...' : `Showing ${applicants.length} applicants who applied for this role`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="all">All Applicants</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                <FiFilter size={18} />
              </button> */}
            </div>
          </div>

          {/* Applicants List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (() => {
              const filteredApplicants = applicants.filter(candidate => {
                if (activeFilter === 'all') return true;
                if (activeFilter === 'shortlisted') {
                  return candidate.timeline?.some(t => t.status_code === 7 && (t.is_completed || t.is_current));
                }
                if (activeFilter === 'rejected') {
                  return candidate.timeline?.some(t => t.status_code === 11 && (t.is_completed || t.is_current));
                }
                return true;
              });

              return filteredApplicants.length > 0 ? (
                filteredApplicants.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isResponseView={true}
                    isSelected={selectedCandidates.includes(candidate.id)}
                    onSelectionChange={handleSelectCandidate}
                    jobPostId={jobId}
                    onStatusUpdate={async (candidateId, status) => {
                      try {
                        const statusCode = status === 'shortlisted' ? 7 : 11;
                        await jobService.updateApplicationStatus(candidateId, statusCode);
                        toast.success(`Candidate ${status === 'shortlisted' ? 'shortlisted' : 'rejected'} successfully`);
                        // Refresh the list to update timeline and stats
                        fetchApplicants();
                      } catch (err: any) {
                        console.error('Status update error:', err);
                        toast.error(err?.response?.data?.message || err?.message || 'Failed to update status');
                      }
                    }}
                    onDownloadResume={(name) => {
                      // Download actual resume from URL
                      if (candidate.resumeUrl) {
                        window.open(candidate.resumeUrl, '_blank');
                      } else {
                        toast.error('Resume not available');
                      }
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiUsers size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {activeFilter === 'all' ? 'No applicants yet' : `No ${activeFilter} applicants`}
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {activeFilter === 'all'
                      ? 'When candidates apply for this job, they will appear here.'
                      : `Try changing your filter to see more candidates.`}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

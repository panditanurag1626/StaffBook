'use client';

import React, { useState, useEffect, useRef } from 'react';
import { THEME } from '@/styles/theme';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiShare2,
  FiMoreHorizontal,
  FiPause,
  FiPlay,
  FiBriefcase,
  FiEye,
  FiDownload,
  FiFileText,
  FiUpload,
  FiX,
  FiCheck,
  FiCopy
} from 'react-icons/fi';
import { FaWhatsapp, FaLinkedinIn, FaFacebookF } from 'react-icons/fa';
import Link from 'next/link';
import { jobService } from '@/lib/api';
import toast from 'react-hot-toast';
import { getRelativeTime } from '@/lib/utils';
import Modal from '@/components/shared/Modal';

interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  locationType: 'Work from office' | 'Work from home' | 'Field job';
  paymentType: 'Fixed' | 'Fixed plus incentives' | 'Commission based';
  address?: string;
  lat?: number;
  lng?: number;
  companyLogo?: string;
  nationality?: string;
  education?: string;
  gender?: 'Male' | 'Female' | 'Both';
  ageCriteria?: 'Yes' | 'No';
  experienceType?: 'Fresher' | 'Experienced' | 'Any';
  englishLevel?: 'Basic' | 'Intermediate' | 'Advance';
  regionalLanguages?: string;
  skillsPreferences?: string;
  numPositions?: number;
  accommodationFood?: 'Yes' | 'No';
  interviewMethod?: 'Online Video Interview' | 'In-person Interview';
  applicationPreference?: 'Schedule Meeting' | 'Download CVs' | 'Both';
  postedDate: string;
  applicants: number;
  views: number;
  status: 'active' | 'paused' | 'closed';
  created_at: string
  total_view: number
  apply: number
  total_applicants: number
}

const mapApiJobToLocal = (apiJob: any): JobPost => ({
  id: apiJob.id.toString(),
  title: apiJob.job_title,
  company: apiJob.company_name,
  location: apiJob.city || apiJob.location || 'Remote',
  salary: `₹${Number(apiJob.min_salary).toLocaleString()} - ${Number(apiJob.max_salary).toLocaleString()}`,
  type: apiJob.employment_type,
  description: apiJob.job_description,
  locationType: apiJob.work_mode,
  paymentType: apiJob.salary_period,
  postedDate: apiJob.created_at,
  applicants: apiJob.apply || 0, // Using 'apply' count from response
  views: apiJob.views || 0, // Assuming views might come or default to 0
  status: apiJob.status.toLowerCase() === 'active' ? 'active' : (apiJob.status.toLowerCase() === 'closed' ? 'closed' : 'paused'),
  companyLogo: apiJob.company_logo_url,
  created_at: apiJob.created_at,
  total_view: apiJob.total_view,
  apply: apiJob.apply,
  total_applicants: apiJob.total_applicants
});

import { useAuth } from '@/context/AuthContext';

export default function ManageJobsContent() {
  const router = useRouter();
  const { user, isEmployer } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'closed'>('all');

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Share Dialog State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareJobUrl, setShareJobUrl] = useState('');
  const [shareJobTitle, setShareJobTitle] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  // Bulk Job State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [mediaZip, setMediaZip] = useState<File | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobService.getMyJobPosts(100000000, 'apply');
      if (response && response.data && Array.isArray(response.data.items)) {
        const mappedJobs = response.data.items.map(mapApiJobToLocal);
        const currentLogo = user?.employerDetails?.company_logo_url;
        if (currentLogo) {
          mappedJobs.forEach(job => { job.companyLogo = currentLogo; });
        }
        setJobs(mappedJobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // handleJobSubmit moved to create-job page

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      try {
        await jobService.deleteJob(id);
        // Refresh the jobs list after successful deletion
        await fetchJobs();
        setActiveMenuId(null);
      } catch (error: any) {
        console.error('Failed to delete job:', error);
        let errMsg = 'Failed to delete job posting';
        if (error?.response?.data?.data?.errors?.message?.[0]) {
          errMsg = error.response.data.data.errors.message[0];
        } else if (error?.response?.data?.message) {
          errMsg = error.response.data.message;
        } else if (error?.message) {
          errMsg = error.message;
        }
        toast.error(errMsg);
      }
    }
  };

  const handleToggleJobStatus = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    const newStatus = job.status === 'active' ? 'Closed' : 'Active';

    try {
      await jobService.updateJobStatus(id, newStatus);

      // Update local state directly without reloading
      setJobs(prevJobs => prevJobs.map(j =>
        j.id === id ? { ...j, status: newStatus.toLowerCase() as 'active' | 'paused' | 'closed' } : j
      ));

      setActiveMenuId(null);
      toast.success('Job status updated successfully');
    } catch (error: any) {
      console.error('Failed to update job status:', error);
      let errMsg = 'Failed to update job status';
      if (error?.response?.data?.data?.errors?.message?.[0]) {
        errMsg = error.response.data.data.errors.message[0];
      } else if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    }
  };

  const handleDownloadSample = async () => {
    try {
      setIsDownloadingSample(true);
      const response = await jobService.downloadJobPostExcel();
      if (response && response.data && response.data.downloadUrl) {
        // More reliable way to trigger download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.setAttribute('download', response.data.fileName || 'job_post_bulk_upload.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Sample template download started');
      } else {
        toast.error('Failed to get download URL');
      }
    } catch (error: any) {
      console.error('Sample download error:', error);
      let errMsg = 'Failed to download sample';
      if (error?.response?.data?.data?.errors?.message?.[0]) {
        errMsg = error.response.data.data.errors.message[0];
      } else if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setIsDownloadingSample(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!excelFile) {
      toast.error('Please select an Excel file');
      return;
    }

    try {
      setIsBulkUploading(true);
      const response = await jobService.uploadBulkJobs(excelFile, mediaZip as File);
      if (response && (response.status === 200 || response.status === 201)) {
        toast.success(response.message || 'Bulk jobs uploaded successfully');
        setShowBulkModal(false);
        setExcelFile(null);
        setMediaZip(null);
        fetchJobs(); // Refresh the list
      } else {
        toast.error(response?.message || 'Failed to upload bulk jobs');
      }
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      let errMsg = 'Failed to upload bulk jobs';
      if (error?.response?.data?.data?.errors?.message?.[0]) {
        errMsg = error.response.data.data.errors.message[0];
      } else if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleEditJob = (job: JobPost) => {
    router.push(`/profile/create-job?id=${job.id}`);
  };

  const handleShare = (job: JobPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/profile/jobs/${job.id}`;
    setShareJobUrl(url);
    setShareJobTitle(job.title);
    setShareCopied(false);
    setShowShareModal(true);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareJobUrl);
    setShareCopied(true);
    toast.success('Link copied to clipboard!');
  };

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    totalApplicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
    totalViews: jobs.reduce((sum, j) => sum + j.views, 0),
  };

  return (
    <div className="space-y-6">


      {/* Header and Stats */}
      <div className="mt-8 space-y-6">
        <div className="flex justify-between items-end">
          {/* <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 font-outfit">Manage Job Posts</h2>
            <p className="text-gray-500 text-sm font-medium">Tracking performance and applicants</p>
          </div> */}
        </div>

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-14 h-14 bg-[#faf5ff] rounded-xl flex items-center justify-center">
              <FiUsers size={22} className="text-[#9333ea]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a] leading-none mb-1 text-nowrap">{stats.totalApplicants}</p>
              <p className="text-xs font-semibold text-[#64748b]">Applicants</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-14 h-14 bg-[#fff7ed] rounded-xl flex items-center justify-center">
              <FiEye size={22} className="text-[#ea580c]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a] leading-none mb-1 text-nowrap">{stats.totalViews}</p>
              <p className="text-xs font-semibold text-[#64748b]">Total Views</p>
            </div>
          </div>
        </div> */}

        {/* Filter Tabs with Counts */}
        {/* <div className="flex gap-2 bg-gray-50 p-2 rounded-2xl w-fit">
  <button
    onClick={() => setFilterStatus('all')}
    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
      filterStatus === 'all'
        ? 'bg-white text-purple-700 shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
    }`}
  >
    All ({stats.total})
  </button>
  <button
    onClick={() => setFilterStatus('active')}
    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
      filterStatus === 'active'
        ? 'bg-white text-purple-700 shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
    }`}
  >
    Active ({stats.active})
  </button>
  <button
    onClick={() => setFilterStatus('paused')}
    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
      filterStatus === 'paused'
        ? 'bg-white text-purple-700 shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
    }`}
  >
    Paused ({stats.paused})
  </button>
  <button
    onClick={() => setFilterStatus('closed')}
    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
      filterStatus === 'closed'
        ? 'bg-white text-purple-700 shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
    }`}
  >
    Closed (0)
  </button>
</div> */}
      </div>


      {/* Search Bar Section - Removed as per requirement */}
      {/* <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        </div>
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent block pl-12 pr-4 py-2.5 shadow-sm hover:border-gray-300 transition-all outline-none placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        )}
      </div> */}
      {/* Top Section with Background - Commented out as per requirement */}
      {/* <div className="rounded-3xl overflow-hidden shadow-lg bg-white mb-8 mt-8 border border-gray-100 flex flex-col">
        <div className="relative h-48 md:h-52 w-full shrink-0 rounded-t-3xl overflow-hidden">
          <img
            src="/homePage/post-job-cover.png"
            alt="Post a job"
            className="w-full h-full object-cover object-center rounded-t-3xl"
          />
        </div>

        <div className="bg-[#ea580c] px-8 py-4 md:px-10 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-white/90 text-sm md:text-base font-medium mb-1">New To Staff book?</h3>
          </div>

          <div className="relative z-10">
            <Button
              onClick={() => {
                router.push('/profile/create-job');
              }}
              className="bg-white text-purple-700 hover:bg-purple-50 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Post a free job
            </Button>
          </div>
        </div>
      </div > */}

      {/* Jobs List - Grid Layout */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Post a Job Card (1st Position) */}
          <div
            onClick={() => {
              if (isEmployer && user?.user_balance_employer) {
                const balance = user.user_balance_employer.job_posting_total;
                const unlimited = user.user_balance_employer.job_posting_unlimited;
                if (balance === 0 && !unlimited) {
                  toast.error("You don't have job posts available. Please upgrade your plan.");
                  return;
                }
              }
              router.push('/profile/create-job');
            }}
            className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-center items-center cursor-pointer min-h-[120px] md:min-h-[220px] border-dashed border-2 hover:border-purple-200 group h-full"
          >
            <div className="w-8 h-8 rounded-full bg-[#f2efff] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <FiPlus size={18} className="text-[#7c3aed]" />
            </div>
            <span className="text-[10px] font-bold text-[#7c3aed]">Post a Single Job</span>
          </div>
          <div
            onClick={() => {
              setShowBulkModal(true);
            }}
            className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-center items-center cursor-pointer min-h-[120px] md:min-h-[220px] border-dashed border-2 hover:border-purple-200 group h-full"
          >
            <div className="w-8 h-8 rounded-full bg-[#f2efff] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <FiUpload size={18} className="text-[#7c3aed]" />
            </div>
            <span className="text-[10px] font-bold text-[#7c3aed]">Post Bulk Jobs</span>
          </div>

          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between min-h-[220px] h-full"
            >
              <div>
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[#1a1a1a] leading-tight line-clamp-2 mb-1">{job.title}</h3>
                    <p className="text-xs font-semibold text-[#64748b] truncate">{job.company}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <FiBriefcase size={10} /> {job.location} ({job.locationType})
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleShare(job, e)}
                      className="p-1.5 text-[#8b2cf5] hover:bg-gray-50 rounded-full transition-colors"
                    >
                      <FiShare2 size={16} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === job.id ? null : job.id);
                        }}
                        className={`p-1.5 rounded-full transition-all duration-300 ${activeMenuId === job.id ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:bg-gray-50'
                          }`}
                      >
                        <FiMoreHorizontal size={18} />
                      </button>

                      {activeMenuId === job.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] py-2 overflow-hidden transition-all duration-200"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditJob(job);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[10px] font-black text-[#1a1a1a] uppercase tracking-widest hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                          >
                            <FiEdit3 size={14} className="text-[#8b2cf5]" />
                            Edit post
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/profile/jobs/${job.id}?preview=true`, '_blank');
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[10px] font-black text-[#1a1a1a] uppercase tracking-widest hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                          >
                            <FiEye size={14} className="text-[#8b2cf5]" />
                            Preview Job
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleJobStatus(job.id);
                            }}
                            className={`w-full px-4 py-2.5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${job.status === 'active'
                              ? 'text-orange-500 hover:bg-orange-50'
                              : 'text-green-500 hover:bg-green-50'
                              }`}
                          >
                            {job.status === 'active' ? (
                              <>
                                <FiPause size={14} />
                                Pause Post
                              </>
                            ) : (
                              <>
                                <FiPlay size={14} />
                                Reactivate Post
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(job.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-colors text-left"
                          >
                            <FiTrash2 size={14} />
                            Delete Post
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date Posted */}
                <p className="text-[11px] font-bold text-[#8b2cf5] mb-3">
                  Posted {getRelativeTime(job.created_at)}
                </p>

                {/* Status Section */}
                <div className="flex flex-col gap-2 mb-4 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
                      }`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${job.status === 'active' ? 'text-[#22c55e]' : 'text-[#ef4444]'
                      }`}>
                      Status : {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 flex-1">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(job.views, 100)}%` }}></div>
                    </div>
                  </div>


                  {/* Total Views Section */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#7e22ce]" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#8b2cf5]">
                      Total Views : {job.total_view}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Responses Button */}
              <div className="flex justify-center mt-2">
                {/* View Responses Button */}
                <Link
                  href={`/profile/manage-jobs/responses/${job.id}`}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="mt-3 py-1.5 px-4 rounded-full border border-purple-200 bg-white flex items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all active:scale-95 group/link shadow-sm"
                >
                  <span className="text-[10px] font-black text-purple-600 tracking-widest text-nowrap">View Applications </span>
                  <span className="text-[10px] font-black text-purple-500 bg-gray-50/80 px-1.5 py-0.5 rounded-md min-w-[20px] text-center border border-purple-50/50">
                    ({job.total_applicants})
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {
        filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <FiBriefcase size={40} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 font-outfit">No job posts found</h3>
            <p className="text-[#64748b] text-xs mb-6 px-4">Start by creating your first job posting to attract candidates.</p>
            <Button
              onClick={() => router.push('/profile/create-job')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8b2cf5] text-white rounded-xl shadow-md text-xs font-bold"
            >
              <FiPlus size={18} />
              Post New Job
            </Button>
          </div>
        )
      }

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          />
          <div
            className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Share Job</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  name: "WhatsApp",
                  icon: <FaWhatsapp size={20} />,
                  color: "bg-[#25D366]",
                  url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this job: ${shareJobTitle} - ${shareJobUrl}`)}`
                },
                {
                  name: "LinkedIn",
                  icon: <FaLinkedinIn size={20} />,
                  color: "bg-[#0077B5]",
                  url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareJobUrl)}`
                },
                {
                  name: "Facebook",
                  icon: <FaFacebookF size={20} />,
                  color: "bg-[#1877F2]",
                  url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareJobUrl)}`
                }
              ].map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-12 h-12 ${option.color} text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    {option.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                    {option.name}
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Or copy link</p>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={shareJobUrl}
                  className="flex-1 bg-transparent text-xs text-gray-500 outline-none truncate px-1"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {shareCopied ? "COPIED" : "COPY"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Job Modal */}
      <Modal open={showBulkModal} onClose={() => !isBulkUploading && setShowBulkModal(false)}>
        <div className="p-10">
          <div className="mb-6 space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Bulk Job Upload</h3>
            <p className="text-sm text-gray-500">Upload multiple job
              postings using an Excel file
              and optional media ZIP.</p>
          </div>

          <div className="space-y-6">
            {/* Download Sample Button */}
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm">
                  <FiFileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Need a sample template?</p>
                  <p className="text-[11px] text-gray-500">Download the sample Excel to get started.</p>
                </div>
              </div>
              <button
                onClick={handleDownloadSample}
                disabled={isDownloadingSample}
                className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-bold text-xs border border-purple-100 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isDownloadingSample ? '...' : <><FiDownload size={14} /> Download Template</>}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Excel File Input */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Excel File (.xlsx)*</label>
                <div className={`relative group transition-all duration-300 ${excelFile ? 'border-purple-500 bg-purple-50/30' : 'border-gray-200 bg-gray-50'
                  } border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300 h-[140px]`}>
                  {excelFile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExcelFile(null);
                      }}
                      className="absolute top-3 right-3 z-20 p-1.5 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100 group-hover:scale-110 active:scale-95"
                      title="Remove file"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${excelFile ? 'bg-purple-600 text-white' : 'bg-white text-gray-400'}`}>
                    {excelFile ? <FiCheck size={20} /> : <FiFileText size={20} />}
                  </div>
                  <p className="text-xs font-bold text-gray-700 truncate w-full px-2">
                    {excelFile ? `Uploaded: ${excelFile.name}` : 'Upload Media ZIP'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Supported formats: .xlsx,
                    .xls</p>
                </div>
              </div>

              {/* Media ZIP Input */}
              {/* <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Media ZIP (.zip)</label>
                <div className={`relative group transition-all duration-300 ${mediaZip ? 'border-purple-500 bg-purple-50/30' : 'border-gray-200 bg-gray-50'
                  } border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300 h-[140px]`}>
                  <input
                    type="file"
                    accept=".zip"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setMediaZip(e.target.files?.[0] || null)}
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${mediaZip ? 'bg-purple-600 text-white' : 'bg-white text-gray-400'}`}>
                    {mediaZip ? <FiCheck size={20} /> : <FiFileText size={20} />}
                  </div>
                  <p className="text-xs font-bold text-gray-700 truncate w-full px-2">
                    {mediaZip ? mediaZip.name : 'Click to upload ZIP'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Candidate pictures, company logos, etc.</p>
                </div>
              </div> */}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-12"
                onClick={() => setShowBulkModal(false)}
                disabled={isBulkUploading}
              >
                Cancel Upload
              </Button>
              <Button
                className="flex-1 rounded-xl h-12 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
                onClick={handleBulkUpload}
                isLoading={isBulkUploading}
                disabled={!excelFile || isBulkUploading}
              >
                Import Jobs
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

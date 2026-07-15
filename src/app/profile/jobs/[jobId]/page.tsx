"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ApplyJobModal from "@/components/jobs/ApplyJobModal";
import { useAuth } from "@/context/AuthContext";
import { sendNotificationToUser } from "@/lib/firebaseNotifications";
import Link from "next/link";
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
  FiPhone,
  FiMail,
  FiLoader,
  FiX,
  FiShare2,
  FiCopy,
  FiSend,
  FiImage,
  FiCheck,
} from "react-icons/fi";
import { FaLinkedinIn, FaWhatsapp, FaFacebookF, FaRupeeSign } from "react-icons/fa";
import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import PlatformActionButton from "@/components/shared/PlatformActionButton";
import { THEME } from "@/styles/theme";
import { jobService } from "@/lib/api/services/jobService";
import { JobPost } from "@/lib/api/types";
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Image from "next/image";
import { formatSalaryLPA } from "@/lib/utils";

// Mock data removed in favor of API

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const queryParamPreviewBoolean = typeof window !== 'undefined' ? window.location.search.includes('preview=true') : false;

  const [job, setJob] = useState<JobPost | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showContactLoading, setShowContactLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showEmailLoading, setShowEmailLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await jobService.viewJobPost(jobId);
        if (response.data && response.data.jobpost) {
          const jobData = response.data.jobpost;
          const jobStatus = (jobData.status || '').toLowerCase();
          if (jobStatus !== 'active' && jobStatus !== '') {
            setError("This job is no longer accessible.");
            setJob(null);
          } else {
            setJob(jobData);
            setIsSaved(jobData.is_saved || false);
          }
        } else {
          setError("Job not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleToggleSave = async () => {
    if (!job || toggleLoading) return;

    try {
      setToggleLoading(true);
      if (isSaved) {
        await jobService.unsaveJob(job.id);
      } else {
        await jobService.saveJob(job.id);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Failed to toggle save job:", err);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleApplyJob = async (formData: FormData) => {
    try {
      const response = await jobService.applyJob(formData);
      const resData = response as any;

      // Check if the response actually succeeded
      const isSuccess = resData.success === true || resData.data?.success === true || resData.status === 1 || resData.status === 201;

      if (isSuccess && resData.success !== false && resData.data?.success !== false) {
        const targetUserId = job?.user_id || job?.user?.id;
        if (user && targetUserId) {
          await sendNotificationToUser(
            Number(targetUserId),
            Number(user.id),
            `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'A user',
            user.picture || '',
            'job_application',
            `${user.first_name || ''} ${user.last_name || ''}`.trim() + ` applied to your job post: ${job.job_title}.`,
            job.id,
            {
              jobId: job.id,
              jobTitle: job.job_title || job.jobtitle || 'A job',
              jobLocation: job.location || job.city || '',
              applicantId: user.id,
              applicantName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
              applicantAvatar: user.picture || '',
              employerId: targetUserId
            }
          );
        }
      } else {
        let errorMessage = resData.message || "Failed to apply for job";
        const errorsObj = resData.data?.errors || resData.errors;
        if (errorsObj) {
          const firstErrorKey = Object.keys(errorsObj)[0];
          if (firstErrorKey && Array.isArray(errorsObj[firstErrorKey])) {
            errorMessage = errorsObj[firstErrorKey][0];
          }
        }
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("Apply job error:", err);
      throw err;
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShowContactDetails = async () => {
    if (showContact) {
      setShowContact(false);
      return;
    }
    if (!job) return;

    try {
      setShowContactLoading(true);
      const resp = await jobService.getEmployerContactDetails(job.id);
      const data = (resp as any);
      const isSuccess = data?.status === 200 ||
        data?.status === 201 ||
        data?.data?.already_unlocked ||
        data?.data?.data?.already_unlocked ||
        data?.data?.credit_consumed ||
        data?.data?.data?.credit_consumed;
      if (isSuccess) {
        toast.success(data?.message || 'Contact unlocked');
        setShowContact(true);
      } else {
        throw new Error(data?.message || "Failed to reveal contact");
      }
    } catch (err: any) {
      console.error('Show contact error:', err);
      let errMsg = err?.response?.data?.data?.errors?.message?.[0] || err?.response?.data?.message || err.message || 'Failed to reveal contact';
      toast.error(errMsg);
    } finally {
      setShowContactLoading(false);
    }
  };

  const handleShowEmailDetails = async () => {
    if (showEmail) {
      setShowEmail(false);
      return;
    }
    if (!job) return;

    try {
      setShowEmailLoading(true);
      const resp = await jobService.getEmployerEmailDetails(job.id);
      const data = (resp as any);
      const isSuccess = data?.status === 200 ||
        data?.status === 201 ||
        data?.data?.already_unlocked ||
        data?.data?.data?.already_unlocked ||
        data?.data?.credit_consumed ||
        data?.data?.data?.credit_consumed;
      if (isSuccess) {
        toast.success(data?.message || 'Email unlocked');
        setShowEmail(true);
      } else {
        throw new Error(data?.message || "Failed to reveal email");
      }
    } catch (err: any) {
      console.error('Show email error:', err);
      let errMsg = err?.response?.data?.data?.errors?.message?.[0] || err?.response?.data?.message || err.message || 'Failed to reveal email';
      toast.error(errMsg);
    } finally {
      setShowEmailLoading(false);
    }
  };

  const jobUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = job ? `Check out this ${job.job_title} job at ${job.company_name} on Staffbook!` : 'Check out this job on Staffbook!';

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={20} />,
      color: "bg-[#25D366]",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + jobUrl)}`
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn size={20} />,
      color: "bg-[#0077B5]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`
    },
    {
      name: "Facebook",
      icon: <FaFacebookF size={20} />,
      color: "bg-[#1877F2]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FD]">
        <FiLoader className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium italic">Finding job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBriefcase size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#222] mb-2">{error || "Job Not Found"}</h1>
          <p className="text-gray-500 text-sm mb-6">The job post you are looking for might have been removed or is no longer available.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = job.created_at ? formatDistanceToNow(new Date(job.created_at.replace(/-/g, '/')), { addSuffix: true }) : 'Recent';
  const salaryText = job.min_salary ? `${formatSalaryLPA(job.min_salary)} - ${formatSalaryLPA(job.max_salary)}` : 'Competitive';
  const skills = job.key_skills ? job.key_skills.split(',').map(s => s.trim()) : [];

  return (
    <div className="min-h-screen p-2 md:p-4 lg:p-8 mt-[60px]">
      <div className="w-full px-1 md:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#666] hover:text-primary transition-colors"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Back to Jobs
          </button>
          <FiChevronRight className="mx-2 text-gray-400" size={14} />
          <span className="text-[#222] font-medium">{job.job_title}</span>
        </nav>

        {/* Main Layout - 3 Column on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Job Summary (Sticky) */}
          <div className="lg:col-span-3 order-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Company Logo */}
              <Card className="p-0 overflow-hidden rounded-xl">
                {(() => {
                  const logoUrl = job.user?.employerDetails?.company_logo_url || job.companyLogoUrl || job.company_logo_url || job.user?.picture || job.user?.image || null;
                  return (
                    <div className="w-full h-36 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-gray-50 relative flex items-center justify-center">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={job.company_name ?? "Company Logo"}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/50">
                          <FiImage size={28} className="text-purple-300" />
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="p-4">
                  <h3 className={`text-sm font-semibold ${THEME.colors.text.heading} text-center`}>
                    {job.company_name}
                  </h3>
                </div>
              </Card>

              {/* Quick Info */}
              {/* Quick Info */}
              <Card className="p-6 space-y-4">
                <h4 className={`text-sm font-semibold ${THEME.colors.text.heading} mb-4`}>Job Details</h4>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FaRupeeSign className="text-purple-600" size={10} />
                    </span>
                    <div>
                      <p className={THEME.colors.text.body}>Salary</p>
                      <p className={THEME.colors.text.heading}>{salaryText}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiMapPin className="text-purple-600" size={10} />
                    </span>
                    <div>
                      <p className={THEME.colors.text.body}>Location</p>
                      <p className={THEME.colors.text.heading}>{job.full_address}</p>
                    </div>
                  </div>

                  {job.distance_display && (
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FiNavigation className="text-purple-600" size={10} />
                      </span>
                      <div>
                        <p className={THEME.colors.text.body}>Distance</p>
                        <p className={THEME.colors.text.heading}>
                          {job.distance_display} km away
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiBriefcase className="text-purple-600" size={10} />
                    </span>
                    <div>
                      <p className={THEME.colors.text.body}>Job Type</p>
                      <p className={THEME.colors.text.heading}>{job.employment_type}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiClock className="text-purple-600" size={10} />
                    </span>
                    <div>
                      <p className={THEME.colors.text.body}>Posted</p>
                      <p className={THEME.colors.text.heading}>{formattedDate}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Center Column - Job Description */}
          {/* Center Column - Job Description */}
          <div className="lg:col-span-6 order-2">
            <Card className="p-8">
              <h1 className={`text-sm font-semibold ${THEME.colors.text.heading} mb-2`}>
                {job.job_title}
              </h1>
              <div className={`flex items-center gap-4 text-sm ${THEME.colors.text.body} mb-6`}>
                <span className="flex items-center gap-1">
                  <FiBriefcase size={14} />
                  {job.work_mode}
                </span>
                <span className="flex items-center gap-1">
                  <FiUser size={14} />
                  {job.min_experience_years || 0} - {job.max_experience_years || 1} years
                </span>
                {job.notice_period && (
                  <span className="flex items-center gap-1">
                    <FiClock size={14} />
                    {job.notice_period}
                  </span>
                )}
                {job.employment_type && (
                  <span className="flex items-center gap-1">
                    <FiBriefcase size={14} />
                    {job.employment_type}
                  </span>
                )}
              </div>

              {/* Job Description */}
              <section className="mb-8">
                <h2 className={`text-sm font-semibold ${THEME.colors.text.heading} mb-4`}>
                  Job Description
                </h2>
                <p className={`${THEME.colors.text.body} text-sm leading-relaxed whitespace-pre-line`}>
                  {job.job_description}
                </p>
              </section>

              {/* Skills */}
              {skills.length > 0 && (
                <section className="mb-8">
                  <h2 className={`text-sm font-semibold ${THEME.colors.text.heading} mb-4`}>
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm border border-purple-100 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Screening Questions */}
              {job.screening_questions && (() => {
                const allQuestions: string[] = Array.isArray(job.screening_questions)
                  ? job.screening_questions
                  : JSON.parse((job.screening_questions as any) || "[]");
                const visibleQuestions = showAllQuestions ? allQuestions : allQuestions.slice(0, 4);
                const hasMore = allQuestions.length > 4;

                return (
                  <section className="mb-8">
                    <h2 className={`text-sm font-semibold ${THEME.colors.text.heading} mb-4`}>
                      Screening Questions
                    </h2>
                    <ul className="space-y-4">
                      {visibleQuestions.map((item: string, index: number) => (
                        <li key={index} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                          <span className="font-bold text-gray-400">Q{index + 1}:</span>
                          <span className={THEME.colors.text.body}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {hasMore && (
                      <button
                        onClick={() => setShowAllQuestions(prev => !prev)}
                        className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        {showAllQuestions ? 'See Less' : `See More (${allQuestions.length - 4} more)`}
                      </button>
                    )}
                  </section>
                );
              })()}

              {/* Removal of mock-heavy sections like static Requirements/Benefits as they aren't in API yet or combined in description */}

              {/* Company Info */}
              <section className={`bg-gradient-to-br ${THEME.colors.gradient.light} rounded-xl p-6`}>
                <h2 className={`text-sm font-semibold ${THEME.colors.text.heading} mb-4`}>
                  About {job.company_name}
                </h2>
                <p className={`${THEME.colors.text.body} text-sm mb-4`}>{job.user?.employerDetails?.about_company || `Join ${job.company_name ?? "this company"} for an exciting career opportunity where you can grow and excel in your field.`}</p>
              </section>
            </Card>
          </div>

          {/* Right Column - Call to Action (Sticky) */}
          <div className="lg:col-span-3 order-3">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Job Reel */}
              {job.reelUrl && (
                <Card className="overflow-hidden rounded-2xl bg-black">
                  <div className="relative w-full" style={{ aspectRatio: '9/16', maxHeight: 'calc(100vh - 120px)' }}>
                    <video
                      src={job.reelUrl}
                      className="w-full h-full object-cover rounded-2xl"
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                </Card>
              )}

              {/* Posted By + Actions */}
              <Card className="p-6">
                <h4 className={`text-sm font-semibold ${THEME.colors.text.heading} mb-4`}>Posted By</h4>
                <div className="flex items-center gap-3 mb-4">
                  <Link href={`/user/${job.user?.id}`} className="w-12 h-12 rounded-full overflow-hidden bg-purple-100 border-2 border-purple-200 hover:opacity-80 transition-opacity flex-shrink-0">
                    {job.user?.picture ? (
                      <img
                        src={job.user.picture}
                        alt={job.posted_by_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold">
                        {job.posted_by_name?.charAt(0)}
                      </div>
                    )}
                  </Link>
                  <Link href={`/user/${job.user?.id}`} className="hover:text-purple-600 transition-colors">
                    <p className={`text-sm font-semibold ${THEME.colors.text.heading}`}>{job.posted_by_name || "Recruiter"}</p>
                    <p className={`text-sm ${THEME.colors.text.body}`}>{job.user?.employerDetails?.designation || job.user?.designation || "Hiring Manager"}</p>
                  </Link>
                </div>
                {!queryParamPreviewBoolean && (
                  <div className="flex items-center justify-between gap-1 pt-4 border-t border-gray-100">
                    <PlatformActionButton
                      icon={FiPhone}
                      label="Contact"
                      onClick={handleShowContactDetails}
                      isLoading={showContactLoading}
                      showLabelBelow
                      size="sm"
                      isRevealed={showContact}
                    />
                    <PlatformActionButton
                      icon={FiMail}
                      label="Email"
                      onClick={handleShowEmailDetails}
                      isLoading={showEmailLoading}
                      showLabelBelow
                      size="sm"
                      isRevealed={showEmail}
                    />
                    <PlatformActionButton
                      icon={FiBookmark}
                      label="Save"
                      onClick={handleToggleSave}
                      isSaved={isSaved}
                      isLoading={toggleLoading}
                      showLabelBelow
                      size="sm"
                    />
                    <PlatformActionButton
                      icon={FiSend}
                      label="Apply"
                      onClick={() => setShowApplyModal(true)}
                      disabled={job.is_applied}
                      isRevealed={job.is_applied}
                      showLabelBelow
                      size="sm"
                    />
                  </div>
                )}
              </Card>
              {/* Share */}
              <Card className="p-4">
                <p className={`text-sm ${THEME.colors.text.body} mb-2`}>Share this job</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLink}
                    className="flex-1 px-3 py-2 bg-light-bg hover:bg-[#E5E3FF] rounded-lg text-xs font-medium text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <FiCheckCircle className="text-green-500" /> : <FiCopy />}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button
                    onClick={() => setShowShareModal(true)}
                    className="flex-1 px-3 py-2 bg-light-bg hover:bg-[#E5E3FF] rounded-lg text-xs font-medium text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <FiShare2 />
                    Share
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          />
          <Card className="relative w-full max-w-sm p-6 animate-scaleIn">
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
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    window.open(option.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className={`w-12 h-12 ${option.color} text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    {option.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                    {option.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Or copy link</p>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={jobUrl}
                  className="flex-1 bg-transparent text-xs text-gray-500 outline-none truncate px-1"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Apply Job Modal */}
      {job && (
        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          jobId={job.id.toString()}
          jobTitle={job.job_title || "Job"}
          screeningQuestions={job.screening_questions || []}
          onSubmit={handleApplyJob}
        />
      )}
    </div>
  );
}

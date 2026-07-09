'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Clock, Users, Building2, Bookmark, BookmarkCheck, Send } from 'lucide-react';
import { jobService, type JobPost } from '@/lib/api';
import ApplyJobModal from "@/components/jobs/ApplyJobModal";
import ProfileLayout from '@/components/shared/ProfileLayout';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { sendNotificationToUser } from '@/lib/firebaseNotifications';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { user } = useAuth();

  const [job, setJob] = useState<JobPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({
    described: '',
    file: null as File | null
  });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await jobService.getJobPost(Number(jobId));

      if (response.status === 200) {
        const jobData = response.data.job_post;
        const jobStatus = (jobData.status || '').toLowerCase();
        if (jobStatus !== 'active' && jobStatus !== '') {
          setError("This job is no longer accessible.");
          setJob(null);
        } else {
          setJob(jobData);
          setIsSaved(jobData.is_saved || false);
        }
      }
    } catch (err: any) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async () => {
    if (!job) return;

    try {
      if (isSaved) {
        await jobService.unsaveJobPost(job.id);
        setIsSaved(false);
      } else {
        await jobService.saveJobPost(job.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error saving job:', err);
      toast.error('Failed to save job');
    }
  };

  const handleApplyJob = async (formData: FormData) => {
    try {
      setIsApplying(true);
      await jobService.applyJob(formData);

      const targetUserId = job?.user_id || job?.user?.id;
      if (user && targetUserId) {
        await sendNotificationToUser(
          Number(targetUserId),
          Number(user.id),
          `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'A user',
          user.picture || '',
          'job_application',
          `${user.first_name || ''} ${user.last_name || ''}`.trim() + ` applied to your job post: ${job.jobtitle || 'a job'}.`,
          job.id,
          {
            jobId: job.id,
            jobTitle: job.jobtitle || 'A job',
            jobLocation: job.city || '',
            applicantId: user.id,
            applicantName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            applicantAvatar: user.picture || '',
            employerId: targetUserId
          }
        );
      }
    } catch (err) {
      console.error('Error applying:', err);
      throw err;
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </ProfileLayout>
    );
  }

  if (error || !job) {
    return (
      <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Job not found'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Jobs</span>
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.jobtitle}</h1>
              <p className="text-xl text-gray-600 mb-4">{job.name}</p>

              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{job.city}, {job.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={18} />
                  <span>{job.jobtype}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={18} />
                  <span>{job.joblocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{job.minimumexperience}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveJob}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck size={24} className="text-purple-600" />
              ) : (
                <Bookmark size={24} className="text-gray-400" />
              )}
            </button>
          </div>

          {/* Salary */}
          <div className="flex items-center gap-2 text-2xl font-bold text-green-600 mb-6">
            <DollarSign size={28} />
            <span>₹{job.minimumfixedsalary} - ₹{job.maximumfixedsalary}</span>
            <span className="text-sm text-gray-500 font-normal">per month</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Send size={20} />
              <span>Apply Now</span>
            </button>
            <button
              onClick={handleSaveJob}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {isSaved ? 'Saved' : 'Save Job'}
            </button>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.jobdescription}</p>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>

          <div className="space-y-4">


            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
              <p className="text-gray-700">{job.minimumexperience}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.key_skills?.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* {job.englishlevel && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">English Level</h3>
                <p className="text-gray-700">{job.englishlevel}</p>
              </div>
            )} */}
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Department</h3>
              <p className="text-gray-700">{job.department}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Number of Positions</h3>
              <p className="text-gray-700">2</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Gender Preference</h3>
              <p className="text-gray-700">{job.user.sex}</p>
            </div>

            {/* <div>
              <h3 className="font-semibold text-gray-900 mb-1">Interview Method</h3>
              <p className="text-gray-700">{job.interviewmethod}</p>
            </div> */}
          </div>
        </div>

        {job && (
          <ApplyJobModal
            isOpen={showApplyModal}
            onClose={() => setShowApplyModal(false)}
            jobId={job.id.toString()}
            jobTitle={job.jobtitle || "Job"}
            screeningQuestions={[]}
            onSubmit={handleApplyJob}
          />
        )}
      </div>
    </ProfileLayout>
  );
}

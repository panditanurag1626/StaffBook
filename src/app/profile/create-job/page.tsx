'use client';
import React, { useEffect, useState } from 'react';
import ProfileLayout from '@/components/shared/ProfileLayout';
import CreateJobForm from '@/components/profile/CreateJobForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { THEME } from '@/styles/theme';
import { FiChevronLeft } from 'react-icons/fi';
import { jobService } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { notifyJobMatch } from '@/lib/firebaseNotifications';

function CreateJobContent() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('id');
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoadingJob, setIsLoadingJob] = useState(!!jobId);

    // Helper function to parse screening questions
    const parseScreeningQuestions = (data: any): string[] => {
        if (!data) return [''];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [''];
            } catch (e) {
                return [''];
            }
        }
        return [''];
    };

    // Fetch job details if editing
    useEffect(() => {
        const fetchJobDetails = async () => {
            if (jobId) {
                try {
                    setIsLoadingJob(true);
                    const response = await jobService.viewJobPost(jobId, 'user');
                    const job = response.data.jobpost;

                    // Map API response to form data structure
                    setInitialData({
                        title: job.job_title || '',
                        companyName: job.company_name || '',
                        employmentType: job.employment_type || 'Permanent',
                        description: job.job_description || '',
                        keySkills: job.key_skills || '',
                        department: job.department || '',
                        workExperienceMin: job.min_experience_years?.toString() || '',
                        workExperienceMax: job.max_experience_years?.toString() || '',
                        workMode: job.work_mode || 'Work from office',
                        locationPreference: job.location || '',
                        noticePeriod: job.notice_period || 'Immediate Joiner',
                        salaryMin: job.min_salary?.toString() || '',
                        salaryMax: job.max_salary?.toString() || '',
                        screeningQuestions: parseScreeningQuestions(job.screening_questions),
                        enableGoogleMap: job.enable_google_map === 1 || job.enable_google_map === '1',
                        fullAddress: job.full_address || '',
                        street: job.street || '',
                        city: job.city || '',
                        pinCode: job.pin_code || '',
                        state: job.state || '',
                        country: job.country || '',
                        latitude: job.latitude?.toString() || '',
                        longitude: job.longitude?.toString() || '',
                        receiveApplicationsVia: job.receive_applications_via || 'E-Mail/Staff Book portal',
                        companyLogo: job.companyLogoUrl || null,
                        vacancyReel: null,
                        reelUrl: job.reelUrl || null,
                    });
                } catch (error) {
                    console.error('Failed to fetch job details:', error);
                    toast.error('Failed to load job details');
                    router.push('/profile/find-candidates?tab=manage-jobs');
                } finally {
                    setIsLoadingJob(false);
                }
            }
        };

        fetchJobDetails();
    }, [jobId, router]);

    const handleCancel = () => {
        router.push('/profile/find-candidates?tab=manage-jobs');
    };

    const handleSubmit = async (data: any) => {
        try {
            const formData = new FormData();

            // Map standard text fields
            formData.append('job_title', data.title);
            formData.append('employment_type', data.employmentType);
            formData.append('job_description', data.description);
            formData.append('key_skills', data.keySkills);
            formData.append('department', data.department);
            formData.append('min_experience_years', data.workExperienceMin);
            formData.append('max_experience_years', data.workExperienceMax);
            formData.append('work_mode', data.workMode);
            formData.append('location', data.locationPreference || data.city || 'Remote'); // Fallback or map
            formData.append('notice_period', data.noticePeriod);
            formData.append('min_salary', data.salaryMin);
            formData.append('max_salary', data.salaryMax);
            formData.append('salary_currency', 'INR'); // Default
            formData.append('salary_period', 'Monthly'); // Default
            formData.append('company_name', data.companyName);
            formData.append('full_address', data.fullAddress);
            formData.append('city', data.city);
            formData.append('state', data.state);
            formData.append('country', data.country);
            formData.append('pin_code', data.pinCode);

            // Boolean/Number conversions
            formData.append('enable_google_map', data.enableGoogleMap ? '1' : '0');
            formData.append('latitude', data.latitude || '28.6139'); // Default to Delhi if not set
            formData.append('longitude', data.longitude || '77.2090'); // Default to Delhi if not set
            formData.append('status', 'Active');
            formData.append('expand', 'user');

            // Arrays (Screening Questions)
            if (Array.isArray(data.screeningQuestions)) {
                data.screeningQuestions.forEach((q: string, index: number) => {
                    formData.append(`screening_questions[${index}]`, q);
                });
            }

            // Reel Upload (Optional)
            if (data.vacancyReel) {
                formData.append('reelFile', data.vacancyReel);
            } else if (data.removeReel) {
                formData.append('reelFile', '');
            }

            // Company Logo Upload
            if (data.companyLogoFile) {
                formData.append('companyLogoFile', data.companyLogoFile);
            } else if (data.removeLogo) {
                formData.append('companyLogoFile', '');
            }

            if (jobId) {
                // Update existing job
                await jobService.updateJob(jobId, formData);
                toast.success('Job updated successfully');
                router.push('/profile/find-candidates?tab=manage-jobs');
            } else {
                // Create new job
                const response = await jobService.createJob(formData);
                const newJobId = response.data?.id || response.data?.job_post?.id || response.data?.jobpost?.id;
                const jobTitle = data.title;

                toast.success('Job posted successfully');

                // Trigger skill matching notifications in the background
                if (newJobId && currentUser) {
                    try {
                        console.log('Fetching Matched Candidates for job:', newJobId);
                        const matchResponse = await jobService.matchJobSkillsWithCandidates(newJobId, 1, 50);
                        const candidates = matchResponse.data?.items || matchResponse.data || [];

                        if (Array.isArray(candidates) && candidates.length > 0) {
                            console.log(`Found ${candidates.length} matched candidates. Sending notifications...`);
                            await Promise.all(candidates.map((candidate: any) => {
                                const targetId = candidate.id || candidate.user_id;
                                if (targetId) {
                                    return notifyJobMatch(
                                        targetId,
                                        currentUser.id,
                                        `${currentUser.first_name} ${currentUser.last_name}`,
                                        currentUser.image || '',
                                        jobTitle,
                                        newJobId
                                    );
                                }
                                return Promise.resolve();
                            }));
                        }
                    } catch (matchError) {
                        console.error('Failed to send match notifications:', matchError);
                    }
                }

                router.push('/profile/find-candidates?tab=manage-jobs');
            }
        } catch (error: any) {
            console.error('Job creation/update error:', error);
            // Re-throw the error so the form component can handle it
            throw error;
        }
    };

    if (isLoadingJob) {
        return (
            <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </ProfileLayout>
        );
    }

    return (
        <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
            <div className={`min-h-screen ${THEME.colors.background.page} pb-20 relative overflow-hidden`}>
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute top-[20%] -left-[10%] w-[300px] h-[300px] bg-indigo-100/20 rounded-full blur-3xl -z-10" />

                {/* Premium Header Section */}
                <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 pt-12 pb-24 px-4 mb-[-64px]">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.push('/profile/find-candidates?tab=manage-jobs')}
                                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all border border-white/20 group shadow-xl"
                            >
                                <FiChevronLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-white font-manrope tracking-tight mb-2">
                                    {jobId ? 'Edit Job Posting' : 'Post a Job'}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <p className="text-purple-100 text-xs sm:text-sm font-medium">
                                        {jobId ? 'Refine your job details for better candidate matching' : 'Reach qualified candidates faster'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <CreateJobForm
                        initialData={initialData}
                        onCancel={handleCancel}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </ProfileLayout>
    );
}

export default function CreateJobPage() {
    return (
        <React.Suspense fallback={
            <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </ProfileLayout>
        }>
            <CreateJobContent />
        </React.Suspense>
    );
}

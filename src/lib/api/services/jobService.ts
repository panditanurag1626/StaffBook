import apiClient from '../config';
import type {
    ApiResponse,
    JobPost,
    JobPostsResponse,
    CreateJobPostRequest,
    UpdateJobPostRequest,
    ApplyJobRequest,
    SaveJobRequest,
    JobPostApplication,
    JobApplicationsResponse,
} from '../types';

/**
 * Job Post API Service
 */
export const jobService = {
    /**
     * Get all job posts (for job seekers)
     * @param page - Page number
     * @param expand - Fields to expand (user, save, apply)
     */
    getJobPosts: async (page = 1, expand = 'user,save,apply'): Promise<ApiResponse<JobPostsResponse>> => {
        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `jobpost/job-post?expand=${expand}&page=${page}`
        );
        return response.data;
    },

    /**
     * Get a single job post by ID
     * @param id - Job post ID
     * @param expand - Fields to expand
     */
    getJobPost: async (id: number, expand = 'user,save,apply'): Promise<ApiResponse<{ job_post: JobPost }>> => {
        const response = await apiClient.get<ApiResponse<{ job_post: JobPost }>>(
            `jobpost/job-post/${id}?expand=${expand}`
        );
        return response.data;
    },

    /**
     * Get my posted jobs (for employers)
     * @param page - Page number
     * @param expand - Fields to expand
     */
    getMyJobPosts: async (page = 10, expand = 'user,save,apply'): Promise<ApiResponse<JobPostsResponse>> => {
        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `job-post/my-jobs?expand=${expand}&per-page=${page}`
        );
        return response.data;
    },

    /**
     * Get saved job posts
     * @param page - Page number
     * @param perPage - Items per page
     */
    getSavedJobPosts: async (page = 1, perPage = 50): Promise<ApiResponse<JobPostsResponse>> => {
        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `job-post/saved-jobs?per-page=${perPage}&page=${page}&expand=apply,save`
        );
        return response.data;
    },

    /**
     * Get recent job posts
     * @param page - Page number
     */
    getRecentJobPosts: async (page = 1): Promise<ApiResponse<JobPostsResponse>> => {
        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `jobpost/recent-job-post?page=${page}`
        );
        return response.data;
    },

    /**
     * Get applied job posts
     * @param page - Page number
     */
    getAppliedJobPosts: async (page = 1): Promise<ApiResponse<JobPostsResponse>> => {
        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `jobpost/job-post-applied?page=${page}`
        );
        return response.data;
    },

    /**
     * Get my applied jobs (New API)
     * @param page - Page number
     * @param perPage - Items per page
     */
    getMyAppliedJobs: async (page = 1, perPage = 10, cacheBust?: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `job-post/my-applied-jobs?page=${page}&per-page=${perPage}${cacheBust ? `&_t=${cacheBust}` : ''}`
        );
        return response.data;
    },

    /**
     * Create a new job post (employer only)
     * @param data - Job post data
     */
    createJobPost: async (data: CreateJobPostRequest): Promise<ApiResponse<{ job_post: JobPost }>> => {
        const response = await apiClient.post<ApiResponse<{ job_post: JobPost }>>(
            'jobpost/add-job-post',
            data
        );
        return response.data;
    },

    /**
     * Create a new job post with FormData (New API)
     * @param data - FormData containing job details
     */
    createJob: async (data: FormData): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/create',
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Update a job post (employer only)
     * @param data - Job post data with ID
     */
    updateJobPost: async (data: UpdateJobPostRequest): Promise<ApiResponse<{ job_post: JobPost }>> => {
        const response = await apiClient.post<ApiResponse<{ job_post: JobPost }>>(
            'jobpost/update-job-post',
            data
        );
        return response.data;
    },

    /**
     * Delete a job post (employer only)
     * @param id - Job post ID
     */
    deleteJobPost: async (id: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'jobpost/delete-job-post',
            { id }
        );
        return response.data;
    },

    /**
     * Apply for a job
     * @param data - Application data
     */
    applyForJob: async (data: ApplyJobRequest): Promise<ApiResponse<{ application: JobPostApplication }>> => {
        const formData = new FormData();
        formData.append('job_post_id', data.job_post_id.toString());
        formData.append('described', data.described);
        if (data.file) {
            formData.append('file', data.file);
        }

        const response = await apiClient.post<ApiResponse<{ application: JobPostApplication }>>(
            'jobpost/job-post-apply',
            formData
        );
        return response.data;
    },

    /**
     * Apply for a job (New API)
     * @param data - Application data or FormData
     */
    applyJob: async (data: ApplyJobRequest | FormData): Promise<ApiResponse<any>> => {
        let formData: FormData;

        if (data instanceof FormData) {
            formData = data;
        } else {
            formData = new FormData();
            formData.append('job_post_id', data.job_post_id);
            formData.append('described', data.described);
            if (data.file) {
                formData.append('resume_file', data.file);
            }
            if (data.screening_questions_answers) {
                formData.append('screening_questions_answers', data.screening_questions_answers);
            }
        }

        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/apply',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Save a job post
     * @param jobPostId - Job post ID
     */
    saveJobPost: async (jobPostId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'jobpost/job-post-save',
            { job_post_id: jobPostId.toString() }
        );
        return response.data;
    },

    /**
     * Unsave a job post
     * @param jobPostId - Job post ID
     */
    unsaveJobPost: async (jobPostId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'jobpost/job-post-save-delete',
            { job_post_id: jobPostId.toString() }
        );
        return response.data;
    },

    /**
     * Save a job (New API)
     * @param jobPostId - Job post ID
     */
    saveJob: async (jobPostId: number): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('job_post_id', jobPostId.toString());

        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/save',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },


    /**
     * Unsave a job (New API)
     * @param jobPostId - Job post ID
     */
    unsaveJob: async (jobPostId: number): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('job_post_id', jobPostId.toString());

        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/unsave',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Search job posts
     * @param query - Search query
     * @param filters - Additional filters
     */
    searchJobPosts: async (
        query: string,
        filters?: {
            city?: string;
            jobtype?: string;
            experience?: string;
            page?: number;
        }
    ): Promise<ApiResponse<JobPostsResponse>> => {
        const params = new URLSearchParams({
            q: query,
            ...filters,
            page: filters?.page?.toString() || '1',
        });

        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `jobpost/job-post?${params.toString()}`
        );
        return response.data;
    },

    /**
     * Get job posts with comprehensive filters
     * @param params - Filter parameters
     */
    getRecentlyJobPostsWithFilters: async (params: {
        status?: string;
        employment_type?: string;
        work_mode?: string;
        location?: string;
        keywords?: string;
        min_salary?: number;
        max_salary?: number;
        min_experience?: number;
        max_experience?: number;
        'per-page'?: number;
        page?: number;
        sort_by?: string;
        sort_order?: string;
        expand?: string;
    }): Promise<ApiResponse<JobPostsResponse>> => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `job-post/recently-posted?${queryParams.toString()}`
        );
        return response.data;
    },
    /**
     * Get nearby jobs
     * @param params - Filter parameters
     */
    getNearbyJobs: async (params: any): Promise<ApiResponse<JobPostsResponse>> => {
        const queryParams = new URLSearchParams({
            max_distance: '30',
            expand: 'apply,save',
            ...params,
        });

        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `job-post/nearby?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Get recommended jobs
     * @param params - Filter parameters
     */
    getRecommendedJobs: async (params: any): Promise<ApiResponse<JobPostsResponse>> => {
        const queryParams = new URLSearchParams({
            max_distance: '30',
            expand: 'apply,save,skill,experience,educations',
            ...params,
        });

        const response = await apiClient.get<ApiResponse<JobPostsResponse>>(
            `job-post/recommended?${queryParams.toString()}`
        );
        return response.data;
    },
    /**
     * View a single job post (New API)
     * @param id - Job post ID
     * @param expand - Fields to expand
     */
    viewJobPost: async (id: number | string, expand = 'apply,save'): Promise<ApiResponse<{ success: boolean; jobpost: JobPost }>> => {
        const response = await apiClient.get<ApiResponse<{ success: boolean; jobpost: JobPost }>>(
            `job-post/view?id=${id}&expand=${expand}`
        );
        return response.data;
    },

    /**
     * Get application timeline
     * @param applyId - Application ID
     */
    getApplicationTimeline: async (applyId: number | string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `job-post/application-timeline?applyId=${applyId}`
        );
        return response.data;
    },

    /**
     * Update a job post (New API)
     * @param id - Job post ID
     * @param data - FormData containing updated job details
     */
    updateJob: async (id: number | string, data: FormData): Promise<ApiResponse<any>> => {
        const response = await apiClient.put<ApiResponse<any>>(
            `job-post/update?id=${id}`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Delete a job post (New API)
     * @param id - Job post ID
     */
    deleteJob: async (id: number | string): Promise<ApiResponse<any>> => {
        const response = await apiClient.delete<ApiResponse<any>>(
            `job-post/delete?id=${id}`
        );
        return response.data;
    },

    /**
     * Update job post status (New API)
     * @param id - Job post ID
     * @param status - New status ('Active' or 'Closed')
     */
    updateJobStatus: async (id: number | string, status: 'Active' | 'Closed'): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('status', status);

        const response = await apiClient.post<ApiResponse<any>>(
            `job-post/update-status?id=${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Get job applicants (New API)
     * @param jobPostId - Job post ID
     * @param page - Page number (optional)
     * @param perPage - Items per page (optional)
     */
    getJobApplicants: async (jobPostId: number | string, page = 1, perPage = 10): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `job-post/job-applicants?jobPostId=${jobPostId}&page=${page}&per-page=${perPage}`
        );
        return response.data;
    },

    /**
     * Find candidates for a job post
     * @param jobPostId - Job post ID
     * @param page - Page number
     * @param perPage - Items per page
     */
    findCandidates: async (jobPostId: number | string | null = null, page = 1, perPage = 10, filters: any = {}): Promise<ApiResponse<any>> => {
        const queryParams = new URLSearchParams({
            page: String(page),
            per_page: String(perPage),
        });

        if (jobPostId) {
            queryParams.append('jobPostId', String(jobPostId));
        }

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const response = await apiClient.get<ApiResponse<any>>(
            `job-post/find-candidates?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Find nearby candidates for a job post
     * @param jobPostId - Job post ID
     * @param radius - Search radius in km
     * @param page - Page number
     * @param perPage - Items per page
     */
    findNearbyCandidates: async (jobPostId: number | string | null = null, radius = 25, page = 1, perPage = 10, filters: any = {}): Promise<ApiResponse<any>> => {
        const queryParams = new URLSearchParams({
            radius: String(radius),
            page: String(page),
            per_page: String(perPage),
        });

        if (jobPostId) {
            queryParams.append('jobPostId', String(jobPostId));
        }

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const response = await apiClient.get<ApiResponse<any>>(
            `job-post/find-nearby-candidates?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Match job skills with candidates
     * @param jobPostId - Job post ID
     * @param page - Page number
     * @param perPage - Items per page
     */
    matchJobSkillsWithCandidates: async (jobPostId: number | string | null = null, page = 1, perPage = 10, filters: any = {}): Promise<ApiResponse<any>> => {
        const queryParams = new URLSearchParams({
            page: String(page),
            per_page: String(perPage),
        });

        if (jobPostId) {
            queryParams.append('jobPostId', String(jobPostId));
        }

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const response = await apiClient.get<ApiResponse<any>>(
            `job-post/match-job-skills-with-candidates?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Send a job invite to a candidate
     * @param jobPostId - Job post ID
     * @param candidateId - Candidate user ID
     */
    sendJobInvite: async (jobPostId: number | string, candidateId: number | string): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('job_post_id', String(jobPostId));
        formData.append('candidate_id', String(candidateId));

        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/send-job-invite',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    /**
     * Reveal and track contact metadata when viewed by employer (Deducts credits)
     */
    revealCandidateContact: async (jobPostId: number | string | null | undefined, candidateId: number | string, customPayload?: any): Promise<ApiResponse<any>> => {
        const payload = customPayload || {
            job_post_id: Number(jobPostId),
            job_post: Number(jobPostId),
            candidate_id: Number(candidateId),
            candidate: Number(candidateId),
            contact_flow: "employer_to_job_seeker",
            count: 1,
            user_type: "employer"
        };
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/show-contact',
            payload
        );
        return response.data;
    },

    /**
     * Reveal and track email metadata when viewed by employer (Deducts credits)
     */
    revealCandidateEmail: async (jobPostId: number | string | null | undefined, candidateId: number | string, customPayload?: any): Promise<ApiResponse<any>> => {
        const payload = customPayload || {
            job_post_id: Number(jobPostId),
            job_post: Number(jobPostId),
            candidate_id: Number(candidateId),
            candidate: Number(candidateId),
            contact_flow: "employer_to_job_seeker",
            count: 1,
            user_type: "employer"
        };
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/email-contact',
            payload
        );
        return response.data;
    },

    /**
     * Reveal and track contact metadata when viewed by job seeker
     */
    getEmployerContactDetails: async (jobPostId: number | string): Promise<ApiResponse<any>> => {
        const payload = {
            job_post_id: Number(jobPostId),
            contact_flow: "job_seeker_to_employer",
            count: 1,
            user_type: "job_seeker"
        };
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/show-contact',
            payload
        );
        return response.data;
    },

    /**
     * Reveal and track email metadata when viewed by job seeker
     */
    getEmployerEmailDetails: async (jobPostId: number | string): Promise<ApiResponse<any>> => {
        const payload = {
            job_post_id: Number(jobPostId),
            contact_flow: "job_seeker_to_employer",
            count: 1,
            user_type: "job_seeker"
        };
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/email-contact',
            payload
        );
        return response.data;
    },

    /**
     * Download candidate resume (Deducts credits)
     */
    downloadCandidateResume: async (jobPostId: number | string | null | undefined, candidateId: number | string): Promise<ApiResponse<any>> => {
        const payload = {
            job_post_id: Number(jobPostId),
            candidate_id: Number(candidateId)
        };
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/resume-downloaded',
            payload
        );
        return response.data;
    },

    /**
     * Download candidate resumes in bulk
     */
    downloadBulkResume: async (jobPostId: number | string, applicationIds: number[] | string[]): Promise<ApiResponse<any>> => {
        const payload = {
            job_post_id: Number(jobPostId),
            application_ids: applicationIds.map(id => Number(id))
        };
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/bulk-resume-download',
            payload
        );
        return response.data;
    },

    /**
     * Download selected job applicants details in Excel/CSV format (New API)
     */
    downloadSelectedApplicantsExcel: async (jobPostId: number | string, applicationIds: number[] | string[]): Promise<any> => {
        const formData = new FormData();
        formData.append('job_post_id', String(jobPostId));
        applicationIds.forEach(id => {
            formData.append('application_ids[]', String(id));
        });

        const response = await apiClient.post(
            'job-post/bulk-applicants-excel',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    /**
     * Download all job applicants details in Excel/CSV format (New API)
     */
    downloadAllApplicantsExcel: async (jobPostId: number | string): Promise<any> => {
        const formData = new FormData();
        formData.append('job_post_id', String(jobPostId));

        const response = await apiClient.post(
            'job-post/bulk-applicants-excel-all',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    /**
     * Get resume zip download history
     */
    getResumeZipDownloads: async (jobPostId: number | string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `job-post/resume-zip-downloads?job_post_id=${jobPostId}`
        );
        return response.data;
    },

    /**
     * Get received job invites
     * @param status - Status of invites ('pending', 'accepted', 'declined')
     * @param page - Page number
     */
    getMyReceivedInvites: async (status = 'pending', page = 1): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `job-post/my-received-invites?status=${status}&page=${page}`
        );
        return response.data;
    },

    /**
     * Get sent job invites
     * @param status - Status of invites ('pending', 'viewed', 'accepted', 'declined')
     * @param page - Page number
     * @param fromDate - Optional from date (YYYY-MM-DD)
     * @param toDate - Optional to date (YYYY-MM-DD)
     */
    getMySentInvites: async (status = 'pending', page = 1, fromDate?: string, toDate?: string, perPage?: number): Promise<ApiResponse<any>> => {
        let url = `job-post/my-sent-invites?page=${page}`;
        if (status) url += `&status=${status}`;
        if (fromDate) url += `&from_date=${fromDate}`;
        if (toDate) url += `&to_date=${toDate}`;
        if (perPage) url += `&per-page=${perPage}`;

        const response = await apiClient.get<ApiResponse<any>>(url);
        return response.data;
    },

    /**
     * Respond to a received job invite
     * @param inviteId - ID of the job invite
     * @param formData - FormData containing action ('accept' or 'decline'), resume_file, screening_questions_answers
     */
    respondToInvite: async (inviteId: number | string, formData: FormData): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            `job-post/respond-to-invite?id=${inviteId}`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    /**
     * Withdraw an application
     * @param formData - FormData containing job_post_id and reason
     */
    withdrawApplication: async (formData: FormData): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/candidate-withdraw-application',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    /**
     * Get job applicant details
     * @param applicantId - Applicant ID
     */
    getJobApplicantDetails: async (applicantId: number | string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `users/other_profile?expand=totalActivePost,totalConnection,totalJobPost,userLiveDetail,userSetting,experience,educations,skill,educations,userBalance,resume&user_id=${applicantId}`
        );
        return response.data;
    },
    /**
     * Get employer job posts with applicants (New API)
     * @param jobPostId - Optional Job post ID to filter
     * @param page - Page number
     * @param perPage - Items per page
     */
    getEmployerJobPostsWithApplicants: async (jobPostId?: number | string, page = 1, perPage = 10): Promise<ApiResponse<any>> => {
        let url = `job-post/employer-job-post-applicants?page=${page}&per-page=${perPage}`;
        if (jobPostId) {
            url += `&job_post_id=${jobPostId}`;
        }
        const response = await apiClient.get<ApiResponse<any>>(url);
        return response.data;
    },
    /**
     * Update application status (select/reject)
     * @param applicationId - Application ID
     * @param status - Status code (7 = Selected, 11 = Rejected)
     */
    updateApplicationStatus: async (applicationId: number | string, status: number): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('application_id', String(applicationId));
        formData.append('status', String(status));

        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/update-application-status',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    /**
     * Download sample job post Excel file
     */
    downloadJobPostExcel: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            'job-post/download-jobpost-excel'
        );
        return response.data;
    },

    /**
     * Upload bulk job posts via Excel and Media Zip
     * @param excelFile - The Excel file
     * @param mediaZip - The ZIP file containing media
     */
    uploadBulkJobs: async (excelFile: File, mediaZip: File): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('excelFile', excelFile);
        formData.append('mediaZip', mediaZip);

        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/upload-jobpost-excel',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    /**
     * Download selected candidates/users details in Excel/CSV format
     */
    downloadBulkUsersExcel: async (userIds: number[]): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'job-post/bulk-users-excel',
            { user_ids: userIds }
        );
        return response.data;
    },
};

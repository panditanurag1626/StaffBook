// Job Post Types

export interface JobPost {
    id: number;
    user_id: number;
    job_title?: string;
    employment_type?: string;
    job_description?: string;
    key_skills?: string;
    department: string;
    min_experience_years?: number;
    max_experience_years?: number;
    work_mode?: string;
    location: string;
    notice_period?: string;
    min_salary?: string;
    max_salary?: string;
    salary_currency?: string;
    salary_period?: string;
    company_name?: string;
    company_logo_url?: string | null;
    posted_by_name?: string;
    full_address?: string;
    city: string;
    state: string;
    country: string;
    pin_code?: string;
    street?: string;
    enable_google_map?: number | string;
    latitude?: string;
    longitude?: string;
    receive_applications_via?: string;
    status: string;
    screening_questions?: string[] | string;
    reelUrl?: string | null;
    created_at?: string;
    updated_at?: string;
    posted_at?: string;
    is_saved?: boolean;
    is_applied?: boolean;
    distance?: number;
    distance_display?: string;
    user?: any;
    save?: number;
    apply?: number;
    // Keeping some old fields for compatibility if needed elsewhere
    name?: string;
    jobtitle?: string;
    jobtype?: string;
    joblocation?: string;
    minimumfixedsalary?: string;
    maximumfixedsalary?: number;
    minimumexperience?: string;
    jobdescription?: string;
    maplat?: number;
    maplong?: number;
    companyLogoUrl?: string;
    poster_designation?: string;
}

export interface CreateJobPostRequest {
    name: string;
    department: string;
    jobposttype: string;
    city: string;
    pincode: string;
    state: string;
    country: string;
    jobtype: string;
    jobtitle: string;
    nightship: number;
    joblocation: string;
    maplocation: number;
    maplat?: number;
    maplong?: number;
    address: string;
    area: string;
    paytype: string;
    minimumfixedsalary: string;
    maximumfixedsalary: number;
    jobdescription: string;
    nationality: string | number;
    minimumeducation: string;
    gender: string;
    agecriteria: string;
    minimumexperience: string;
    englishlevel: string;
    regionallanguage: string;
    skills: string;
    accommodationandfoodfacility: string;
    interviewmethod: string;
    applicationmanagement: string;
    status: number;
    averageincentivemonth?: number;
    educationdiplomadegree: string;
    minimumage?: number;
    maximumage?: number;
    hirenoofposition: number;
    noofposition: number;
}

export interface UpdateJobPostRequest extends CreateJobPostRequest {
    id: number;
}

export interface JobPostApplication {
    id: number;
    job_post_id: number;
    user_id: number;
    described: string;
    file?: string;
    created_at: number;
    updated_at?: number;
    user?: any;
    jobPost?: JobPost;
}

export interface ApplyJobRequest {
    job_post_id: string;
    described: string;
    file?: File;
    screening_questions_answers?: string; // Stringified JSON or comma-separated? User didn't specify, I'll go with string for flexibility.
}

export interface SaveJobRequest {
    job_post_id: number;
}

export interface JobPostsResponse {
    items: JobPost[];
    _meta: {
        totalCount: number;
        pageCount: number;
        currentPage: number;
        perPage: number;
    };
}

export interface JobApplicationsResponse {
    items: JobPostApplication[];
    _meta: {
        totalCount: number;
        pageCount: number;
        currentPage: number;
        perPage: number;
    };
}

export interface JobPostResponse {
    job_post: JobPost;
}

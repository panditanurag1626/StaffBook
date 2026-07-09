// API Response Types

export interface ApiResponse<T> {
    status: number;
    statusText: string;
    message: string;
    data: T;
}

// Auth Types
export interface RegisterRequest {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    country_code: string;
    device_type: string;
    device_token: string;
    device_token_voip_ios: string;
    user_type?: 'job_seeker' | 'employer';
    company_name?: string;
    designation?: string;
    professional_email?: string; // For employer verification
    gst_number?: string;
    document?: File; // Registration document for employer
}

export interface RegisterResponse {
    token?: string;
    errors?: Record<string, string[]>;
}

export interface LoginRequest {
    email: string;
    password: string;
    device_type: string;
    device_token: string;
    device_token_voip_ios: string;
}

export interface SocialLoginRequest {
    social_type: string;
    social_id: string;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    device_type: string;
    device_token: string;
}

export interface SendEmailRequest {
    professional_email: string;
}

export interface VerifyEmailRequest {
    professional_email: string;
    otp: number;
}

export interface ResendOtpRequest {
    email: string;
    token: string;
}

export interface VerifyRegistrationOtpRequest {
    email: string;
    otp: string;
    token: string;
    device_token: string;
    device_type: string;
}

export interface UserBalance {
    user_id: number;
    no_of_resume: number;
    no_of_banner: number;
    no_of_generate_lin: number;
    no_of_job_post: number;
    no_of_contact: number;
}

export interface UserBalanceEmployer {
    id: number;
    user_id: number;
    plan_id: number;
    plan_name?: string;
    plan_purchased_date: string;
    plan_expiry_date: string;
    launch_offer_days: number;
    launch_offer_used: number;
    job_posting_total: number;
    job_posting_used: number;
    job_posting_unlimited: number;
    live_chat_unlimited: number;
    live_chat_used: number;
    candidates_min_range: number;
    candidates_max_range: number;
    networking_min_range: number;
    networking_max_range: number;
    show_contact_total: number;
    show_contact_used: number;
    send_invite_total: number;
    send_invite_used: number;
    schedule_meeting_total: number;
    schedule_meeting_used: number;
    email_total: number;
    email_used: number;
    download_cv_total: number;
    download_cv_used: number;
    bottom_banner_available: number;
    bottom_banner_duration_months: number;
    bottom_banner_used: number;
    slider_banner_available: number;
    slider_banner_duration_months: number;
    slider_banner_used: number;
    bulk_download_available: number;
    bulk_actions_available: number;
    created_at: string;
    updated_at: string | null;
}

export interface UserBalanceJobSeeker {
    id: number;
    user_id: number;
    plan_id: number;
    plan_name?: string;
    plan_purchased_date: string;
    plan_expiry_date: string;
    launch_offer_days: number;
    launch_offer_used: number;
    live_chat_unlimited: number;
    live_chat_used: number;
    employers_min_range: number;
    employers_max_range: number;
    networking_min_range: number;
    networking_max_range: number;
    send_invite_total: number;
    send_invite_used: number;
    show_contact_total: number;
    show_contact_used: number;
    schedule_meeting_total: number;
    schedule_meeting_used: number;
    email_total: number;
    email_used: number;
    search_appears_available: number;
    search_priority: number;
    top_results_available: number;
    ats_resume_available: number;
    premium_designs_available: number;
    created_at: string;
    updated_at: string | null;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    country_code: string;
    user_type?: 'job_seeker' | 'employer';
    bio: string | null;
    description: string | null;
    designation: string | null;
    image: string | null;
    picture: string | null;
    backimage: string | null;
    backpicture: string | null;
    user_mode_type?: string | null;
    profileHeadline: string;
    headline: string | null;
    profile_view: number;
    is_verified: number;
    is_reported: number;
    is_biometric_login: number;
    is_push_notification_allow: number;
    account_created_with: number;
    available_balance: number;
    available_coin: number;
    device_token: string;
    city: string | null;
    state: string | null;
    country: string | null;
    sex: string | number | null;
    dob: string | null;
    location: string | null;
    latitude: string | null;
    longitude: string | null;
    totalConnection: number;
    totalJobPost: number;
    totalActivePost: number;
    resumeUpload: string | null;
    resume_upload: string | null;
    resume_download_counts: number;
    userBalance: UserBalance | null;
    user_balance_employer?: UserBalanceEmployer | null;
    user_balance_job_seeker?: UserBalanceJobSeeker | null;
    userStory: unknown | null;
    employerDetails: any | null;
    experience: Experience[];
    educations: Education[];
    skill: Skill[];
    projectList?: APIProject[];
    certificationList?: APICertification[];
    media?: UserMedia[];
    is_chat_user_online: number;
    chat_last_time_online: string | null;
    like_push_notification_status: number;
    comment_push_notification_status: number;
    paypal_id?: string | null;
    is_login_first_time?: number;
    cover_image?: string;
    is_premium?: boolean;
    // Career Preferences
    work_email?: string | null;
    work_phone?: string | null;
    preferred_role?: string | null;
    preferred_location?: string | null;
    preferred_latitude?: string | null;
    preferred_longitude?: string | null;
    preferred_salary?: number | string | null;
    expected_salary?: number | string | null;
    expected_salary_currency?: string | null;
    preferred_shift?: string | null;
    job_type?: string | null;
    work_status?: string | null;
    total_experience_years?: number | string | null;
    total_experience_months?: number | string | null;
    total_experience?: string | null;
    current_salary?: number | string | null;
    current_salary_currency?: string | null;
    notice_period_months?: number | string | null;
    linkedin_profile?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;
    resumeUrl?: string | null;
    website?: string | null;
    address?: string | null;
}

export interface LoginResponse {
    user?: User;
    auth_key?: string;
    errors?: Record<string, string[]>;
}

// Profile Types
export interface ExperienceMedia {
    id: number;
    url: string;
    type: string;
}

export interface Experience {
    id: number;
    user_id: number;
    title: string;
    employment_type: string;
    company_name: string;
    company_logo?: string | null;
    company_logo_url?: string | null;
    location: string;
    location_type: string;
    start_date: string;
    end_date: string | null;
    industry: string;
    description: string;
    profile_headline?: string;
    current_working: number;
    skills?: any[] | string;
    achievements?: any[] | string;
    created_at: number;
    updated_at: number | null;
    media: ExperienceMedia[];
}

export interface EducationMedia {
    id: number;
    url: string;
    type: string;
}

export interface Education {
    id: number;
    user_id: number;
    university_institute: string;
    course: string;
    specialization: string;
    course_type: string;
    start_year: string;
    end_year: string;
    is_pursuing?: number;
    grade_cgpa: string;
    description: string;
    created_at: number;
    updated_at: number | null;
    media: EducationMedia[];
}

export interface Skill {
    id: number;
    user_id: number;
    title: string;
    level: string;
    created_at: number;
    updated_at: number | null;
}

export interface UserMedia {
    id: number;
    media_type: number;
    filename: string;
    url: string;
    created_at?: string;
    updated_at?: string;
    is_profile?: number;
    is_cover?: number;
}

export interface UserProfile extends User {
    // Basic fields are now inherited from User
}

export interface ProfileResponse {
    user: UserProfile;
}

// Re-export all types from type modules
export * from './types/job.types';
export * from './types/connection.types';
export * from './types/post.types';

// Skill Request Types
export interface AddSkillRequest {
    title: string;
    level: string;
}

export interface UpdateSkillRequest extends AddSkillRequest {
    id: number;
}

// Education Request Types
export interface AddEducationRequest {
    university_institute: string;
    course: string;
    specialization: string;
    course_type: string;
    start_year: string;
    end_year: string;
    is_pursuing?: number;
    grade_cgpa: string;
    description: string;
    certificateFiles?: File[];
}

export interface UpdateEducationRequest extends AddEducationRequest {
    id: number;
    delete_media_ids?: string; // "[1,2]"
}

// Experience Request Types
export interface AddExperienceRequest {
    title: string;
    employment_type: string;
    company_name: string;
    location: string;
    location_type: string;
    start_date: string;
    end_date: string | null;
    industry: string;
    description: string;
    profile_headline?: string;
    current_working: number;
    skills?: string[];
    achievements?: string[];
    company_logo?: File;
    certificateFiles?: File[];
}

export interface UpdateExperienceRequest extends AddExperienceRequest {
    id: number;
    delete_media_ids?: string; // "[4,5]"
}

// Project Types
export interface APIProject {
    id: number;
    user_id: number;
    title: string;
    description: string;
    project_url: string;
    github_url: string;
    start_date: string;
    end_date: string;
    technologies: string;
    created_at?: number;
    updated_at?: number | null;
}

export interface AddProjectRequest {
    title: string;
    description: string;
    project_url: string;
    github_url: string;
    start_date: string;
    end_date: string;
    technologies: string;
}

export interface UpdateProjectRequest extends AddProjectRequest {
    id: number;
    delete_media_ids?: string;
}

// Certification Types
export interface APICertification {
    id: number;
    user_id: number;
    name: string;
    issuing_organization: string;
    issue_date: string;
    expiration_date: string;
    credential_id: string;
    credential_url: string;
    description: string;
    created_at?: number;
    updated_at?: number | null;
}

export interface AddCertificationRequest {
    name: string;
    issuing_organization: string;
    issue_date: string;
    expiration_date: string;
    credential_id: string;
    credential_url: string;
    description: string;
}

export interface UpdateCertificationRequest extends AddCertificationRequest {
    id: number;
    delete_media_ids?: string;
}

// User Request Types
export interface ProfileUpdateRequest {
    country: string;
    state: string;
    city: string;
}

export interface UpdateMobileRequest {
    country_code: string;
    phone: string;
}

export interface ReportUserRequest {
    report_to_user_id: number | string;
    reason: string;
}

export interface BlockUserRequest {
    report_to_user_id: number | string;
    reason?: string;
}

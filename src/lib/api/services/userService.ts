import apiClient from '../config';
import {
    ApiResponse,
    ProfileUpdateRequest,
    UpdateMobileRequest,
    ReportUserRequest,
    BlockUserRequest
} from '../types';

/**
 * User API Service
 */
export const userService = {
    /**
     * Upload Resume
     * @param file - Resume file
     */
    uploadResume: async (file: File): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('resume_upload', file);

        const response = await apiClient.post<ApiResponse<any>>(
            'users/upload-resume',
            formData
        );
        return response.data;
    },

    /**
     * Delete Resume
     */
    deleteResume: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>('user/delete-resume');
        return response.data;
    },

    /**
     * Delete Account
     */
    deleteAccount: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>('user/delete-account');
        return response.data;
    },

    /**
     * Upload Resume for AI
     * @param file - Resume file
     */
    uploadResumeAI: async (file: File): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('resumeFile', file);

        const response = await apiClient.post<ApiResponse<any>>(
            'users/user-upload-resume-ai',
            formData
        );
        return response.data;
    },

    /**
     * Update Profile Location
     * @param data - Profile update data
     */
    updateProfile: async (data: ProfileUpdateRequest): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('country', data.country);
        formData.append('state', data.state);
        formData.append('city', data.city);

        const response = await apiClient.post<ApiResponse<any>>(
            'user/profile-update',
            formData
        );
        return response.data;
    },

    /**
     * Update Mobile Number
     * @param data - Mobile update data
     */
    updateMobile: async (data: UpdateMobileRequest): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('country_code', data.country_code);
        formData.append('phone', data.phone);

        const response = await apiClient.post<ApiResponse<any>>(
            'users/update-mobile',
            formData
        );
        return response.data;
    },

    /**
     * Report User
     * @param data - Report data
     */
    reportUser: async (data: ReportUserRequest): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'user/report-user',
            data
        );
        return response.data;
    },

    /**
     * Remove Report (Unreport)
     * @param userId - User ID
     */
    removeReportUser: async (userId: number | string): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'user/report-user-remove',
            { report_to_user_id: userId }
        );
        return response.data;
    },

    /**
     * Block User
     * @param data - Block data
     */
    blockUser: async (data: BlockUserRequest): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'user/blocked-user',
            data
        );
        return response.data;
    },

    /**
     * Unblock User
     * @param userId - User ID
     */
    unblockUser: async (userId: number | string): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'user/unblocked-user',
            { report_to_user_id: userId } // Assuming key based on pattern, though unblock usually takes blocked_user_id
        );
        return response.data;
    },

    /**
     * Get Blocked User List
     */
    getBlockedUsers: async (page = 1): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(`user/blocked-user-list?page=${page}`);
        return response.data;
    },

    /**
     * Get Report User List
     */
    getReportedUsers: async (page = 1): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(`user/report-user-list?page=${page}`);
        return response.data;
    },

    /**
     * Get User Profile Completion Suggestions
     */
    getProfileCompletionSuggestions: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>('users/user-profile-completion');
        return response.data;
    },

    /**
     * Update User Location
     * @param data - { latitude: string, longitude: string, location: string }
     */
    updateLocation: async (data: { latitude: string, longitude: string, location: string }): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'user/update-location',
            data
        );
        return response.data;
    },

    /**
     * Update Profile Image
     * @param file - Profile image file
     */
    updateProfileImage: async (file: File): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('imageFile', file);

        const response = await apiClient.post<ApiResponse<any>>(
            'users/update-profile-image',
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
     * Update Profile Back Image (Cover Image)
     * @param file - Profile back image file
     */
    updateProfileBackImage: async (file: File): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('imageFileBack', file);

        const response = await apiClient.post<ApiResponse<any>>(
            'users/update-profile-back-image',
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
     * Delete Profile Image
     */
    deleteProfileImage: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>('user/delete-profile-image');
        return response.data;
    },

    /**
     * Delete Profile Back Image (Cover Image)
     */
    deleteProfileBackImage: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>('user/delete-profile-back-image');
        return response.data;
    },


    getProfileAnalytics: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>('user/profile-analytics');
        return response.data;
    },

    /**
     * Upload User Media Gallery Files
     * @param files - Array of files to upload
     * @param deleteImageIds - Optional array of media IDs to delete
     */
    uploadUserMedia: async (files: File[], deleteImageIds?: (number | string)[]): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('media[]', file);
        });

        if (deleteImageIds && deleteImageIds.length > 0) {
            deleteImageIds.forEach(id => {
                formData.append('delete_media_ids[]', id.toString());
            });
        }

        const response = await apiClient.post<ApiResponse<any>>(
            'users/media/upload',
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
     * Edit Profile - Comprehensive profile update
     * @param data - Profile data object
     */
    editProfile: async (data: {
        name?: string;
        bio?: string;
        designation?: string;
        description?: string;
        phone?: string;
        country_code?: string;
        city?: string;
        state?: string;
        country?: string;
        address?: string;
        dob?: string;
        sex?: string | number;
        website?: string;
        linkedin?: string;
        preferred_role?: string;
        preferred_location?: string;
        preferred_latitude?: string;
        preferred_longitude?: string;
        work_email?: string;
        work_phone?: string;
        preferred_salary?: string | number;
        expected_salary?: string | number;
        expected_salary_currency?: string;
        preferred_shift?: string;
        job_type?: string;
        work_status?: string;
        total_experience_years?: string | number;
        total_experience_months?: string | number;
        current_salary?: string | number;
        current_salary_currency?: string;
        notice_period_months?: string | number;
        linkedin_profile?: string;
        github_url?: string;
        portfolio_url?: string;
    }): Promise<ApiResponse<any>> => {
        const formData = new FormData();

        // Append all fields to FormData
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        formData.append(`${key}[]`, item.toString());
                    });
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        const response = await apiClient.post<ApiResponse<any>>(
            'user/edit-profile',
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
     * Update User Mode Type
     * @param modeType - 'Ready To Join' | 'Actively Hiring' | 'None'
     */
    updateUserModeType: async (modeType: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'users/mode-type',
            { user_mode_type: modeType }
        );
        return response.data;
    }
};

import apiClient from './config';
import { ApiResponse, ProfileResponse } from './types';

/**
 * Profile API Service
 */
export const profileService = {
    /**
     * Get user profile with expanded data
     * @returns Promise with user profile data
     */
    getProfile: async (): Promise<ApiResponse<ProfileResponse>> => {
        const expand = [
            'totalActivePost',
            'totalConnection',
            'totalJobPost',
            'userLiveDetail',
            'userSetting',
            'experience',
            'educations',
            'skill',
            'userBalance',
            'city',
            'state',
            'country',
            'projectList',
            'certificationList',
        ].join(',');

        const response = await apiClient.get<ApiResponse<ProfileResponse>>(
            `/users/profile?expand=${expand}`
        );
        return response.data;
    },
    /**
     * Get another user's profile with expanded data
     * @param userId The ID of the user to fetch
     * @returns Promise with user profile data
     */
    getOtherProfile: async (userId: string | number): Promise<ApiResponse<ProfileResponse>> => {
        const expand = [
            'totalActivePost',
            'totalConnection',
            'totalJobPost',
            'userLiveDetail',
            'userSetting',
            'experience',
            'educations',
            'skill',
            'resume'
        ].join(',');

        const response = await apiClient.get<ApiResponse<ProfileResponse>>(
            `/users/other_profile?user_id=${userId}&expand=${expand}`
        );
        return response.data;
    },
};

/**
 * Save company profile
 */
export const saveCompanyProfile = async (payload: FormData | {
  company_name: string;
  about_company: string;
  company_website: string;
  founded: string;
  headquarter: string;
  industry: string;
  company_size: string;
}) => {
  const response = await apiClient.post(`/user/save-company-profile`, payload);
  return response.data;
};
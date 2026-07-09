import apiClient from '../config';
import {
    ApiResponse,
    Experience,
    AddExperienceRequest,
    UpdateExperienceRequest
} from '../types';

/**
 * Experience API Service
 */
export const experienceService = {
    /**
     * Add a new experience
     * @param data - Experience data
     */
    addExperience: async (data: AddExperienceRequest): Promise<ApiResponse<Experience>> => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('employment_type', data.employment_type);
        formData.append('company_name', data.company_name);
        formData.append('location', data.location);
        formData.append('location_type', data.location_type);
        formData.append('start_date', data.start_date);
        if (data.end_date) formData.append('end_date', data.end_date);
        formData.append('industry', data.industry);
        formData.append('description', data.description);
        if (data.profile_headline) {
            formData.append('profile_headline', data.profile_headline);
        }
        formData.append('current_working', data.current_working.toString());
        if (data.skills) {
            formData.append('skills', JSON.stringify(data.skills));
        }
        if (data.achievements) {
            formData.append('achievements', JSON.stringify(data.achievements));
        }

        if (data.company_logo) {
            formData.append('company_logo', data.company_logo);
        }

        if (data.certificateFiles && data.certificateFiles.length > 0) {
            data.certificateFiles.forEach(file => {
                formData.append('certificateFiles[]', file);
            });
        }

        const response = await apiClient.post<ApiResponse<Experience>>(
            'experiences/add-experience',
            formData
        );
        return response.data;
    },

    /**
     * Update an existing experience
     * @param data - Experience data including ID
     */
    updateExperience: async (data: UpdateExperienceRequest): Promise<ApiResponse<Experience>> => {
        const formData = new FormData();
        formData.append('id', data.id.toString());
        formData.append('title', data.title);
        formData.append('employment_type', data.employment_type);
        formData.append('company_name', data.company_name);
        formData.append('location', data.location);
        formData.append('location_type', data.location_type);
        formData.append('start_date', data.start_date);
        if (data.end_date) formData.append('end_date', data.end_date);
        formData.append('industry', data.industry);
        formData.append('description', data.description);
        if (data.profile_headline) {
            formData.append('profile_headline', data.profile_headline);
        }
        formData.append('current_working', data.current_working.toString());
        if (data.skills) {
            formData.append('skills', JSON.stringify(data.skills));
        }
        if (data.achievements) {
            formData.append('achievements', JSON.stringify(data.achievements));
        }

        if (data.company_logo) {
            formData.append('company_logo', data.company_logo);
        }

        if (data.certificateFiles && data.certificateFiles.length > 0) {
            data.certificateFiles.forEach(file => {
                formData.append('certificateFiles[]', file);
            });
        }

        if (data.delete_media_ids) {
            formData.append('delete_media_ids', data.delete_media_ids);
        }

        const response = await apiClient.post<ApiResponse<Experience>>(
            'experiences/update-experience',
            formData
        );
        return response.data;
    },

    /**
     * Delete an experience
     * @param id - Experience ID
     */
    deleteExperience: async (id: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'experiences/delete-experience',
            { id }
        );
        return response.data;
    }
};

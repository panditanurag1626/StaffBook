import apiClient from '../config';
import {
    ApiResponse,
    Education,
    AddEducationRequest,
    UpdateEducationRequest
} from '../types';

/**
 * Education API Service
 */
export const educationService = {
    /**
     * Add a new education
     * @param data - Education data
     */
    addEducation: async (data: AddEducationRequest): Promise<ApiResponse<Education>> => {
        const formData = new FormData();
        formData.append('university_institute', data.university_institute);
        formData.append('course', data.course);
        formData.append('specialization', data.specialization);
        formData.append('course_type', data.course_type);
        formData.append('start_year', data.start_year);
        formData.append('end_year', data.end_year);
        if (data.is_pursuing !== undefined) formData.append('is_pursuing', data.is_pursuing.toString());
        formData.append('grade_cgpa', data.grade_cgpa);
        formData.append('description', data.description);

        if (data.certificateFiles && data.certificateFiles.length > 0) {
            data.certificateFiles.forEach(file => {
                formData.append('certificateFiles[]', file);
            });
        }

        const response = await apiClient.post<ApiResponse<Education>>(
            'educations/add-education',
            formData
        );
        return response.data;
    },

    /**
     * Update an existing education
     * @param data - Education data including ID
     */
    updateEducation: async (data: UpdateEducationRequest): Promise<ApiResponse<Education>> => {
        const formData = new FormData();
        formData.append('id', data.id.toString());
        formData.append('university_institute', data.university_institute);
        formData.append('course', data.course);
        formData.append('specialization', data.specialization);
        formData.append('course_type', data.course_type);
        formData.append('start_year', data.start_year);
        formData.append('end_year', data.end_year);
        if (data.is_pursuing !== undefined) formData.append('is_pursuing', data.is_pursuing.toString());
        formData.append('grade_cgpa', data.grade_cgpa);
        formData.append('description', data.description);

        if (data.certificateFiles && data.certificateFiles.length > 0) {
            data.certificateFiles.forEach(file => {
                formData.append('certificateFiles[]', file);
            });
        }

        if (data.delete_media_ids) {
            formData.append('delete_media_ids', data.delete_media_ids);
        }

        const response = await apiClient.post<ApiResponse<Education>>(
            'educations/update-education',
            formData
        );
        return response.data;
    },

    /**
     * Delete an education
     * @param id - Education ID
     */
    deleteEducation: async (id: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'educations/delete-education',
            { id }
        );
        return response.data;
    }
};

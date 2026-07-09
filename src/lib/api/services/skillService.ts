import apiClient from '../config';
import {
    ApiResponse,
    Skill,
    AddSkillRequest,
    UpdateSkillRequest
} from '../types';

/**
 * Skill API Service
 */
export const skillService = {
    /**
     * Add a new skill
     * @param data - Skill data
     */
    addSkill: async (data: AddSkillRequest): Promise<ApiResponse<Skill>> => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('level', data.level);

        const response = await apiClient.post<ApiResponse<Skill>>(
            'skills/add-skill',
            formData 
        );
        return response.data;
    },

    /**
     * Update an existing skill
     * @param data - Skill data including ID
     */
    updateSkill: async (data: UpdateSkillRequest): Promise<ApiResponse<Skill>> => {
        const formData = new FormData();
        formData.append('id', data.id.toString());
        formData.append('title', data.title);
        formData.append('level', data.level);

        const response = await apiClient.post<ApiResponse<Skill>>(
            'skills/update-skill',
            formData 
        );
        return response.data;
    },

    /**
     * Delete a skill
     * @param id - Skill ID
     */
    deleteSkill: async (id: number): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('id', id.toString());

        const response = await apiClient.post<ApiResponse<any>>(
            'skills/delete-skill',
            formData 
        );
        return response.data;
    },

    /**
     * Get skill suggestions
     * @param skill - Skill query
     */
    getSkillSuggestions: async (skill: string): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('skill', skill);

        const response = await apiClient.post<ApiResponse<any>>(
            'skill/skill-suggestions',
            formData 
        );
        return response.data;
    }
};

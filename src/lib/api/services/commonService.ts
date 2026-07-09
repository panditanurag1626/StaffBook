import apiClient from '../config';
import { ApiResponse } from '../types';

/**
 * Common API Service
 * For predefined chats, comments, etc.
 */
export const commonService = {
    /**
     * Get predefined chats
     */
    getPredefinedChats: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            'predefined-chats'
        );
        return response.data;
    },

    /**
     * Get predefined comments
     */
    getPredefinedComments: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            'predefined-comments'
        );
        return response.data;
    },

    /**
     * Search all cities
     * @param q - Search query
     * @param page - Page number
     * @param perPage - Items per page
     */
    searchCities: async (q: string, page = 1, perPage = 20): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `city/search-all?q=${q}&page=${page}&per_page=${perPage}`
        );
        return response.data;
    },

    /**
     * Get FAQs
     */
    getFaqs: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            'faq'
        );
        return response.data;
    }
};

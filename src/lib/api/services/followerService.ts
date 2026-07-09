import apiClient from '../config';
import { ApiResponse } from '../types';

/**
 * Follower API Service
 */
export const followerService = {
    /**
     * Get my followers
     * @param userId - User ID
     * @param page - Page number
     */
    getMyFollowers: async (userId: number, page = 1): Promise<ApiResponse<any>> => {
        const expand = 'followerUserDetail,followerUserDetail.isFollowing,followerUserDetail.isFollower';
        const response = await apiClient.get<ApiResponse<any>>(
            `followers/my-follower?user_id=${userId}&page=${page}&expand=${encodeURIComponent(expand)}`
        );
        return response.data;
    }
};

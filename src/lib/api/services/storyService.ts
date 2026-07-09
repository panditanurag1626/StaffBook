import apiClient from '../config';
import { ApiResponse } from '../types';

export interface Story {
    id: number;
    user_id: number;
    type: 1 | 2; // 1: image, 2: video
    image?: string;
    video?: string;
    description?: string;
    background_color?: string;
    created_at: number | string;
    imageUrl?: string;
    videoUrl?: string;
    user?: any;
}

export interface PostStoryData {
    stories: {
        type: number;
        image?: string;
        video?: string;
        description?: string;
        background_color?: string;
    }[];
}

/**
 * Story API Service
 */
export const storyService = {
    /**
     * Get all stories
     */
    getStories: async (page: number = 1): Promise<ApiResponse<{ story: Story[] }>> => {
        const response = await apiClient.get<ApiResponse<{ story: Story[] }>>(
            `stories?page=${page}&expand=user,user.userLiveDetail&t=${Date.now()}`
        );
        return response.data;
    },

    /**
     * Get my active story
     */
    getMyActiveStory: async (): Promise<ApiResponse<{ story: { items: Story[] } }>> => {
        const response = await apiClient.get<ApiResponse<{ story: { items: Story[] } }>>(
            `stories/my-active-story?t=${Date.now()}`
        );
        return response.data;
    },

    /**
     * Post new stories
     */
    postStories: async (data: PostStoryData): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>('stories', data);
        return response.data;
    },

    /**
     * Delete story
     */
    deleteStory: async (storyId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.delete<ApiResponse<any>>(`stories/${storyId}`);
        return response.data;
    },

    /**
     * View a story
     */
    viewStory: async (storyId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(`stories/${storyId}`);
        return response.data;
    },

    /**
     * React to a story
     */
    likeStory: async (storyId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(`stories/like?id=${storyId}`);
        return response.data;
    },
    unlikeStory: async (storyId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(`stories/unlike?id=${storyId}`);
        return response.data;
    },
    getStoryLikes: async (storyId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(`stories/like-users?id=${storyId}`);
        return response.data;
    },

    /**
     * Comment on a story
     */
    addComment: async (storyId: number, comment: string): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('comment', comment);
        const response = await apiClient.post<ApiResponse<any>>(`stories/add-comment?id=${storyId}`, formData);
        return response.data;
    },
    getStoryComments: async (storyId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(`stories/comments?id=${storyId}`);
        return response.data;
    },
    deleteComment: async (commentId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.delete<ApiResponse<any>>(`stories/delete-comment?id=${commentId}`);
        return response.data;
    },

    /**
     * Upload story media to gallery
     */
    uploadGallery: async (file: File): Promise<ApiResponse<{ fileUrl: string }>> => {
        const formData = new FormData();
        formData.append('filenameFile', file);
        const response = await apiClient.post<ApiResponse<{ fileUrl: string }>>(
            'stories/upload-gallary',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
        return response.data;
    },

    /**
     * Report a story
     */
    reportStory: async (storyId: number, reason: string): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('story_id', storyId.toString());
        formData.append('reason', reason);
        const response = await apiClient.post<ApiResponse<any>>('story/report-story', formData);
        return response.data;
    }
};

import apiClient from '../config';
import { ApiResponse } from '../types';

export interface Banner {
    id: number;
    title: string;
    target_url: string;
    latitude: string;
    longitude: string;
    location_name: string;
    image: string;
    status: number
    created_at: number;
    imageUrl: string;
    name?: string;
}

export interface BannerListResponse {
    banners: {
        items: Banner[]
        _meta?: {
            totalCount: number;
            pageCount: number;
            currentPage: number;
            perPage: number;
        }
    },
}

export const bannerService = {
    /**
     * Get active banner sliders
     */
    getBannerSliders: async (): Promise<ApiResponse<{ banners: { items: Banner[] } }>> => {
        const response = await apiClient.get<ApiResponse<{ banners: { items: Banner[] } }>>('banner-slider');
        return response.data;
    },

    /**
     * Get all banners (Public)
     */
    getBanners: async (): Promise<ApiResponse<BannerListResponse>> => {
        const response = await apiClient.get<ApiResponse<BannerListResponse>>('banners');
        return response.data;
    },

    /**
     * Get employer's own banners
     */
    getMyBanners: async (page = 1, perPage = 10): Promise<ApiResponse<BannerListResponse>> => {
        const response = await apiClient.get<ApiResponse<BannerListResponse>>(
            `banner/my-banner?page=${page}&per-page=${perPage}`
        );
        return response.data;
    },

    /**
     * Create a new banner
     */
    createBanner: async (formData: FormData): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'banner/create',
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
     * Update an existing banner
     */
    updateBanner: async (formData: FormData): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'banner/update-banner',
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
     * Delete a banner
     */
    deleteBanner: async (id: number | string): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('id', id.toString());
        const response = await apiClient.post<ApiResponse<any>>(
            'banner/delete-banner',
            formData
        );
        return response.data;
    },

    /**
     * Toggle banner status (Activate/Deactivate)
     */
    toggleBannerStatus: async (id: number | string, status: 'Activate' | 'Deactivate'): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('id', id.toString());
        formData.append('status', status);
        const response = await apiClient.post<ApiResponse<any>>(
            'banner/update-banner',
            formData
        );
        return response.data;
    }
};

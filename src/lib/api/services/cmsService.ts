import apiClient from "../config";
import type { ApiResponse } from "../types";

export interface CMSContent {
    id: number;
    title: string;
    slug: string;
    content: string;
    status: number;
    created_at: string;
    updated_at: string;
}

export const findCMSBySlug = async (slug: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<CMSContent>>(`cms/find-by-slug?slug=${slug}`);
    return response.data;
};

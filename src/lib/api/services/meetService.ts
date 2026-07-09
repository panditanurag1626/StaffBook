import apiClient from '../config';
import { ApiResponse } from '../types';

export interface CreateMeetingParams {
    title: string;
    preferred_region?: string;
    job_post_id?: number | null;
    viewed_user_id?: number | null;
    contact_flow?: string;
    count?: number;
    preset_name?: string;
    scheduled_at: string; // Format: "YYYY-MM-DD HH:mm"
    record_on_start?: boolean;
    confirm_create_new?: boolean;
}

export interface GetMeetingLogsParams {
    status?: 'past' | 'upcoming' | 'all';
    page?: number;
    per_page?: number;
}

export interface RespondMeetingParams {
    meeting_log_id: number;
    action: 'accept' | 'decline';
    notes?: string;
}

/**
 * Meet API Service
 */
export const meetService = {
    /**
     * Create a new meet/meeting
     */
    createMeet: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'meet/create',
            {}
        );
        return response.data;
    },

    /**
     * Create a scheduled meeting
     */
    createMeeting: async (data: CreateMeetingParams): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'meet/create-meeting',
            data
        );
        return response.data;
    },

    /**
     * Get meeting logs
     */
    getMeetingLogs: async (params?: GetMeetingLogsParams): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            'meet/meeting-logs',
            { params }
        );
        return response.data;
    },

    /**
     * Respond to a meeting (accept/decline)
     */
    respondMeeting: async (data: RespondMeetingParams): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'meet/respond-meeting',
            data
        );
        return response.data;
    },

    /**
     * Access meeting check
     */
    accessMeeting: async (meetingId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `meet/access-meeting?meeting_id=${meetingId}`
        );
        return response.data;
    }
};

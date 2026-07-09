import apiClient from '../config';
import type {
    ApiResponse,
    Connection,
    ConnectionsResponse,
    SendConnectionRequest,
    WithdrawConnectionRequest,
    AcceptConnectionRequest,
    RejectConnectionRequest,
    UnconnectRequest,
} from '../types';

/**
 * Connection API Service
 */
export const connectionService = {
    /**
     * Get my connections
     * @param page - Page number
     * @param userId - Current User ID
     */
    getMyConnections: async (page = 1, userId?: number): Promise<ApiResponse<any>> => {
        const url = `connections/my-connection?expand=connectionUserDetail,totalConnection&user_id=${userId}&page=${page}`;
        const response = await apiClient.get<ApiResponse<any>>(url);
        return response.data;
    },

    /**
     * Get other user's connections
     * @param page - Page number
     * @param userId - Other User ID
     */
    getOtherConnections: async (page = 1, userId?: number): Promise<ApiResponse<any>> => {
        const url = `connections/other-connection?expand=connectionUserDetail,totalConnection&user_id=${userId}&page=${page}`;
        const response = await apiClient.get<ApiResponse<any>>(url);
        return response.data;
    },

    /**
     * Get all connections (Keep as legacy or general search if needed, but 'my-connection' is primary now)
     * @param page - Page number
     */
    getAllConnections: async (page = 1): Promise<ApiResponse<ConnectionsResponse>> => {
        const response = await apiClient.get<ApiResponse<ConnectionsResponse>>(
            `connections/connection?page=${page}&expand=connectionUser`
        );
        return response.data;
    },

    /**
     * Get sent connection requests
     * @param page - Page number
     * @param userId - User ID (optional)
     */
    getSentRequests: async (page = 1, userId?: number): Promise<ApiResponse<any>> => {
        const url = `connections/sent-request-connection?expand=connectionUserDetail,totalConnection&user_id=${userId}&page=${page}`;
        const response = await apiClient.get<ApiResponse<any>>(url);
        return response.data;
    },

    /**
     * Get received connection requests
     * @param page - Page number
     * @param userId - User ID (optional)
     */
    getReceivedRequests: async (page = 1, userId?: number): Promise<ApiResponse<any>> => {
        const url = `connections/get-request-connection?expand=userDetail,totalConnection&user_id=${userId}&page=${page}`;
        const response = await apiClient.get<ApiResponse<any>>(url);
        return response.data;
    },

    /**
     * Send a connection request
     * @param userId - Current user ID
     * @param connectionUserId - User ID to connect with
     */
    sendConnectionRequest: async (userId: number, connectionUserId: number): Promise<ApiResponse<{ connection: Connection }>> => {
        const response = await apiClient.post<ApiResponse<{ connection: Connection }>>(
            '/connections',
            { user_id: userId, connection_user_id: connectionUserId }
        );
        return response.data;
    },

    /**
     * Withdraw a connection request
     * @param userId - Current user ID
     * @param connectionUserId - Target user ID to withdraw request from
     */
    withdrawConnectionRequest: async (userId: number, connectionUserId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'connections/withdraw-connection',
            { user_id: userId, connection_user_id: connectionUserId }
        );
        return response.data;
    },

    /**
     * Accept a connection request
     * @param userId - Current user ID
     * @param connectionUserId - Target user ID (sender of the request)
     */
    acceptConnectionRequest: async (userId: number, connectionUserId: number): Promise<ApiResponse<{ connection: Connection }>> => {
        const response = await apiClient.post<ApiResponse<{ connection: Connection }>>(
            'connections/accept-connection',
            { user_id: userId, connection_user_id: connectionUserId }
        );
        return response.data;
    },

    /**
     * Reject a connection request
     * @param connectionUserId - User ID to reject
     */
    rejectConnectionRequest: async (connectionUserId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'connections/reject-connection',
            { connection_user_id: connectionUserId }
        );
        return response.data;
    },

    /**
     * Remove a connection (unconnect)
     * @param connectionUserId - User ID to disconnect from
     */
    unconnect: async (user_id: number, connectionUserId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'connections/unconnection',
            { user_id: user_id, connection_user_id: connectionUserId }
        );
        return response.data;
    },

    /**
     * Search users for connections
     * @param query - Search query
     * @param page - Page number
     */
    searchUsers: async (query: string, page = 1): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `users/search?q=${encodeURIComponent(query)}&page=${page}`
        );
        return response.data;
    },

    /**
     * Get nearby connections
     * @param page - Page number
     * @param latitude - Latitude
     * @param longitude - Longitude
     * @param max_distance - Max distance in km
     */
    getNearbyConnections: async (
        page = 1,
        latitude = 19.0760,
        longitude = 72.8777,
        max_distance = 100
    ): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `connections/nearby?page=${page}&latitude=${latitude}&longitude=${longitude}&max_distance=${max_distance}`
        );
        return response.data;
    },

    /**
     * Get suggested connections
     * @param page - Page number
     */
    getSuggestedConnections: async (page = 1): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(
            `connections/suggested?page=${page}&expand=totalConnection`
        );
        return response.data;
    },
};

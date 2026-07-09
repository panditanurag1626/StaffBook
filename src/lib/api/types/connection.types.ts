// Connection Types

export interface Connection {
    id: number;
    user_id: number;
    connection_user_id: number;
    status: number; // 0 = pending, 1 = accepted, 2 = rejected
    created_at: number;
    updated_at?: number;
    // Expanded user details
    user?: ConnectionUser;
    connectionUser?: ConnectionUser;
}

export interface ConnectionUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    designation?: string;
    image?: string;
    picture?: string;
    city?: string;
    state?: string;
    country?: string;
    totalConnection?: number;
    bio?: string;
}

export interface SendConnectionRequest {
    connection_user_id: number;
}

export interface WithdrawConnectionRequest {
    connection_id: number;
}

export interface AcceptConnectionRequest {
    connection_id: number;
}

export interface RejectConnectionRequest {
    connection_id: number;
}

export interface UnconnectRequest {
    connection_user_id: number;
}

// Specific response types for the new API structure
export interface ConnectionListResponse {
    items: any[];
    _links?: any;
    _meta?: {
        totalCount: number;
        pageCount: number;
        currentPage: number;
        perPage: number;
    };
}

export interface GetRequestConnectionsResponse {
    getrequestconnections: ConnectionListResponse;
}

export interface SentRequestConnectionsResponse {
    sentrequestconnections: ConnectionListResponse;
}

export interface MyConnectionsResponse {
    myconnections: ConnectionListResponse;
}

export interface ConnectionsResponse {
    items: Connection[];
    _meta?: {
        totalCount: number;
        pageCount: number;
        currentPage: number;
        perPage: number;
    };
}

export interface ConnectionResponse {
    connection: Connection;
}

export enum ConnectionStatus {
    PENDING = 0,
    ACCEPTED = 1,
    REJECTED = 2,
}

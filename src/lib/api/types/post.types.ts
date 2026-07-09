// Post/Feed Types

export interface Post {
    id: number;
    user_id: number;
    content: string;
    media?: PostMedia[];
    visibility: 'public' | 'connections' | 'private';
    likes_count: number;
    comments_count: number;
    shares_count: number;
    created_at: number;
    updated_at?: number;
    // Expanded fields
    user?: any;
    isLiked?: boolean;
    isSaved?: boolean;
}

export interface PostMedia {
    id: number;
    post_id: number;
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnail?: string;
}

export interface CreatePostRequest {
    content: string;
    media?: File[];
    visibility?: 'public' | 'connections' | 'private';
    type?: number; // 1=Normal, 2=Competition, 3=Club, 4=Reel
    hashtag?: string;
    mentionUser?: string;
    competition_id?: number;
    club_id?: number;
    audio_id?: number;
    audio_start_time?: number;
    audio_end_time?: number;
}

export interface UpdatePostRequest {
    id: number;
    title?: string;
}

export interface PostComment {
    id: number;
    post_id: number;
    user_id: number;
    comment: string;
    created_at: number;
    updated_at?: number;
    user?: any;
}

export interface CreateCommentRequest {
    post_id: number;
    comment: string;
}

export interface PostsResponse {
    items: Post[];
    _meta: {
        totalCount: number;
        pageCount: number;
        currentPage: number;
        perPage: number;
    };
}

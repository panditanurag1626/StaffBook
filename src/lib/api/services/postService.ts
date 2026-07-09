import apiClient from '../config';
import type {
    Post,
    CreatePostRequest,
    UpdatePostRequest,
    PostComment,
    CreateCommentRequest,
    PostsResponse
} from '../types/post.types';

/**
 * Post Service
 * Handles all post/feed related API calls
 */

// Search posts
export const searchPosts = async (query: string, page: number = 1, isRecent: boolean = false) => {
    const params = new URLSearchParams({
        title: query,
        page: page.toString(),
        expand: 'user,user.userLiveDetail,clubDetail.createdByUser,clubDetail.totalJoinedUser',
    });

    if (isRecent) {
        params.append('is_recent', '1');
    }

    return apiClient.get<PostsResponse>(`posts/search-post?${params.toString()}`);
};

// Get posts feed
export const getPosts = async (page: number = 1, expand?: string) => {
    return apiClient.get<PostsResponse>('posts/search-post', {
        params: {
            page,
            expand: expand || 'user,user.userLiveDetail,clubDetail.createdByUser,clubDetail.totalJoinedUser',
            is_recent: 1
        }
    });
};

// Get my own posts
// Get posts by a specific user
export const getUserPosts = async (userId: string | number, page: number = 1, perPage: number = 20) => {
    return apiClient.get<any>('posts/search-post', {
        params: {
            page,
            'per-page': perPage,
            user_id: userId,
            expand: 'user,user.userLiveDetail,clubDetail.createdByUser,clubDetail.totalJoinedUser'
        }
    });
};

export const getMyPosts = async (page: number = 1, perPage: number = 20) => {
    return apiClient.get<any>('posts/my-post', {
        params: {
            page,
            'per-page': perPage,
            expand: 'user,user.userLiveDetail,clubDetail.createdByUser,clubDetail.totalJoinedUser'
        }
    });
};

// Get single post
export const getPost = async (id: number, expand?: string) => {
    return apiClient.get<{ post: Post }>(`posts/post-detail`, {
        params: {
            id,
            expand
        }
    });
};

// Create post/reel
// Create post/reel
// Create post
// Create post
export const createPost = async (data: CreatePostRequest) => {
    // 1. Upload media files first
    const gallery: any[] = [];

    if (data.media && data.media.length > 0) {
        for (const file of data.media) {
            const formData = new FormData();
            formData.append('filenameFile', file); // changed key to filenameFile

            const uploadRes = await apiClient.post('posts/upload-gallary', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data && uploadRes.data.data) {
                // User instruction: take the fileUrl and use it in posts/create API
                // We map it to 'filename' field in the gallery object as per previous structure, or maybe the field should be fileUrl?
                // Assuming 'filename' field in gallary object takes the URL now.
                const fileUrl = uploadRes.data.data.filename;
                const isVideo = file.type.startsWith('video/');

                gallery.push({
                    filename: fileUrl, // using fileUrl as requested
                    video_thumb: "",
                    type: "1",
                    media_type: isVideo ? "2" : "1",
                    is_default: "1"
                });
            }
        }
    }

    // 2. JSON Payload
    const payload = {
        type: data.type || 1,
        post_content_type: 1,
        title: data.content,
        hashtag: data.hashtag || "",
        mentionUser: data.mentionUser || "[]",
        gallary: gallery
    };

    return apiClient.post('posts/create', payload);
};

// Update post
export const updatePost = async (data: UpdatePostRequest) => {
    return apiClient.post(`posts/update-post`, data);
};

// Delete post
export const deletePost = async (id: number) => {
    return apiClient.delete(`posts/${id}/delete`);
};

// Like post
export const likePost = async (postId: number) => {
    return apiClient.post(`posts/like`, { "post_id": postId });
};

// Unlike post
export const unlikePost = async (postId: number) => {
    return apiClient.post(`posts/unlike`, { "post_id": postId });
};

export const getPostLikes = async (postId: number) => {
    return apiClient.get(`posts/${postId}/likes`);
};


// Get post comments
export const getPostComments = async (postId: number, page: number = 1) => {
    return apiClient.get<{ items: PostComment[] }>(`posts/comment-list?post_id=${postId}`);
};

// Create comment
export const createComment = async (data: CreateCommentRequest) => {
    return apiClient.post(`posts/add-comment`, {
        comment: data.comment,
        post_id: data.post_id
    });
};

// Repost Post
export const reportPost = async (data: { post_id: number; reason: string }) => {
    return apiClient.post(`posts/report-post`, {
        reason: data.reason,
        post_id: data.post_id
    });
};

// Repost Post
export const repostPost = async (data: { post_id: number }) => {
    return apiClient.post(`posts/repost`, {
        id: data.post_id
    });
};

// Delete comment
export const deleteComment = async (postId: number, commentId: number) => {
    return apiClient.delete(`posts/${postId}/comment/${commentId}`);
};

export const postService = {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    getPostComments,
    createComment,
    deleteComment,
    searchPosts,
    getMyPosts,
    getUserPosts
};

export default postService;

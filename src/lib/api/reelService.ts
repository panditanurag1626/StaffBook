import apiClient from "./config";

export interface UploadReelData {
  title: string;
  description: string;
  video: File;
}

// Sub-interfaces for detailed structure
export interface ReelUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  // properties from JSON
  image?: string;
  picture?: string; // full url
  is_reported?: number;
  profileHeadline?: string;
  // properties from previous interface (keeping for compatibility if list API uses them)
  phone?: string | null;
  avatar_url?: string; 
}

export interface ReelComment {
  id: number;
  reel_id: number;
  user_id: number;
  comment: string;
  created_at: number;
  user?: ReelUser;
}

export interface ReelLike {
  id?: number;
  reel_id?: number;
  user_id: number;
  created_at?: number;
}

export interface ReelSaved {
  id: number;
  reel_id: number;
  user_id: number;
  created_at: number;
}

export interface Reel {
  id: number;
  user_id: number;
  title: string;
  description: string;
  video: string; // filename
  thumbnail: string | null;
  status: number;
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  saved_count: number;
  created_at: number; // Unix timestamp
  videoUrl: string; // full url
  thumbnailUrl: string | null;
  user?: ReelUser;
  
  // Detailed arrays from view API
  comments?: ReelComment[];
  likes?: ReelLike[];
  dislikes?: any[]; 
  saved?: ReelSaved[];
}

export interface ReelResponse {
  status: number;
  message: string;
  data?: Reel;
}

export interface ReelsListResponse {
  status: number;
  statusText?: string;
  message: string;
  data?: {
    reels: Reel[];
  };
}

// Upload a new reel
export const uploadReel = async (
  data: UploadReelData,
): Promise<ReelResponse> => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("video", data.video);

    const response = await apiClient.post("reel/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Upload reel error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to upload reel",
    };
  }
};

// Get list of all reels
export const getReelsList = async (
  page: number = 1,
): Promise<ReelsListResponse> => {
  try {
    const response = await apiClient.get(`reel/list?page=${page}`);
    return response.data;
  } catch (error: any) {
    console.error("Get reels list error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch reels",
    };
  }
};

// Get user's own reels
export const getMyReels = async (): Promise<ReelsListResponse> => {
  try {
    const response = await apiClient.get("reel/my-reels");
    return response.data;
  } catch (error: any) {
    console.error("Get my reels error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch your reels",
    };
  }
};

// Get reel details
export const getReelDetails = async (reelId: number): Promise<ReelResponse> => {
  try {
    // API endpoint for a single reel
    const response = await apiClient.get(`reel/view?id=${reelId}`);
    return response.data;
  } catch (error: any) {
    console.error("Get reel details error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch reel details",
    };
  }
};

// Like a reel
export const likeReel = async (reelId: number): Promise<ReelResponse> => {
  try {
    const response = await apiClient.post(`reel/like?id=${reelId}`);
    return response.data;
  } catch (error: any) {
    console.error("Like reel error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to like reel",
    };
  }
};

// Unlike a reel
export const dislikeReel = async (reelId: number): Promise<ReelResponse> => {
  try {
    const response = await apiClient.post(`reel/dislike?id=${reelId}`);
    return response.data;
  } catch (error: any) {
    console.error("Dislike reel error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to unlike reel",
    };
  }
};

// Watch a reel (increment view count)
export const watchReel = async (reelId: number): Promise<ReelResponse> => {
  try {
    const response = await apiClient.post(`reel/watch-reel?id=${reelId}`);
    return response.data;
  } catch (error: any) {
    console.error("Watch reel error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to record view",
    };
  }
};

// Delete a reel
export const deleteReel = async (reelId: number): Promise<ReelResponse> => {
  try {
    const response = await apiClient.post(`reel/delete-reel?id=${reelId}`);
    return response.data;
  } catch (error: any) {
    console.error("Delete reel error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete reel",
    };
  }
};

// Comment on a reel
export const commentReel = async (
  reelId: number,
  comment: string,
): Promise<ReelResponse> => {
  try {
    // Using query param for ID as requested: reel/comment?id=5
    // And sending comment in body
    const response = await apiClient.post(`reel/comment?id=${reelId}`, {
      comment,
    });
    return response.data;
  } catch (error: any) {
    console.error("Comment reel error:", error);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to post comment",
    };
  }
};

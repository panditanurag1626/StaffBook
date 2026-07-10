"use client";

import React, { useState, useEffect } from "react";
import { postService } from "@/lib/api/services/postService";
import PostCard from "@/components/Networking/feed/PostCard";
import { THEME } from "@/styles/theme";
import { FiFileText } from "react-icons/fi";
import { type Post } from "@/data/networking";
import ReelSection from "@/components/shared/ReelSection";

const MyPostsAndReels: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sanitizeUrl = (url: string) => {
        if (!url) return "";
        if (url.includes("http") && url.lastIndexOf("http") > 0) {
            return url.substring(url.lastIndexOf("http"));
        }
        return url;
    };

    const extractItems = (data: any): any[] | null => {
        if (!data) return null;
        if (Array.isArray(data)) return data;
        for (const key of ['post', 'posts', 'items', 'data', 'list']) {
            const candidate = data[key];
            if (candidate?.items) return candidate.items;
            if (Array.isArray(candidate)) return candidate;
        }
        if (data.items) return data.items;
        return null;
    };

    const mapItem = (item: any): Post => ({
        id: String(item.id),
        author: {
            id: String(item.user?.id || item.user_id),
            name: `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim() || "Unknown User",
            avatar: sanitizeUrl(item.user?.picture || "/images/user_profile_placeholder.jpeg"),
            title: item.user?.designation ?? item.user?.employerDetails?.designation ?? "",
            is_premium: item.user?.is_premium || false,
            user_mode_type: item.user?.user_mode_type,
        },
        content: item.title || "",
        media: item.postGallary && item.postGallary.length > 0 ? {
            type: item.postGallary[0].media_type === 2 ? "video" : "image",
            url: sanitizeUrl(item.postGallary[0].filenameUrl),
            alt: item.title || "Post media",
        } : undefined,
        timestamp: item.created_at || "Recently",
        likes: item.total_like || 0,
        comments: item.total_comment || 0,
        shares: item.total_share || 0,
        isLiked: item.is_like,
        view_count: item.view_count || 0,
        connection_status: "connected",
        reposted_by: item.reposted_by || null,
        original_post: item.original_post || null,
    });

    const fetchMyPosts = async () => {
        try {
            setLoadingPosts(true);
            const response = await postService.getMyPosts(1, 20);
            const apiData: any = response.data;
            const items = extractItems(apiData?.data) ?? extractItems(apiData);

            if (items && items.length > 0) {
                setPosts(items.map(mapItem));
            } else {
                setPosts([]);
            }
        } catch (err: any) {
            console.error("Error fetching my posts:", err);
            setError("Failed to load posts");
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
    }, []);

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Reels Grid Section */}
            <div className="flex flex-col gap-4">
                <ReelSection variant="grid" onlyMyReels={true} />
            </div>

            {/* Posts List Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-6">
                    <FiFileText className="text-purple-600 w-5 h-5" />
                    <h3 className="text-lg font-bold text-gray-900">My Posts</h3>
                </div>

                {loadingPosts ? (
                    <div className="space-y-4 px-2 sm:px-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-6 animate-pulse border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/6" />
                                    </div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <div className="flex flex-col gap-4 px-2 sm:px-4">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onPostUpdate={fetchMyPosts} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-100 mx-2 sm:mx-4">
                        <p className="text-gray-500">No posts yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPostsAndReels;

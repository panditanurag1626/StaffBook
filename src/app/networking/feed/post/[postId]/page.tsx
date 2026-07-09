'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PostCard from '@/components/Networking/feed/PostCard';
import apiClient from '@/lib/api/config';
import { Post } from '@/data/networking';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function SinglePostPage() {
  const params = useParams();
  const postId = params?.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Same URL sanitiser used in Networking.tsx
  const sanitizeUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('http') && url.lastIndexOf('http') > 0) {
      return url.substring(url.lastIndexOf('http'));
    }
    return url;
  };

  // Map a raw API item to the Post shape (identical to Networking.tsx)
  const mapItem = (item: any): Post => ({
    id: String(item.id),
    author: {
      id: item.user?.id || item.user_id,
      name: `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.trim() || 'Unknown User',
      avatar: sanitizeUrl(item.user?.picture || '/images/user_profile_placeholder.jpeg'),
      title: item.user?.designation ?? item.user?.employerDetails?.designation ?? '',
      is_premium: item.user?.is_premium || false,
      user_mode_type: item.user?.user_mode_type,
    },
    content: item.title || '',
    media:
      item.postGallary && item.postGallary.length > 0
        ? {
          type: item.postGallary[0].media_type === 2 ? 'video' : 'image',
          url: sanitizeUrl(item.postGallary[0].filenameUrl),
          alt: item.title || 'Post media',
        }
        : undefined,
    timestamp: item.created_at
      ? (() => {
        const date = new Date(item.created_at.replace(' ', 'T'));
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })()
      : 'Recently',
    likes: item.total_like || 0,
    comments: item.total_comment || 0,
    shares: item.total_share || 0,
    isLiked: item.is_like,
    view_count: item.view_count || 0,
    canConnect: false,
    connection_status: item.user?.connection_status || 'not_connected',
    reposted_by: item.reposted_by || null,
    original_post: item.original_post || null,
  });

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the same search-post API, passing the post id to retrieve the specific post
        const response = await apiClient.get('posts/search-post', {
          params: {
            id: postId,
            expand: 'user,user.userLiveDetail,clubDetail.createdByUser,clubDetail.totalJoinedUser',
          },
        });

        const data: any = response.data;
        // API may return items array or a single post — handle both shapes
        const items: any[] =
          data?.data?.post?.items ||
          data?.data?.items ||
          data?.items ||
          (data?.data ? [data.data] : []);

        // Find the post whose id matches postId
        const found = items.find((it: any) => String(it.id) === String(postId));

        if (!found) {
          setError('Post not found.');
          return;
        }

        setPost(mapItem(found));
      } catch (err: any) {
        console.error('Failed to fetch post:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return (
    <div className="min-h-screen bg-gray-50 pt-[70px]">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href="/networking"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium mb-5 transition-colors"
        >
          <FiArrowLeft size={16} />
          Back to Feed
        </Link>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-xl p-6 animate-pulse shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/5" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-48 bg-gray-200 rounded-xl mt-4" />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Post */}
        {!loading && post && <PostCard post={post} />}
      </div>
    </div>
  );
}

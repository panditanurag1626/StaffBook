'use client'
import React, { useState, useEffect } from 'react';
import CreatePostWidget from './feed/CreatePostWidget';
import PostCard from './feed/PostCard';
import { THEME } from '../../styles/theme';
import StorySection from '../shared/StorySection';
import MobileMapCard from './MobileMapCard';
import { postService } from '../../lib/api/services/postService';
import { storyService } from '../../lib/api/services/storyService';
import ReelSection from "../shared/ReelSection";
import SponsoredBanner from "./feed/SponsoredBanner";

interface NetworkingProps {
  onToggleSidebar?: () => void;
}

const Networking: React.FC<NetworkingProps> = ({ onToggleSidebar }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts from API
  const fetchPosts = async (pageNum: number = 1) => {
    try {
      setLoading(true);

      // Debug: Check if we're on client and have token
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
      }

      const response = await postService.getPosts(pageNum);

      // The API returns data in response.data.data.post.items
      // response is an axios response, so response.data is the API response body
      const apiData: any = response.data;
      const postsData = apiData?.data?.post;

      if (postsData && postsData.items) {

        // Helper to sanitize double URLs if they occur from backend
        const sanitizeUrl = (url: string) => {
          if (!url) return '';
          // If URL contains another full URL inside it, take the last one
          if (url.includes('http') && url.lastIndexOf('http') > 0) {
            return url.substring(url.lastIndexOf('http'));
          }
          return url;
        };

        // Map API data to match Post interface expected by PostCard
        const mappedPosts = postsData.items.map((item: any) => ({
          id: item.id,
          author: {
            id: item.user?.id || item.user_id,
            name: `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.trim() || 'Unknown User',
            avatar: sanitizeUrl(item.user?.picture || '/images/user_profile_placeholder.jpeg'),
            title: item.user?.designation ?? item.user?.employerDetails?.designation ?? "",
            is_premium: item.user?.is_premium || false,
            user_mode_type: item.user?.user_mode_type,
            headline: item.user?.headline || '',
            location: item.user?.location || '',
            bio: item.user?.bio || '',
            experience: item.user?.experience || [],
          },
          content: item.title || '',
          media: item.postGallary && item.postGallary.length > 0 ? {
            type: item.postGallary[0].media_type === 2 ? 'video' : 'image',
            url: sanitizeUrl(item.postGallary[0].filenameUrl),
            alt: item.title || 'Post media'
          } : undefined,
          timestamp: item.created_at ? (() => {
            // API returns date as string like "2025-01-23 19:03:52"
            const date = new Date(item.created_at.replace(' ', 'T'));
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          })() : 'Recently',
          likes: item.total_like || 0,
          comments: item.total_comment || 0,
          shares: item.total_share || 0,
          isLiked: item.is_like,
          view_count: item.view_count || 0,
          canConnect: false, // You can add logic here based on connection status
          connection_status: item.user.connection_status || 'not_connected',
          reposted_by: item.reposted_by || null,
          original_post: item.original_post || null
        }));

        if (pageNum === 1) {
          setPosts(mappedPosts);
        } else {
          setPosts(prev => [...prev, ...mappedPosts]);
        }

        // Check if there are more pages
        setHasMore(postsData._meta?.pageCount > pageNum);
      } else {
        // No posts logic handled in UI
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPosts(1);
  }, []);

  // Handle post creation
  const handlePostCreated = () => {

    // Refresh posts after creating a new one
    fetchPosts(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  return (
    <div className={`flex flex-col w-full gap-2`}>
      {/* Stories Section */}
      <StorySection variant="circle" />

      {/* Create Post Section */}
      <CreatePostWidget onPostCreated={handlePostCreated} />

      {/* Mobile Map Card Widget */}
      <div className="lg:hidden mt-1 mb-2">
        <MobileMapCard />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Posts Feed */}
      <div className={`space-y-2`}>
        {loading && page === 1 ? (
          // Loading skeleton for initial load
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <PostCard post={post} onPostUpdate={() => fetchPosts(1)} />
                {/* Inject Reel Section after 4th post (index 3) */}
                {index === 3 && (
                  <div className="py-2">
                    <ReelSection variant="rect" />
                  </div>
                )}
                {/* Inject Premium Employers after 8th post (index 7) */}
                {index === 7 && (
                  <SponsoredBanner />
                )}
              </React.Fragment>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className={`${THEME.components.button.primary} px-6 py-2 rounded-xl disabled:opacity-50`}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          // No posts message
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>


    </div>
  );
};

export default Networking;
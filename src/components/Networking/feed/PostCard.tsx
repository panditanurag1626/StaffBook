'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FiMoreVertical, FiPlay, FiHeart, FiMessageCircle, FiShare2, FiSend, FiUserPlus, FiRepeat, FiX, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { Post } from '../../../data/networking';
import { SITE_CONFIG } from '../../../constants/siteconfig';
import PostActionsModal from './PostActionsModal';
import { THEME } from '../../../styles/theme';
import Card from '../../shared/Card';
import ConnectButton from '../../shared/ConnectButton';
import { likePost, unlikePost, repostPost, getPostComments, createComment } from '../../../lib/api/services/postService';
import { type PostComment } from '../../../lib/api/types/post.types';
import { useAuth } from '../../../context/AuthContext';
import { deleteComment as apiDeleteComment } from '../../../lib/api/services/postService';
import { connectionService } from '../../../lib/api/services/connectionService';
import { sendNotificationToUser, notifyPostInteraction } from '../../../lib/firebaseNotifications';
import toast from 'react-hot-toast';
import { db } from '../../../lib/firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { FaRegShareSquare } from 'react-icons/fa';
import { Share } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onPostUpdate?: () => void;
}

const UserOnlineStatus: React.FC<{ userId: string | number; size?: 'sm' | 'md' }> = ({ userId, size = 'md' }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const onlineRef = dbRef(db, `users/${userId}/is_online`);
    const unsub = onValue(onlineRef, (snapshot) => {
      setIsOnline(!!snapshot.val());
    });
    return () => unsub();
  }, [userId]);

  const dotSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 ${dotSize} ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full z-10`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdate }) => {
  const [showActionsModal, setShowActionsModal] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Hover popup state
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHoverCard = (userId: string) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredUserId(userId);
    }, 300);
  };

  const hideHoverCard = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredUserId(null);
    }, 300);
  };

  // Content states
  const [isExpanded, setIsExpanded] = useState(false);

  // Video states
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const wasPausedByScrollRef = React.useRef(false);
  const isScrollingPauseRef = React.useRef(false);

  const handleVolumeChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video && !video.muted && video.volume === 0) {
      video.volume = 0.5;
    }
  };

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || post.media?.type !== 'video') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Resume video if it was automatically paused by scroll
            if (wasPausedByScrollRef.current) {
              videoEl.play().catch((err) => {
                console.log("Autoplay resume prevented:", err);
              });
              wasPausedByScrollRef.current = false;
            }
          } else {
            // Auto pause playing video when it goes out of view
            if (!videoEl.paused) {
              isScrollingPauseRef.current = true;
              wasPausedByScrollRef.current = true;
              videoEl.pause();
            }
          }
        });
      },
      { threshold: 0.5 } // 50% visibility
    );

    observer.observe(videoEl);
    return () => {
      observer.unobserve(videoEl);
    };
  }, [post.media?.url]);

  // Interaction states
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [sharesCount, setSharesCount] = useState(post.shares);

  // Comment section states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user } = useAuth();

  // Repost section states
  const [submittingRepost, setSubmittingRepost] = useState(false);

  // Connect states
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>(post.connection_status || 'not_connected');

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Format connection_status for display: remove underscores, capitalise first word
  const formatConnectionStatus = (status: string) => {
    if (status === 'not_connected') return '+ Connect';
    if (status === 'sent_connection') return 'Connection Requested';
    if (status === 'received_connection') return 'Connection Received';
    const words = status.replace(/_/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  };

  useEffect(() => {
    setIsLiked(post.isLiked || false);
    setLikesCount(post.likes);
    setCommentsCount(post.comments);
    setSharesCount(post.shares);
  }, [post]);

  const handleShare = () => {
    setShowShareModal(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    const url = `https://staffbook.in/networking/feed/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    setIsLiked(!prevLiked);
    // adjust count locally first
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      let res;
      if (prevLiked) {
        res = await unlikePost(parseInt(post.id));
      } else {
        res = await likePost(parseInt(post.id));
      }

      // Update count from response if available
      if (res?.data?.data?.total_like !== undefined) {
        setLikesCount(res.data.data.total_like);
      }

      // Send Notification on like
      if (!prevLiked && user?.id && String(user.id) !== String(post.author.id)) {
        notifyPostInteraction(post.author.id, Number(user.id), `${user.first_name} ${user.last_name}`, user.picture || '', 'liked', post.id);
      }
    } catch (error: any) {
      console.error("Failed to toggle like", error);
      let errMsg = "Failed to toggle like";
      if (error?.response?.data?.data?.errors?.message?.[0]) {
        errMsg = error.response.data.data.errors.message[0];
      } else if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
      // Revert
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const submitRepost = async () => {
    setSubmittingRepost(true);
    try {
      await repostPost({ post_id: parseInt(post.id) });
      toast.success("Post reposted successfully!");
      if (onPostUpdate) onPostUpdate();

      if (user?.id && String(user.id) !== String(post.author.id)) {
        notifyPostInteraction(post.author.id, Number(user.id), `${user.first_name} ${user.last_name}`, user.picture || '', 'reposted', post.id);
      }
    } catch (error: any) {
      console.error("Failed to repost", error);
      let errMsg = "Failed to repost. Please try again.";
      if (error?.response?.data?.data?.errors?.message?.[0]) {
        errMsg = error.response.data.data.errors.message[0];
      } else if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setSubmittingRepost(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setShowComments(true);
      fetchComments();
    } else {
      setShowComments(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res: any = await getPostComments(parseInt(post.id));
      if (res.data?.data?.comment?.items) {
        setComments(res.data.data.comment.items);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await createComment({ post_id: parseInt(post.id), comment: newComment });
      setNewComment("");
      // Refresh comments only
      fetchComments();
      setCommentsCount(prev => prev + 1);

      if (user?.id && String(user.id) !== String(post.author.id)) {
        notifyPostInteraction(post.author.id, Number(user.id), `${user.first_name} ${user.last_name}`, user.picture || '', 'commented on', post.id);
      }
    } catch (error: any) {
      console.error("Failed to add comment", error);
      let errMsg = "Failed to add comment";
      if (error?.response?.data?.data?.errors?.message?.[0]) {
        errMsg = error.response.data.data.errors.message[0];
      } else if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await apiDeleteComment(parseInt(post.id), commentId);
        // Refresh comments only
        fetchComments();
        setCommentsCount(prev => Math.max(0, prev - 1));
      } catch (error: any) {
        console.error("Failed to delete comment", error);
        let errMsg = "Failed to delete comment";
        if (error?.response?.data?.data?.errors?.message?.[0]) {
          errMsg = error.response.data.data.errors.message[0];
        } else if (error?.response?.data?.message) {
          errMsg = error.response.data.message;
        } else if (error?.message) {
          errMsg = error.message;
        }
        toast.error(errMsg);
      }
    }
  };

  const handleConnect = async () => {
    if (connectionStatus !== 'not_connected') return;
    if (!user?.id || !post.author.id) {
      if (!user?.id) toast.error("Please login to connect.");
      return;
    }

    setIsConnecting(true);
    try {
      const res: any = await connectionService.sendConnectionRequest(
        user.id,
        parseInt(post.author.id.toString())
      );

      if (res.status === 200 || res.status === 201 || res.success) {
        if (user) {
          await sendNotificationToUser(
            parseInt(post.author.id.toString()),
            Number(user.id),
            `${user.first_name} ${user.last_name}`,
            user.picture || '',
            'connection_request',
            `${user.first_name} ${user.last_name} sent you a connection request.`
          );
        }
        toast.success("Connection request sent successfully!");
        setConnectionStatus('sent_connection');
      } else {
        toast.error(res.message || "Failed to send connection request");
      }
    } catch (error: any) {
      console.error("Connection request error:", error);
      let errMsg = "Failed to send connection request";
      if (error?.response?.data?.data?.errors?.message?.[0]) {
        errMsg = error.response.data.data.errors.message[0];
      } else if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <Card className="" noPadding>
        {/* Reposted By Banner */}
        {post.reposted_by && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1 border-b border-gray-50">
            <FiRepeat size={13} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 font-medium">
              {post.reposted_by.first_name} {post.reposted_by.last_name} reposted this
            </span>
          </div>
        )}
        <div className="p-3 sm:p-4">
          {/* Post Header */}
          <Card.Header className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href={`/user/${post.author.id}`}>
                <div className="relative">
                  {post.author.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${THEME.colors.gradient.sky} flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:opacity-80 transition-opacity`}>
                      {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  {post.author.user_mode_type && post.author.user_mode_type !== 'None' && (
                    <div className="absolute inset-[-4px] z-20 pointer-events-none rotate-45">
                      <Image
                        src={post.author.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                        alt={post.author.user_mode_type}
                        fill
                        className="object-contain drop-shadow-md -rotate-[15deg]"
                      />
                    </div>
                  )}
                  <UserOnlineStatus userId={post.author.id} />
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-1">
                  <div
                    className="relative"
                    onMouseEnter={() => showHoverCard(post.author.id?.toString() || '')}
                    onMouseLeave={hideHoverCard}
                  >
                    <Link href={`/user/${post.author.id}`} className="hover:underline">
                      <h3 className="text-sm font-semibold text-gray-700">{post.author.name}</h3>
                    </Link>
                    {hoveredUserId === post.author.id?.toString() && (
                      <div
                        onMouseEnter={() => showHoverCard(post.author.id?.toString() || '')}
                        onMouseLeave={hideHoverCard}
                        className="absolute top-full left-0 mt-1 z-50 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={post.author.avatar || '/images/user_profile_placeholder.jpeg'}
                              alt={post.author.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-sm font-bold text-gray-900">{post.author.name}</h5>
                            {post.author.title && (
                              <p className="text-xs text-gray-600 mt-0.5">{post.author.title}</p>
                            )}
                            {post.author.headline && (
                              <p className="text-xs text-gray-500 mt-0.5">{post.author.headline}</p>
                            )}
                            {post.author.location && (
                              <p className="text-xs text-gray-400 mt-0.5">{post.author.location}</p>
                            )}
                            {post.author.experience && post.author.experience.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {post.author.experience[0].title} at {post.author.experience[0].company_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {connectionStatus === 'not_connected' && user?.id?.toString() !== post.author.id?.toString() && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleConnect(); }}
                              className="w-full py-1.5 text-xs font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                            >
                              Connect
                            </button>
                          )}
                          {connectionStatus === 'connected' && (
                            <span className="block w-full py-1.5 text-xs font-semibold text-center text-gray-500 bg-gray-100 rounded-full">
                              Connected
                            </span>
                          )}
                          {(connectionStatus === 'sent_connection' || connectionStatus === 'received_connection') && (
                            <span className="block w-full py-1.5 text-xs font-semibold text-center text-gray-500 bg-gray-100 rounded-full">
                              {formatConnectionStatus(connectionStatus)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {post.author.is_premium && (
                    <Image
                      src="/staffbook-premium.png"
                      alt="Premium"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  )}
                </div>
                <p className={`${THEME.components.typography.meta} text-[10px]`}>{post.timestamp}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {user?.id?.toString() !== post.author.id?.toString() && (
                <button
                  className={`px-2 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-1 border ${connectionStatus === 'not_connected' && !isConnecting
                    ? 'text-gray-900 border-gray-700 hover:border-gray-800 hover:bg-gray-100 cursor-pointer'
                    : 'text-gray-900 border-gray-600 bg-gray-50 cursor-default pointer-events-none opacity-80'
                    }`}
                  onClick={handleConnect}
                  disabled={connectionStatus !== 'not_connected' || isConnecting}
                >
                  {isConnecting ? (
                    <span className="w-3 h-3 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    formatConnectionStatus(connectionStatus)
                  )}
                </button>
              )}
              <button
                ref={buttonRef}
                className={THEME.components.button.icon}
                onClick={() => setShowActionsModal(true)}
              >
                <FiMoreVertical className="w-6 h-6 sm:w-4 sm:h-4 text-gray-900" />
              </button>
            </div>
          </Card.Header>

          {/* Post Content */}
          <Card.Content className="mb-2 sm:mb-3">
            <div
              className={`${THEME.components.typography.body} break-words whitespace-pre-wrap`}
              dangerouslySetInnerHTML={{
                __html: isExpanded || !post.content || post.content.length <= 250
                  ? post.content
                  : `${post.content.slice(0, 250)}...`
              }}
            />
            {post.content && post.content.length > 250 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm ml-1 hover:underline focus:outline-none"
              >
                {isExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </Card.Content>

          {/* Post Media */}
          {post.media && post.media.url && (
            <Card.ImageContainer className="mb-2 sm:mb-3">
              {post.media.type === 'video' ? (
                <div className="relative group">
                  <video
                    ref={videoRef}
                    src={post.media.url}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg bg-black/5"
                    onPlay={() => {
                      setIsPlaying(true);
                      wasPausedByScrollRef.current = false;
                    }}
                    onPause={() => {
                      setIsPlaying(false);
                      if (!isScrollingPauseRef.current) {
                        wasPausedByScrollRef.current = false; // User manually paused
                      }
                      isScrollingPauseRef.current = false; // Reset trigger ref
                    }}
                    onVolumeChange={handleVolumeChange}
                    playsInline
                    controls
                  />
                </div>
              ) : (
                <Image
                  src={post.media.url}
                  alt={post.media.alt || 'Post image'}
                  width={800}
                  height={800}
                  style={{ width: '100%', height: 'auto' }}
                  className="max-h-[70vh] object-contain rounded-lg bg-black/5"
                />
              )}
            </Card.ImageContainer>
          )}

          {/* Post Actions */}
          <Card.Footer className="pt-2 sm:pt-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Like */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-0.5 sm:gap-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                >
                  <FiHeart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium text-gray-700">{likesCount}</span>
                  <span className="text-sm font-medium text-gray-700">Like</span>
                </button>

                {/* Comment */}
                <button
                  onClick={toggleComments}
                  className="flex items-center gap-0.5 sm:gap-1 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <FiMessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-sm font-medium text-gray-700">{commentsCount} Comments</span>
                </button>

                {/* Repost */}
                {post.author.id?.toString() !== user?.id?.toString() && (
                  <button
                    onClick={submitRepost}
                    className="flex items-center gap-0.5 sm:gap-1 text-gray-600 hover:text-purple-500 transition-colors"
                    title="Repost"
                  >
                    <FiRepeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-sm font-medium text-gray-700">{sharesCount} Repost</span>
                  </button>
                )}

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-0.5 sm:gap-1 text-gray-600 hover:text-green-500 transition-colors"
                  title="Share"
                >
                  <Share className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-sm font-medium text-gray-700">Share</span>
                </button>
              </div>
            </div>
          </Card.Footer>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                {loadingComments ? (
                  <p className="text-center text-xs text-gray-500">Loading comments...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                          {/* Fallback avatar logic */}
                          {comment.user ? (
                            <img src={comment.user.picture || comment.user.image || "/images/user_profile_placeholder.jpeg"} alt={comment.user.first_name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-300" />
                          )}
                        </div>
                        {comment.user?.id && <UserOnlineStatus userId={comment.user.id} size="sm" />}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-2 text-xs relative">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-800">
                            {comment.user ? `${comment.user.first_name} ${comment.user.last_name || ''}` : 'User'}
                          </p>
                          {user && comment.user && String(user.id) === String(comment.user.id) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-500 p-1 transition-opacity"
                              title="Delete comment"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-600 pr-4">{comment.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-gray-400">No comments yet. Be the first!</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-black focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-500"
                  disabled={submittingComment}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingComment ? (
                    <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin block"></span>
                  ) : (
                    <FiSend size={18} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Post Actions Modal */}
      <PostActionsModal
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        postId={post.id}
        authorId={post.author.id}
        buttonRef={buttonRef}
        onPostUpdate={onPostUpdate}
        initialContent={post.content}
      />

      {/* Share Modal */}
      {mounted && showShareModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Share className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Share Post</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* URL Box */}
            <p className="text-xs text-gray-500 mb-2 font-medium">Post link</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-4">
              <span className="flex-1 text-xs text-gray-700 truncate font-mono">
                {`https://staffbook.in/networking/feed/post/${post.id}`}
              </span>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyLink}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${copied
                ? 'bg-green-500 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PostCard;


"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiX,
  FiSend,
  FiHeart,
  FiTrash2,
  FiShare2,
  FiMessageCircle,
  FiEye,
} from "react-icons/fi";
import { THEME } from "@/styles/theme";
import StoryUploadModal from "../Networking/StoryUploadModal";
import { storyService, type Story } from "@/lib/api/services/storyService";
import { useAuth } from "@/context/AuthContext";
import { EyeIcon, Plus } from "lucide-react";
import toast from 'react-hot-toast';
import Link from "next/link";

type StoryItem = {
  storyId: number;
  type: 1 | 2; // 1: image, 2: video
  imageUrl?: string;
  videoUrl?: string;
  durationMs: number;
  createdAt?: string;
  description?: string;
  isLiked?: boolean;
  totalLikes?: number;
  totalComments?: number;
  totalViews?: number;
};

type StoryProfile = {
  key: string;
  name: string;
  img: string;
  isYourStory?: boolean;
  hasPostedStory?: boolean;
  hasViewedStory?: boolean;
  userId?: number;
  user_mode_type?: string | null;
};

const FALLBACK_PROFILE_IMG = "/images/user_profile_placeholder.jpeg";
const YOUR_STORY_KEY = "your-story";
const DEFAULT_STORY_DURATION_MS = 15000;

// Helper to format timestamp as relative time (e.g., "2h ago")
const formatTimeAgo = (timestamp: number | string | undefined): string => {
  if (!timestamp) return "";
  let ts = 0;

  if (typeof timestamp === "string") {
    if (/^\d+$/.test(timestamp)) {
      ts = parseInt(timestamp, 10);
    } else {
      const safeDateStr = timestamp.includes(" ") && !timestamp.includes("T") ? timestamp.replace(" ", "T") : timestamp;
      ts = Math.floor(Date.parse(safeDateStr) / 1000);
    }
  } else {
    ts = timestamp;
  }

  if (ts > 10000000000) {
    ts = Math.floor(ts / 1000);
  }

  if (!ts || ts <= 0 || isNaN(ts)) return "";

  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
};

interface StorySectionProps {
  variant?: "circle" | "rect";
}

const StorySection: React.FC<StorySectionProps> = ({ variant = "rect" }) => {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  const [selectedStoryKey, setSelectedStoryKey] = useState<string | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [allStories, setAllStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [viewedUserIds, setViewedUserIds] = useState<Record<number, true>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [likesList, setLikesList] = useState<any[]>([]);
  const [isLiking, setIsLiking] = useState(false);
  const [localStoryStats, setLocalStoryStats] = useState<Record<number, { isLiked: boolean; totalLikes: number; totalComments: number; totalViews: number }>>({});
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentDuration, setCurrentDuration] = useState(DEFAULT_STORY_DURATION_MS);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const isTimerPaused = showComments || showSharePopup || showOptionsMenu || showLikes || isManuallyPaused || showReportModal;



  useEffect(() => {
    if (videoRef.current) {
      if (isTimerPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => { });
      }
    }
  }, [isTimerPaused, currentStoryIndex, showStoryModal]);



  const fetchStories = async () => {
    setStoriesLoading(true);
    setStoriesError(null);
    try {
      const res = await storyService.getStories(1);
      const items = res.data?.story ?? [];
      setAllStories(items);
      if (!items.length && res.message) {
        // Only set error if we actually failed or got an empty list unexpectedly
        // setStoriesError(res.message);
      }
    } catch (e: any) {
      setStoriesError(e?.message || "Failed to fetch stories");
      setAllStories([]);
    } finally {
      setStoriesLoading(false);
    }
  };

  const fetchMyStories = async () => {
    try {
      const res = await storyService.getMyActiveStory();
      const items = res.data?.story?.items ?? [];
      setMyStories(items);
    } catch {
      setMyStories([]);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (currentUserId != null) {
      fetchMyStories();
    } else {
      setMyStories([]);
    }
  }, [currentUserId]);

  const { profiles, storyDataByKey } = useMemo(() => {
    const grouped = new Map<number, Story[]>();
    for (const user of allStories) {
      if (currentUserId != null && user.id === currentUserId) continue;

      const userStories = Array.isArray((user as any).userStory) ? (user as any).userStory : [];
      if (userStories.length === 0) continue;

      const userId = user.id;
      if (!grouped.has(userId)) grouped.set(userId, []);
      userStories.forEach((st: any) => {
        // Embed user details into each story to preserve compatibility
        st.user = user;
        grouped.get(userId)!.push(st);
      });
    }

    // Sort stories per user by created_at desc
    for (const [userId, items] of grouped.entries()) {
      grouped.set(
        userId,
        [...items].sort((a, b) => {
          const ta = typeof a.created_at === 'string' ? parseInt(a.created_at) : (a.created_at || 0);
          const tb = typeof b.created_at === 'string' ? parseInt(b.created_at) : (b.created_at || 0);
          return tb - ta;
        }),
      );
    }

    const apiProfiles: StoryProfile[] = Array.from(grouped.entries()).map(
      ([userId, items]) => {
        const first = items[0];
        const firstName = first?.user?.first_name?.trim() || "";
        const lastName = first?.user?.last_name?.trim() || "";
        const name = `${firstName} ${lastName}`.trim() || `User ${userId}`;
        const img = first?.user?.picture || first?.user?.image || FALLBACK_PROFILE_IMG;
        return {
          key: String(userId),
          userId,
          name,
          img,
          hasPostedStory: true,
          hasViewedStory: !!viewedUserIds[userId],
          user_mode_type: first?.user?.user_mode_type || null,
        };
      },
    );

    // Sort users by latest story time
    apiProfiles.sort((a, b) => {
      const aStory = grouped.get(a.userId || -1)?.[0];
      const bStory = grouped.get(b.userId || -1)?.[0];
      const ta = typeof aStory?.created_at === 'string' ? parseInt(aStory.created_at) : (aStory?.created_at || 0);
      const tb = typeof bStory?.created_at === 'string' ? parseInt(bStory.created_at) : (bStory?.created_at || 0);
      return tb - ta;
    });

    const storyData: Record<string, StoryItem[]> = {};
    for (const p of apiProfiles) {
      const items = grouped.get(p.userId!) || [];
      storyData[p.key] = items.map((story: any) => {
        return {
          storyId: story.id,
          type: story.type,
          imageUrl: story.imageUrl || story.image, // Fallback if image holds the url
          videoUrl: story.videoUrl || story.video,
          durationMs: DEFAULT_STORY_DURATION_MS,
          createdAt: story.created_at?.toString(),
          description: story.description,
          isLiked: story.is_liked,
          totalLikes: story.total_likes,
          totalComments: story.total_comments,
          totalViews: story.total_views,
        };
      });
    }

    // "Your Story" from myStories
    const yourStoryImg = user?.picture || user?.image || FALLBACK_PROFILE_IMG;
    const yourStoryItems: StoryItem[] = myStories.map((story) => {
      return {
        storyId: story.id,
        type: story.type,
        imageUrl: story.imageUrl || story.image,
        videoUrl: story.videoUrl || story.video,
        durationMs: DEFAULT_STORY_DURATION_MS,
        createdAt: story.created_at?.toString(),
        description: story.description,
        isLiked: (story as any).is_liked,
        totalLikes: (story as any).total_likes,
        totalComments: (story as any).total_comments,
        totalViews: (story as any).total_views,
      };
    });
    storyData[YOUR_STORY_KEY] = yourStoryItems;

    const merged: StoryProfile[] = [
      {
        key: YOUR_STORY_KEY,
        name: "Your Story",
        img: yourStoryImg,
        isYourStory: true,
        hasPostedStory: myStories.length > 0,
        userId: currentUserId ?? undefined,
        user_mode_type: user?.user_mode_type || null,
      },
      ...apiProfiles,
    ];

    return { profiles: merged, storyDataByKey: storyData };
  }, [allStories, myStories, user, viewedUserIds]);

  const selectedProfile = selectedStoryKey
    ? profiles.find((p) => p.key === selectedStoryKey)
    : undefined;
  const currentStories = selectedStoryKey
    ? (storyDataByKey[selectedStoryKey] ?? [])
    : [];
  const currentStory = currentStories[currentStoryIndex];

  useEffect(() => {
    setCurrentDuration(currentStories[currentStoryIndex]?.durationMs ?? DEFAULT_STORY_DURATION_MS);
  }, [currentStoryIndex, selectedStoryKey, currentStories]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, []);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const handleStoryClick = (profileKey: string) => {
    if (profileKey === YOUR_STORY_KEY) {
      if (storyDataByKey[YOUR_STORY_KEY]?.length) {
        setSelectedStoryKey(YOUR_STORY_KEY);
        setShowStoryModal(true);
        setCurrentStoryIndex(0);
        setProgress(0);
      } else {
        setShowUploadModal(true);
      }
      return;
    }

    if (storyDataByKey[profileKey]?.length) {
      const profile = profiles.find((p) => p.key === profileKey);
      if (profile?.userId) {
        setViewedUserIds((prev) => ({ ...prev, [profile.userId!]: true }));
      }
      setSelectedStoryKey(profileKey);
      setShowStoryModal(true);
      setCurrentStoryIndex(0);
      setProgress(0);

      // View first story immediately
      const firstStory = storyDataByKey[profileKey]?.[0];
      if (firstStory) {
        try {
          storyService.viewStory(firstStory.storyId);
        } catch (e) { }
      }
    }
  };

  const closeStoryModal = () => {
    setShowStoryModal(false);
    setSelectedStoryKey(null);
    setShowOptionsMenu(false);
    setShowComments(false);
    setShowSharePopup(false);
    setShowLikes(false);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsManuallyPaused(false);
  };

  const validProfiles = profiles.filter(
    (p) => p.isYourStory || (storyDataByKey[p.key]?.length ?? 0) > 0,
  );

  const currentIndex = selectedStoryKey
    ? validProfiles.findIndex((p) => p.key === selectedStoryKey)
    : -1;
  const prevUser1 = currentIndex > 0 ? validProfiles[currentIndex - 1] : null;
  const prevUser2 = currentIndex > 1 ? validProfiles[currentIndex - 2] : null;
  const nextUser1 = currentIndex < validProfiles.length - 1 ? validProfiles[currentIndex + 1] : null;
  const nextUser2 = currentIndex < validProfiles.length - 2 ? validProfiles[currentIndex + 2] : null;

  const nextStory = () => {
    if (selectedStoryKey && storyDataByKey[selectedStoryKey]) {
      const stories = storyDataByKey[selectedStoryKey] || [];
      if (currentStoryIndex < stories.length - 1) {
        const nextIdx = currentStoryIndex + 1;
        setCurrentStoryIndex(nextIdx);
        setProgress(0);
        const story = stories[nextIdx];
        if (story) {
          try { storyService.viewStory(story.storyId); } catch (e) { }
        }
      } else if (nextUser1) {
        handleStoryClick(nextUser1.key);
      } else {
        closeStoryModal();
      }
    } else {
      closeStoryModal();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      const prevIdx = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIdx);
      setProgress(0);
      const stories = storyDataByKey[selectedStoryKey!] || [];
      const story = stories[prevIdx];
      if (story) {
        try { storyService.viewStory(story.storyId); } catch (e) { }
      }
    } else if (prevUser1) {
      handleStoryClick(prevUser1.key);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (showStoryModal && selectedStoryKey && !isTimerPaused) {
      const durationMs = currentDuration;
      const tickMs = 100;
      const increment = 100 / Math.max(1, durationMs / tickMs);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + increment;
        });
      }, tickMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showStoryModal, selectedStoryKey, currentStoryIndex, currentStories.length, isTimerPaused, currentDuration]);

  const getPreviewImage = (profileKey: string, profileImg: string) => {
    if (profileKey === YOUR_STORY_KEY && myStories.length === 0) return profileImg || FALLBACK_PROFILE_IMG;
    const stories = storyDataByKey[profileKey];
    const first = stories?.[0];
    return first?.imageUrl || first?.videoUrl || profileImg || FALLBACK_PROFILE_IMG;
  };

  const isOwner = selectedProfile?.userId === currentUserId || selectedProfile?.isYourStory;

  const handleFetchComments = async () => {
    if (!currentStory) return;
    try {
      const resp = await storyService.getStoryComments(currentStory.storyId);
      if (resp?.data?.comments) {
        setCommentsList(resp.data.comments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showComments) handleFetchComments();
  }, [showComments, currentStoryIndex]);

  const handleFetchLikes = async () => {
    if (!currentStory) return;
    try {
      const resp = await storyService.getStoryLikes(currentStory.storyId);
      if (resp?.data?.users) {
        setLikesList(resp.data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showLikes) handleFetchLikes();
  }, [showLikes, currentStoryIndex]);

  const handleLikeToggle = async () => {
    if (!currentStory || isLiking) return;
    const sid = currentStory.storyId;
    setIsLiking(true);
    const currStat = localStoryStats[sid] || {
      isLiked: currentStory.isLiked || false,
      totalLikes: currentStory.totalLikes || 0,
      totalComments: currentStory.totalComments || 0,
      totalViews: currentStory.totalViews || 0
    };
    const newLiked = !currStat.isLiked;

    setLocalStoryStats((prev) => ({
      ...prev,
      [sid]: {
        ...currStat,
        isLiked: newLiked,
        totalLikes: Math.max(0, currStat.totalLikes + (newLiked ? 1 : -1))
      }
    }));

    try {
      if (newLiked) await storyService.likeStory(sid);
      else await storyService.unlikeStory(sid);
    } catch (e) {
      setLocalStoryStats((prev) => ({ ...prev, [sid]: currStat }));
    } finally {
      setIsLiking(false);
    }
  };

  const handlePostComment = async () => {
    if (!currentStory || !commentText.trim()) return;
    try {
      await storyService.addComment(currentStory.storyId, commentText);
      setCommentText('');
      handleFetchComments();
      const sid = currentStory.storyId;
      const currStat = localStoryStats[sid] || {
        isLiked: currentStory.isLiked || false,
        totalLikes: currentStory.totalLikes || 0,
        totalComments: currentStory.totalComments || 0,
        totalViews: currentStory.totalViews || 0
      };
      setLocalStoryStats((prev) => ({
        ...prev,
        [sid]: {
          ...currStat,
          totalComments: currStat.totalComments + 1
        }
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (cid: number) => {
    try {
      await storyService.deleteComment(cid);
      setCommentsList((prev) => prev.filter((c) => c.id !== cid));
      const sid = currentStory!.storyId;
      const currStat = localStoryStats[sid] || {
        isLiked: currentStory!.isLiked || false,
        totalLikes: currentStory!.totalLikes || 0,
        totalComments: currentStory!.totalComments || 0,
        totalViews: currentStory!.totalViews || 0
      };
      setLocalStoryStats((prev) => ({
        ...prev,
        [sid]: {
          ...currStat,
          totalComments: Math.max(0, currStat.totalComments - 1)
        }
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const currentStat = currentStory ? (localStoryStats[currentStory.storyId] || {
    isLiked: currentStory.isLiked || false,
    totalLikes: currentStory.totalLikes || 0,
    totalComments: currentStory.totalComments || 0,
    totalViews: currentStory.totalViews || 0
  }) : null;

  const handleDeleteStory = async () => {
    if (!currentStory || isDeleting) return;
    setIsDeleting(true);
    try {
      await storyService.deleteStory(currentStory.storyId);
      // Refresh
      await Promise.all([fetchStories(), fetchMyStories()]);
      // If we deleted the last story of the user, close or go next
      if (currentStories.length === 1) {
        closeStoryModal();
      } else {
        nextStory();
        setShowOptionsMenu(false);
      }
    } catch (err) {
      console.error("Failed to delete story", err);
      setShowOptionsMenu(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportStory = async () => {
    if (!currentStory || !reportReason.trim() || isReporting) return;
    setIsReporting(true);
    try {
      await storyService.reportStory(currentStory.storyId, reportReason);
      toast.success("Story reported successfully");
      setShowReportModal(false);
      setReportReason("");
      setShowOptionsMenu(false);
    } catch (err: any) {
      console.error("Failed to report story", err);
      const errorMsg =
        err?.response?.data?.data?.errors?.message?.[0] ||
        err?.response?.data?.message ||
        "Failed to report story";
      toast.error(errorMsg);
    } finally {
      setIsReporting(false);
    }
  };

  const displayedProfiles = variant === "rect"
    ? profiles.filter((p) => !p.isYourStory)
    : profiles;

  return (
    <>
      <section className={`w-full ${THEME.components.card.default} flex justify-center relative !p-0 overflow-hidden`}>
        <div className="relative w-full max-w-full z-10 py-4">
          {variant === "rect" && (
            <div className="px-4 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-gray-700">Stories</h3>
                {storiesLoading && <span className="text-xs text-gray-500">Loading…</span>}
                {!storiesLoading && storiesError && <span className="text-xs text-red-600">{storiesError}</span>}
              </div>
            </div>
          )}

          {showLeftArrow && (
            <button onClick={scrollLeft} className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100">
              <FiChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {showRightArrow && (
            <button onClick={scrollRight} className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100">
              <FiChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div ref={scrollContainerRef} onScroll={checkScrollPosition} className="w-full flex items-center overflow-x-auto px-4 space-x-4 scrollbar-hide">
            {displayedProfiles.map((profile) => (
              <div
                key={profile.key}
                className={`flex-shrink-0 select-none cursor-pointer group relative ${variant === "rect" ? "w-32 h-56 rounded-xl overflow-hidden" : "flex flex-col items-center min-w-[96px]"}`}
                onClick={() => handleStoryClick(profile.key)}
              >
                {variant === "circle" ? (
                  <>
                    <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${profile.isYourStory && profile.hasPostedStory
                      ? "bg-gradient-to-tr from-[#7c3aed] via-[#9333ea] to-[#c084fc]"
                      : profile.isYourStory && !profile.hasPostedStory
                        ? "bg-gray-100"
                        : profile.hasPostedStory && !profile.hasViewedStory
                          ? "bg-gradient-to-tr from-[#f43f5e] via-[#9333ea] to-[#3b82f6]"
                          : profile.hasPostedStory && profile.hasViewedStory
                            ? "bg-gray-200"
                            : "bg-gray-100"
                      } p-[3px] transition-all duration-500 group-hover:p-[4px] group-active:scale-95 shadow-lg shadow-black/5`}>
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white relative">
                        <img src={profile.img} alt={profile.name} className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.src = FALLBACK_PROFILE_IMG; }} />
                        {profile.user_mode_type && profile.user_mode_type !== 'None' && (
                          <div className="absolute inset-[-2px] z-20 pointer-events-none rotate-45">
                            <img
                              src={profile.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                              alt={profile.user_mode_type}
                              className="w-full h-full object-contain drop-shadow-md -rotate-[15deg]"
                            />
                          </div>
                        )}
                      </div>
                      {profile.isYourStory && (
                        <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-100 transition-transform group-hover:scale-110 z-10" onClick={(e) => { e.stopPropagation(); setShowUploadModal(true); }}>
                          <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center bg-indigo-600 text-white">
                            <Plus size={10} className="rotate-90" />
                          </div>
                        </span>
                      )}
                    </div>
                      <span className={`mt-2 text-center text-sm font-medium w-full truncate px-1 ${profile.isYourStory ? "text-gray-900" : "text-gray-600"}`}>
                      {profile.name}
                    </span>
                  </>
                ) : (
                  <div className="w-full h-full relative">
                    <img src={getPreviewImage(profile.key, profile.img)} alt={profile.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.currentTarget.src = FALLBACK_PROFILE_IMG; }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-white text-sm font-semibold truncate drop-shadow-md">{profile.name}</h4>
                    </div>
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm relative">
                      <img src={profile.img} alt={profile.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = FALLBACK_PROFILE_IMG; }} />
                      {profile.user_mode_type && profile.user_mode_type !== 'None' && (
                        <div className="absolute inset-[-1px] z-20 pointer-events-none rotate-45">
                          <img
                            src={profile.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                            alt={profile.user_mode_type}
                            className="w-full h-full object-contain drop-shadow-sm -rotate-[15deg]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedStoryKey && showStoryModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[110] flex items-center justify-center overflow-hidden">
          <button onClick={closeStoryModal} className="absolute top-6 right-6 z-[150] text-white/70 hover:text-white transition-all hover:scale-110 p-2">
            <FiX size={32} />
          </button>

          {/* Nav Previews */}
          {prevUser2 && (
            <div className="hidden lg:flex flex-col items-center justify-center w-1/6 h-full opacity-60 transition-all duration-700 transform" style={{ perspective: "1000px", transform: "translateX(-20%) rotateY(35deg) scale(0.85)" }} onClick={() => handleStoryClick(prevUser2.key)}>
              <div className="relative w-56 h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img src={getPreviewImage(prevUser2.key, prevUser2.img)} alt={prevUser2.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border border-white/50 mx-auto mb-1 overflow-hidden">
                      <img src={prevUser2.img} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white text-xs">{prevUser2.name.split(" ")[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {prevUser1 && (
            <div className="hidden lg:flex flex-col items-center justify-center w-1/5 h-full transition-all duration-500 transform" style={{ perspective: "1000px", transform: "translateX(-5%) rotateY(20deg) scale(0.95)" }} onClick={() => handleStoryClick(prevUser1.key)}>
              <div className="relative w-64 h-[448px] rounded-2xl overflow-hidden border border-white/30 shadow-xl">
                <img src={getPreviewImage(prevUser1.key, prevUser1.img)} alt={prevUser1.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white mx-auto mb-2 overflow-hidden">
                      <img src={prevUser1.img} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white font-bold">{prevUser1.name.split(" ")[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative flex items-center justify-center z-30 w-full h-full md:w-auto md:h-auto">
            <div className="relative w-full h-full md:h-[90vh] md:w-[448px] bg-black md:rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10">
              <div className="absolute top-0 left-0 right-0 z-20 px-4 py-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
                <Link 
                  href={selectedProfile?.userId ? `/user/${selectedProfile.userId}` : "#"}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    if (!selectedProfile?.userId) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/50 relative">
                    <img src={selectedProfile?.img || FALLBACK_PROFILE_IMG} className="w-full h-full object-cover" />
                    {selectedProfile?.user_mode_type && selectedProfile.user_mode_type !== 'None' && (
                      <div className="absolute inset-[-2px] z-20 pointer-events-none rotate-45">
                        <img
                          src={selectedProfile.user_mode_type === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                          alt={selectedProfile.user_mode_type}
                          className="w-full h-full object-contain drop-shadow-sm -rotate-[15deg]"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-white font-semibold text-sm block">{selectedProfile?.name || ""}</span>
                    <span className="text-gray-300 text-xs">{currentStory?.createdAt ? formatTimeAgo(currentStory.createdAt) : ""}</span>
                  </div>
                </Link>
                <div className="flex items-center space-x-1">
                  <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                    {isMuted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setIsManuallyPaused(!isManuallyPaused); }} className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                    {isTimerPaused ? <FiPlay size={24} /> : <FiPause size={24} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setShowOptionsMenu(true); }} className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                    <FiMoreHorizontal size={24} />
                  </button>
                </div>
              </div>

              <div className="absolute top-2 left-0 right-0 z-20 px-2 flex space-x-1.5">
                {currentStories.map((_, index) => (
                  <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className={`h-full bg-white transition-all duration-100 ease-linear`} style={{ width: index === currentStoryIndex ? `${progress}%` : index < currentStoryIndex ? "100%" : "0%" }} />
                  </div>
                ))}
              </div>

              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                {currentStory ? (
                  currentStory.type === 2 ? (
                    <video
                      ref={videoRef}
                      src={currentStory.videoUrl}
                      className="w-full h-full object-contain"
                      autoPlay
                      muted={isMuted}
                      playsInline
                      onLoadedMetadata={(e) => {
                        const duration = e.currentTarget.duration;
                        if (duration && isFinite(duration)) {
                          setCurrentDuration(duration * 1000);
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={currentStory.imageUrl}
                      alt="Story"
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className="text-white">No story content</div>
                )}
              </div>

              <div className="absolute inset-0 z-10 flex">
                <div className="w-1/2 h-full cursor-pointer" onClick={previousStory}></div>
                <div className="w-1/2 h-full cursor-pointer" onClick={nextStory}></div>
              </div>

              {currentStat && (
                <>
                  {isOwner ? (
                    <div className="absolute bottom-6 left-0 right-0 z-20 px-4 flex justify-between items-end pointer-events-none">
                      <div className="bg-black/60 rounded-xl px-4 py-2 flex items-center gap-4 pointer-events-auto backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-white/90">
                          <FiEye size={16} />
                          <span className="text-sm font-semibold">{currentStat.totalViews}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setShowLikes(true); }} className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
                          <FiHeart size={16} />
                          <span className="text-sm font-semibold">{currentStat.totalLikes}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
                          <FiMessageCircle size={16} />
                          <span className="text-sm font-semibold">{currentStat.totalComments}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-[2px]">
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Add Comment"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter" && commentText.trim() && currentStory) {
                                handlePostComment();
                              }
                            }}
                            className="w-full bg-white/10 border border-white/30 rounded-full py-2.5 px-5 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 text-sm backdrop-blur-md transition-all"
                          />
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:scale-110 transition-transform"
                            onClick={handlePostComment}
                          >
                            <FiSend className="text-white" size={18} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              handleLikeToggle();
                            }}
                            className={`flex items-center gap-1 p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${currentStat.isLiked ? "bg-[red] text-red-500 fill-red-800" : "text-white"}`}
                          >
                            <FiHeart size={16} fill={currentStat.isLiked ? 'currentColor' : 'none'} className={currentStat.isLiked ? 'text-red-500' : 'text-white'} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLikes(true);
                            }}
                            className="p-1"
                          >
                            <span className="text-white text-[12px] font-bold">
                              {currentStat.totalLikes}
                            </span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiEye
                            size={16}
                            className="text-white"
                          />
                          <span className="text-white text-[10px] font-bold">
                            {currentStat.totalViews}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowComments(!showComments);
                          }}
                          className={`p-2 flex items-center gap-2 rounded-full text-white transition-all hover:scale-110 active:scale-95`}
                        >
                          <FiMessageCircle size={16} />
                          <span className="text-sm font-semibold">{currentStat.totalComments}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {showComments && currentStory && (
                <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowComments(false)}>
                  <div className="absolute bottom-0 left-0 right-0 max-h-[70%] bg-[#1c1c1e] rounded-t-3xl p-6 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1.5 bg-gray-700/50 rounded-full mx-auto mb-6" onClick={() => setShowComments(false)} />

                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-bold text-lg">Comments ({currentStat?.totalComments || 0})</h3>
                      <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white transition-colors">
                        <FiX size={24} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide">
                      {commentsList.length > 0 ? commentsList.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                            <img
                              src={c.user?.picture || FALLBACK_PROFILE_IMG}
                              className="w-full h-full object-cover"
                              alt="profile"
                              onError={e => e.currentTarget.src = FALLBACK_PROFILE_IMG}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-white text-xs font-bold">{c.user?.first_name} {c.user?.last_name}</span>
                              <span className="text-gray-500 text-[10px]">{c.human_readable || formatTimeAgo(c.created_at)}</span>
                            </div>
                            <p className="text-gray-300 text-sm mt-0.5">{c.comment}</p>
                            {(c.user_id === currentUserId || isOwner) && (
                              <button onClick={() => handleDeleteComment(c.id)} className="text-[10px] text-gray-500 mt-1 hover:text-red-400">Delete</button>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-30 text-white">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                          <p className="text-sm">No comments yet</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 mt-auto">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && commentText.trim() && currentStory) {
                              handlePostComment();
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 text-sm transition-all"
                        />
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-500 hover:scale-110 transition-transform disabled:opacity-50"
                          disabled={!commentText.trim()}
                          onClick={handlePostComment}
                        >
                          <FiSend size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showLikes && currentStory && (
                <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLikes(false)}>
                  <div className="absolute bottom-0 left-0 right-0 max-h-[70%] bg-[#1c1c1e] rounded-t-3xl p-6 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1.5 bg-gray-700/50 rounded-full mx-auto mb-6" onClick={() => setShowLikes(false)} />

                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-bold text-lg">Likes ({currentStat?.totalLikes || 0})</h3>
                      <button onClick={() => setShowLikes(false)} className="text-gray-400 hover:text-white transition-colors">
                        <FiX size={24} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide">
                      {likesList.length > 0 ? likesList.map(u => (
                        <div key={u.id} className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                            <img
                              src={u.picture || FALLBACK_PROFILE_IMG}
                              className="w-full h-full object-cover"
                              alt="profile"
                              onError={e => e.currentTarget.src = FALLBACK_PROFILE_IMG}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-bold">{u.first_name} {u.last_name}</p>
                            {u.liked_at && (
                              <p className="text-gray-500 text-xs">{u.liked_at.human_readable}</p>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-30 text-white">
                          <FiHeart size={48} className="mb-2" />
                          <p className="text-sm">No likes yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex absolute inset-y-0 -left-16 -right-16 items-center justify-between pointer-events-none z-50">
              <button onClick={(e) => { e.stopPropagation(); previousStory(); }} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white pointer-events-auto transition-transform hover:scale-110 shadow-lg border border-white/20"><FiChevronLeft size={28} /></button>
              <button onClick={(e) => { e.stopPropagation(); nextStory(); }} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white pointer-events-auto transition-transform hover:scale-110 shadow-lg border border-white/20"><FiChevronRight size={28} /></button>
            </div>
          </div>

          {/* Next Previews */}
          {nextUser1 && (
            <div className="hidden lg:flex flex-col items-center justify-center w-1/5 h-full transition-all duration-500 transform" style={{ perspective: "1000px", transform: "translateX(5%) rotateY(-20deg) scale(0.95)" }} onClick={() => handleStoryClick(nextUser1.key)}>
              <div className="relative w-64 h-[448px] rounded-2xl overflow-hidden border border-white/30 shadow-xl">
                <img src={getPreviewImage(nextUser1.key, nextUser1.img)} alt={nextUser1.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white mx-auto mb-2 overflow-hidden">
                      <img src={nextUser1.img} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white font-bold">{nextUser1.name.split(" ")[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {nextUser2 && (
            <div className="hidden lg:flex flex-col items-center justify-center w-1/6 h-full opacity-60 transition-all duration-700 transform" style={{ perspective: "1000px", transform: "translateX(20%) rotateY(-35deg) scale(0.85)" }} onClick={() => handleStoryClick(nextUser2.key)}>
              <div className="relative w-56 h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img src={getPreviewImage(nextUser2.key, nextUser2.img)} alt={nextUser2.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border border-white/50 mx-auto mb-1 overflow-hidden">
                      <img src={nextUser2.img} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white text-xs">{nextUser2.name.split(" ")[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showOptionsMenu && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" onClick={() => setShowOptionsMenu(false)}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative w-full max-w-sm bg-[#262626] rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col">
                  {isOwner && (
                    <button
                      className="w-full py-3.5 px-4 text-sm border-b border-white/10 hover:bg-white/5 text-red-500 font-bold flex items-center justify-center gap-2"
                      onClick={handleDeleteStory}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Story"
                      )}
                    </button>
                  )}
                  {!isOwner && (

                    <button
                      className="w-full py-3.5 px-4 text-sm border-b border-white/10 hover:bg-white/5 text-red-500 font-bold"
                      onClick={() => {
                        setShowReportModal(true);
                        setShowOptionsMenu(false);
                      }}
                    >
                      Report
                    </button>
                  )}
                  <button className="w-full py-3.5 px-4 text-sm text-white hover:bg-white/5" onClick={() => setShowOptionsMenu(false)}>Cancel</button>
                </div>

              </div>
            </div>
          )}

          {showReportModal && (
            <div className="fixed inset-0 z-[210] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowReportModal(false)} />
              <div className="relative w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-4">Report Story</h3>
                <p className="text-gray-400 text-sm mb-4">Please provide a reason for reporting this story.</p>
                <textarea
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none mb-6"
                  placeholder="Tell us why you're reporting this..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 py-3 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handleReportStory}
                    disabled={isReporting || !reportReason.trim()}
                  >
                    {isReporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Reporting...
                      </>
                    ) : "Submit Report"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      <StoryUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          fetchStories();
          fetchMyStories();
          // Re-fetch again shortly after to handle potential backend indexing delays
          setTimeout(() => {
            fetchStories();
            fetchMyStories();
          }, 3000);
        }}
      />
    </>
  );
};

export default StorySection;

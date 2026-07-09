"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    FiEye,
    FiMessageCircle,
} from "react-icons/fi";
import { THEME } from "@/styles/theme";
import ReelUploadModal from "../Networking/ReelUploadModal";
import {
    getReelDetails,
    getReelsList,
    getMyReels,
    likeReel,
    dislikeReel,
    watchReel,
    commentReel,
    deleteReel,
    type Reel,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { isVideoFile } from "@/lib/utils";
import { BsFillHeartFill } from "react-icons/bs";
import { EyeIcon } from "lucide-react";
import Link from "next/link";

type StoryItem = {
    reelId: number;
    type: "video" | "image";
    url: string;
    thumbnailUrl?: string;
    durationMs: number;
    createdAt?: string;
};

type StoryProfile = {
    key: string;
    name: string;
    img: string; // User's profile image
    isYourStory?: boolean;
    hasPostedStory?: boolean;
    hasViewedStory?: boolean;
    userId?: number;
    previewUrl?: string;
    previewType?: "video" | "image";
};

const FALLBACK_PROFILE_IMG = "/images/user_profile_placeholder.jpeg";
const YOUR_STORY_KEY = "your-story";
const DEFAULT_STORY_DURATION_MS = 5000;

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
    variant?: "circle" | "rect" | "grid";
    onlyMyReels?: boolean;
}

const ReelSection: React.FC<StorySectionProps> = ({ variant = "circle", onlyMyReels = false }) => {
    const { user } = useAuth();
    const currentUserId = user?.id ?? null;

    const [selectedStory, setSelectedStory] = useState<string | null>(null); // stores StoryProfile.key
    const [isLiked, setIsLiked] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [showLikes, setShowLikes] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const [reels, setReels] = useState<Reel[]>([]);
    const [myReels, setMyReels] = useState<Reel[]>([]);
    const [reelsLoading, setReelsLoading] = useState(false);
    const [reelsError, setReelsError] = useState<string | null>(null);
    const [reelDetailsById, setReelDetailsById] = useState<
        Record<number, Reel | undefined>
    >({});
    const [viewedUserIds, setViewedUserIds] = useState<Record<number, true>>({});

    const [isMuted, setIsMuted] = useState(false);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentDuration, setCurrentDuration] = useState(DEFAULT_STORY_DURATION_MS);
    const isTimerPaused = showComments || showLikes || showOptionsMenu || isManuallyPaused;

    useEffect(() => {
        if (videoRef.current) {
            if (isTimerPaused) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(() => { });
            }
        }
    }, [isTimerPaused, currentStoryIndex, showStoryModal]);

    const fetchReels = async () => {
        setReelsLoading(true);
        setReelsError(null);
        try {
            const res = await getReelsList(1);
            const items = res.data?.reels ?? [];
            setReels(items);
            if (!items.length && res.message) {
                setReelsError(res.message);
            }
        } catch (e: any) {
            setReelsError(e?.message || "Failed to fetch reels");
            setReels([]);
        } finally {
            setReelsLoading(false);
        }
    };

    const fetchMyReels = async () => {
        console.log('Fetching my reels...');
        try {
            const res = await getMyReels();
            const items = res.data?.reels ?? [];
            setMyReels(items);
        } catch {
            setMyReels([]);
        }
    };

    useEffect(() => {
        fetchReels();
    }, []);

    useEffect(() => {
        if (currentUserId != null) {
            fetchMyReels();
        } else {
            setMyReels([]);
        }
    }, [currentUserId]);

    const { profiles, storyDataByKey } = useMemo(() => {
        const grouped = new Map<number, Reel[]>();
        for (const reel of reels) {
            if (currentUserId != null && reel.user_id === currentUserId) continue;
            if (!grouped.has(reel.user_id)) grouped.set(reel.user_id, []);
            grouped.get(reel.user_id)!.push(reel);
        }

        // Sort reels per user by created_at desc (best-effort)
        for (const [userId, items] of grouped.entries()) {
            grouped.set(
                userId,
                [...items].sort((a, b) => {
                    // created_at is a Unix timestamp (number)
                    const ta = a.created_at || 0;
                    const tb = b.created_at || 0;
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
                const img =
                    first?.user?.picture ||
                    first?.user?.avatar_url ||
                    FALLBACK_PROFILE_IMG;
                return {
                    key: String(userId),
                    userId,
                    name,
                    img,
                    hasPostedStory: true,
                    hasViewedStory: !!viewedUserIds[userId],
                    previewUrl: first?.thumbnailUrl || first?.videoUrl || img,
                    previewType: (first?.thumbnailUrl || !first?.videoUrl) ? "image" : "video",
                };
            },
        );

        // Sort users by latest reel time
        apiProfiles.sort((a, b) => {
            const aReel = grouped.get(a.userId || -1)?.[0];
            const bReel = grouped.get(b.userId || -1)?.[0];
            // created_at is a Unix timestamp (number)
            const ta = aReel?.created_at || 0;
            const tb = bReel?.created_at || 0;
            return tb - ta;
        });

        const storyData: Record<string, StoryItem[]> = {};
        for (const p of apiProfiles) {
            const items = grouped.get(p.userId!) || [];
            storyData[p.key] = items.map((reel) => {
                const details = reelDetailsById[reel.id];
                return {
                    reelId: reel.id,
                    type: "video",
                    url: details?.videoUrl || reel.videoUrl,
                    thumbnailUrl: details?.thumbnailUrl || reel.thumbnailUrl || undefined,
                    durationMs: DEFAULT_STORY_DURATION_MS,
                    createdAt:
                        details?.created_at?.toString() || reel.created_at?.toString(),
                };
            });
        }

        // "Your reel" from getMyReels – show current user's reels; img from auth user
        const yourStoryImg =
            (user?.picture || user?.image || "").trim() || FALLBACK_PROFILE_IMG;
        const yourStoryItems: StoryItem[] = myReels.map((reel) => {
            const details = reelDetailsById[reel.id];
            return {
                reelId: reel.id,
                type: "video",
                url: details?.videoUrl || reel.videoUrl,
                thumbnailUrl: details?.thumbnailUrl || reel.thumbnailUrl || undefined,
                durationMs: DEFAULT_STORY_DURATION_MS,
                createdAt:
                    details?.created_at?.toString() || reel.created_at?.toString(),
            };
        });
        storyData[YOUR_STORY_KEY] = yourStoryItems;

        const merged: StoryProfile[] = [
            {
                key: YOUR_STORY_KEY,
                name: "Your Reel",
                img: yourStoryImg,
                isYourStory: true,
                hasPostedStory: myReels.length > 0,
                previewUrl: (myReels[0]?.thumbnailUrl || myReels[0]?.videoUrl) || yourStoryImg,
                previewType: (myReels[0]?.thumbnailUrl || !myReels[0]?.videoUrl) ? "image" : "video",
            },
            ...apiProfiles,
        ];

        if (onlyMyReels) {
            return {
                profiles: merged.filter(p => p.isYourStory && p.hasPostedStory),
                storyDataByKey: { [YOUR_STORY_KEY]: storyData[YOUR_STORY_KEY] }
            };
        }

        return { profiles: merged, storyDataByKey: storyData };
    }, [reels, myReels, user, reelDetailsById, viewedUserIds, onlyMyReels]);

    const selectedProfile = selectedStory
        ? profiles.find((p) => p.key === selectedStory)
        : undefined;
    const currentStories = selectedStory
        ? (storyDataByKey[selectedStory] ?? [])
        : [];
    const currentStory = currentStories[currentStoryIndex];

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } =
                scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // buffer of 10px
        }
    };

    useEffect(() => {
        checkScrollPosition();
        window.addEventListener("resize", checkScrollPosition);
        // Also check when reels change
        const timeout = setTimeout(checkScrollPosition, 500);
        return () => {
            window.removeEventListener("resize", checkScrollPosition);
            clearTimeout(timeout);
        };
    }, [reels, myReels]);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -200,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 200,
                behavior: "smooth",
            });
        }
    };

    const handleStoryClick = (profileKey: string, startIndex: number = 0) => {
        // "Your Reel": open viewer if we have my reels, else open upload modal
        if (profileKey === YOUR_STORY_KEY) {
            if (storyDataByKey[YOUR_STORY_KEY]?.length) {
                setSelectedStory(YOUR_STORY_KEY);
                setShowStoryModal(true);
                setCurrentStoryIndex(startIndex);
                setProgress(0);
                setIsLiked(false);
            } else {
                setShowUploadModal(true);
            }
            return;
        }

        // Otherwise, open story viewer
        if (storyDataByKey[profileKey]?.length) {
            const profile = profiles.find((p) => p.key === profileKey);
            if (profile?.userId) {
                setViewedUserIds((prev) => ({ ...prev, [profile.userId!]: true }));
            }
            setSelectedStory(profileKey);
            setShowStoryModal(true);
            setCurrentStoryIndex(startIndex);
            setProgress(0);
            setIsLiked(false);
        }
    };

    const closeStoryModal = () => {
        setShowStoryModal(false);
        setSelectedStory(null);
        setShowOptionsMenu(false);
        setShowComments(false);
        setShowLikes(false);
        setCurrentStoryIndex(0);
        setProgress(0);
    };

    // Get valid profiles that have stories or is 'Your Reel'
    const validProfiles = profiles.filter(
        (p) => p.isYourStory || (storyDataByKey[p.key]?.length ?? 0) > 0,
    );

    const currentIndex = selectedStory
        ? validProfiles.findIndex((p) => p.key === selectedStory)
        : -1;
    const prevUser2 = currentIndex > 1 ? validProfiles[currentIndex - 2] : null;
    const prevUser1 = currentIndex > 0 ? validProfiles[currentIndex - 1] : null;
    const nextUser1 =
        currentIndex < validProfiles.length - 1
            ? validProfiles[currentIndex + 1]
            : null;
    const nextUser2 =
        currentIndex < validProfiles.length - 2
            ? validProfiles[currentIndex + 2]
            : null;

    const handleProfileClick = (profileKey: string) => {
        handleStoryClick(profileKey);
    };

    const nextStory = () => {
        if (selectedStory && storyDataByKey[selectedStory]) {
            const stories = storyDataByKey[selectedStory] || [];
            if (currentStoryIndex < stories.length - 1) {
                setCurrentStoryIndex((prev) => prev + 1);
                setProgress(0);
            } else if (nextUser1) {
                // Move to next user's story
                handleStoryClick(nextUser1.key);
            } else {
                closeStoryModal();
            }
        } else if (selectedStory === YOUR_STORY_KEY && nextUser1) {
            // Handle "Your Reel" case if it had stories (currently empty in mock) or just move next
            handleStoryClick(nextUser1.key);
        } else {
            closeStoryModal();
        }
    };

    const previousStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex((prev) => prev - 1);
            setProgress(0);
        } else if (prevUser1) {
            // Move to previous user's last story (optional, or first)
            // For simplicity starting at first story of previous user
            handleStoryClick(prevUser1.key);
        }
    };

    const handleDeleteReel = async () => {
        if (!currentStory) return;
        try {
            const res = await deleteReel(currentStory.reelId);
            // Assuming successful status is around 200
            if (res.status < 300) {
                console.log('✅ Reel deleted successfully');
                fetchReels();
                fetchMyReels();
                if (currentStories.length === 1) {
                    closeStoryModal();
                } else {
                    nextStory();
                }
            } else {
                console.error("Failed to delete reel, status:", res.status);
            }
        } catch (err) {
            console.error("Failed to delete reel", err);
        }
        setShowOptionsMenu(false);
    };

    useEffect(() => {
        setCurrentDuration(currentStories[currentStoryIndex]?.durationMs ?? DEFAULT_STORY_DURATION_MS);
    }, [currentStoryIndex, selectedStory, currentStories]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        if (showStoryModal && selectedStory && !isTimerPaused) {
            const durationMs = currentDuration;
            const tickMs = 100;
            const increment = 100 / Math.max(1, durationMs / tickMs);
            timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        return 100; // Stop at 100 for reels, no auto-next
                    }
                    return prev + increment;
                });
            }, tickMs);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [showStoryModal, selectedStory, currentStoryIndex, currentStories, isTimerPaused, currentDuration]);

    // 1. Watch Reel Logic (Fire once per reel view)
    useEffect(() => {
        const reelId = currentStory?.reelId;
        if (!showStoryModal || !reelId) return;

        // Check ownership
        const profile = profiles.find((p) => p.key === selectedStory);
        const isOwner = profile?.userId === currentUserId || profile?.isYourStory;

        // Watch (if not owner)
        if (!isOwner) {
            watchReel(reelId).catch((err) => {
                console.error("Watch reel error:", err);
            });
        }
    }, [showStoryModal, currentStory?.reelId, currentUserId, selectedStory]);

    // 2. Fetch Reel Details (Fire every time reel is viewed)
    useEffect(() => {
        const reelId = currentStory?.reelId;
        if (!showStoryModal || !reelId) return;

        let cancelled = false;
        (async () => {
            const res = await getReelDetails(reelId);
            if (cancelled) return;
            if (res.data) {
                setReelDetailsById((prev) => ({ ...prev, [reelId]: res.data! }));
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [showStoryModal, currentStory?.reelId]);

    // Sync isLiked state with reelDetails
    useEffect(() => {
        const reelId = currentStory?.reelId;
        if (!reelId) return;
        const details = reelDetailsById[reelId];
        if (details) {
            const liked =
                details.likes?.some((l) => l.user_id === currentUserId) ?? false;
            setIsLiked(liked);
        } else {
            setIsLiked(false);
        }
    }, [currentStory?.reelId, reelDetailsById, currentUserId]);

    // Helper to render media preview (image or video frame)
    const renderPreviewMedia = (profile: StoryProfile, className: string) => {
        const isVideo = profile.previewType === "video";
        const url = profile.previewUrl || profile.img || FALLBACK_PROFILE_IMG;

        if (isVideo) {
            return (
                <video
                    src={`${url}#t=0.001`}
                    className={className}
                    muted
                    playsInline
                    preload="metadata"
                />
            );
        }

        return (
            <img
                src={url}
                alt={profile.name}
                className={className}
                draggable={false}
                onError={(e) => {
                    e.currentTarget.src = FALLBACK_PROFILE_IMG;
                }}
            />
        );
    };

    // Filter profiles for rendering
    const displayedProfiles = profiles;

    return (
        <>
            <section
                className={`w-full ${variant === "grid" ? "" : THEME.components.card.default} flex justify-center relative !p-0 overflow-hidden`}
            >
                {/* Mobile-only gradient background */}
                {variant !== "grid" && <div className="absolute inset-0 z-5 block sm:hidden" />}

                <div className={`relative w-full max-w-full z-10 ${variant === "grid" ? "" : "py-4"}`}>
                    {/* Title for Rect/Grid Variant (YouTube Style) */}
                    {(variant === "rect" || variant === "grid") && (
                        <div className="px-4 mb-3 flex items-center">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    {onlyMyReels ? "My Reels" : "Reels"}
                                </h3>
                                {reelsLoading && (
                                    <span className="text-xs text-gray-500">Loading…</span>
                                )}
                                {!reelsLoading && reelsError && (
                                    <span className="text-xs text-red-600">{reelsError}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Left/Right Arrows - only for horizontal layouts */}
                    {variant !== "grid" && (
                        <>
                            {showLeftArrow && (
                                <button
                                    onClick={scrollLeft}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-[#8200db] shadow-xl rounded-full flex items-center justify-center hover:bg-[#7000c0] transition-all hover:scale-110 active:scale-95 border border-white/20"
                                    aria-label="Scroll left"
                                >
                                    <FiChevronLeft className="w-6 h-6 text-white cursor-pointer" />
                                </button>
                            )}
                            {showRightArrow && (
                                <button
                                    onClick={scrollRight}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-[#8200db] shadow-xl rounded-full flex items-center justify-center hover:bg-[#7000c0] transition-all hover:scale-110 active:scale-95 border border-white/20"
                                    aria-label="Scroll right"
                                >
                                    <FiChevronRight className="w-6 h-6 text-white cursor-pointer" />
                                </button>
                            )}
                        </>
                    )}

                    {variant === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 overflow-hidden mb-8">
                            {displayedProfiles.flatMap(profile => {
                                const stories = storyDataByKey[profile.key] || [];
                                return stories.map((story, idx) => (
                                    <div
                                        key={`${profile.key}-${story.reelId}`}
                                        className="group relative aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
                                        onClick={() => handleStoryClick(profile.key, idx)}
                                    >
                                        <video
                                            src={`${story.url}#t=0.001`}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3">
                                            <div className="flex items-center gap-2 text-white text-xs mb-1">
                                                <FiPlay size={10} />
                                                <span>{reelDetailsById[story.reelId]?.views_count || "0"}</span>
                                            </div>
                                        </div> */}
                                    </div>
                                ));
                            })}
                            {!reelsLoading && displayedProfiles.length === 0 && (
                                <div className="col-span-full py-10 text-center text-gray-500">
                                    No reels posted yet.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            ref={scrollContainerRef}
                            onScroll={checkScrollPosition}
                            className="w-full flex items-center overflow-x-auto px-4 space-x-4 scrollbar-hide"
                            style={{
                                WebkitOverflowScrolling: "touch",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                            }}
                            tabIndex={0}
                        >
                            {displayedProfiles.map((profile) => (
                                <div
                                    key={profile.key}
                                    className={`flex-shrink-0 select-none cursor-pointer group relative ${variant === "rect"
                                        ? "w-32 h-56 rounded-xl overflow-hidden"
                                        : "flex flex-col items-center min-w-[96px]"
                                        }`}
                                    tabIndex={-1}
                                    style={{ userSelect: "none" }}
                                    draggable={false}
                                    onClick={() => handleStoryClick(profile.key)}
                                >
                                    {variant === "circle" ? (
                                        // Circular Layout (Original)
                                        <>
                                            <div
                                                className={`relative w-24 h-24 rounded-full flex items-center justify-center ${profile.isYourStory
                                                    ? "bg-gradient-to-tr from-[#7c3aed] via-[#9333ea] to-[#c084fc]"
                                                    : profile.hasPostedStory && !profile.hasViewedStory
                                                        ? "bg-gradient-to-tr from-[#f43f5e] via-[#9333ea] to-[#3b82f6]"
                                                        : profile.hasPostedStory && profile.hasViewedStory
                                                            ? "bg-gray-200"
                                                            : "bg-gray-100"
                                                    } p-[3px] transition-all duration-500 group-hover:p-[4px] group-active:scale-95 shadow-lg group-hover:shadow-purple-500/25`}
                                                style={{ userSelect: "none" }}
                                            >
                                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white">
                                                    {renderPreviewMedia(profile, "w-full h-full object-cover rounded-full pointer-events-none select-none")}
                                                </div>

                                                {/* Plus icon for 'Your Reel' – click opens Create Reel popup */}
                                                {profile.isYourStory && (
                                                    <span
                                                        role="button"
                                                        tabIndex={0}
                                                        className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-100 transition-transform group-hover:scale-110 cursor-pointer z-10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowUploadModal(true);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setShowUploadModal(true);
                                                            }
                                                        }}
                                                        aria-label="Create new reel"
                                                    >
                                                        <div
                                                            className={`w-4.5 h-4.5 rounded-full flex items-center justify-center bg-indigo-600 text-white`}
                                                        >
                                                            <svg
                                                                width="12"
                                                                height="12"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                            >
                                                                <path
                                                                    d="M12 4v16m8-8H4"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </span>
                                                )}
                                            </div>

                                            <span
                                                className={`mt-2 text-center text-xs font-medium w-full truncate px-1 ${profile.isYourStory ? "text-gray-900" : "text-gray-600"}`}
                                            >
                                                {profile.name.split(" ")[0]}
                                            </span>
                                        </>
                                    ) : profile.isYourStory && !profile.hasPostedStory ? (
                                        // Rectangular Layout: Create Reel card (no reels posted yet)
                                        <>
                                            <div
                                                className="w-full h-full relative flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowUploadModal(true);
                                                }}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700 text-center px-2 leading-tight">
                                                    Create your reel
                                                </span>
                                            </div>
                                        </>
                                    ) : profile.isYourStory && profile.hasPostedStory ? (
                                        // Rectangular Layout: Your Reel card (has posted reels - Facebook style)
                                        <>
                                            <div className="w-full h-full relative group/reel">
                                                {/* User's preview media as background */}
                                                {renderPreviewMedia(profile, "w-full h-full object-cover transition-transform duration-500 group-hover/reel:scale-110")}

                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

                                                {/* Profile Icon (Small) Top Left */}
                                                <div className="absolute top-3 left-3 w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                                    <img
                                                        src={profile.img}
                                                        alt={profile.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = FALLBACK_PROFILE_IMG;
                                                        }}
                                                    />
                                                </div>

                                                {/* Name at bottom */}
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <h4 className="text-white text-sm font-bold truncate drop-shadow-md">
                                                        {profile.name}
                                                    </h4>
                                                </div>

                                                {/* "+" create button - bottom-right corner */}
                                                <div
                                                    className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors shadow-md z-10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowUploadModal(true);
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // Rectangular Layout (YouTube Shorts Style)
                                        <>
                                            <div className="w-full h-full relative">
                                                {/* Media - Use preview reel content if available, else profile img */}
                                                {renderPreviewMedia(profile, "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110")}

                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

                                                {/* Content Overlay */}
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <h4 className="text-white text-sm font-bold truncate drop-shadow-md">
                                                        {profile.name}
                                                    </h4>
                                                </div>

                                                {/* Profile Icon (Small) Top Left */}
                                                <div className="absolute top-3 left-3 w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                                    <img
                                                        src={profile.img}
                                                        alt={profile.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = FALLBACK_PROFILE_IMG;
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Story Viewer Modal */}
            {mounted && selectedStory && showStoryModal && createPortal(
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex items-center justify-center overflow-hidden">
                    {/* Close Button - Pinned to Screen Right */}
                    <button
                        onClick={closeStoryModal}
                        className="absolute top-6 right-6 z-[150] text-white/70 hover:text-white transition-all hover:scale-110 active:scale-90 p-2"
                    >
                        <FiX size={32} />
                    </button>
                    {/* Far Previous Story Preview (Distance 2) */}
                    <div
                        className={`hidden lg:flex flex-col items-center justify-center w-1/6 h-full transition-all duration-700 ${prevUser2 ? "opacity-60 cursor-pointer" : "opacity-0 pointer-events-none"}`}
                        style={{
                            perspective: "1000px",
                            transform: prevUser2
                                ? "translateX(-20%) rotateY(35deg) scale(0.85) translateZ(-50px)"
                                : "none",
                            backfaceVisibility: "hidden",
                            transformStyle: "preserve-3d",
                        }}
                        onClick={() => prevUser2 && handleProfileClick(prevUser2.key)}
                    >
                        {prevUser2 && (
                            <div className="relative w-56 h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-lg transition-all duration-500">
                                {renderPreviewMedia(prevUser2, "w-full h-full object-cover")}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-10 h-10 rounded-full border border-white/50 mx-auto mb-1 overflow-hidden">
                                            <img
                                                src={prevUser2.img}
                                                alt={prevUser2.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = FALLBACK_PROFILE_IMG;
                                                }}
                                            />
                                        </div>
                                        <p className="text-white font-medium text-xs opacity-80">
                                            {prevUser2.name.split(" ")[0]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Previous Story Preview (Distance 1) */}
                    <div
                        className={`hidden lg:flex flex-col items-center justify-center w-1/5 h-full transition-all duration-500 ${prevUser1 ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"}`}
                        style={{
                            perspective: "1000px",
                            transform: prevUser1
                                ? "translateX(-5%) rotateY(20deg) scale(0.95) translateZ(0)"
                                : "none",
                            backfaceVisibility: "hidden",
                            transformStyle: "preserve-3d",
                        }}
                        onClick={() => prevUser1 && handleProfileClick(prevUser1.key)}
                    >
                        {prevUser1 && (
                            <div className="relative w-64 h-[448px] rounded-2xl overflow-hidden border border-white/30 shadow-xl transition-transform hover:scale-105">
                                {renderPreviewMedia(prevUser1, "w-full h-full object-cover")}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 flex items-end justify-center pb-8">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full border-2 border-white mx-auto mb-2 overflow-hidden">
                                            <img
                                                src={prevUser1.img}
                                                alt={prevUser1.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = FALLBACK_PROFILE_IMG;
                                                }}
                                            />
                                        </div>
                                        <p className="text-white font-bold text-sm">
                                            {prevUser1.name.split(" ")[0]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Story Content Wrapper - Pins navigation just outside */}
                    <div className="relative flex items-center justify-center z-30">
                        {/* Main Story View */}
                        <div className="relative w-full h-[90vh] md:w-[448px] bg-black md:rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10">
                            {/* Header */}
                            {/* Header - Glassmorphism */}
                            <div className="absolute top-0 left-0 right-0 z-20 px-4 py-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-[2px] flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/50">
                                        <Link href={`/user/${selectedProfile?.userId}`}>
                                            <img
                                                src={selectedProfile?.img || FALLBACK_PROFILE_IMG}
                                                alt={selectedProfile?.name || "Profile"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = FALLBACK_PROFILE_IMG;
                                                }}
                                            />
                                        </Link>
                                    </div>
                                    <div>
                                        <Link href={`/user/${selectedProfile?.userId}`}>
                                            <span className="text-white font-semibold text-sm block">
                                                {selectedProfile?.name || ""}
                                            </span>
                                        </Link>
                                        <span className="text-gray-300 text-xs">
                                            {currentStory?.createdAt
                                                ? formatTimeAgo(currentStory.createdAt)
                                                : ""}
                                        </span>
                                    </div>

                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMuted(!isMuted);
                                        }}
                                        className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors active:scale-95"
                                    >
                                        {isMuted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsManuallyPaused(!isManuallyPaused);
                                        }}
                                        className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors active:scale-95"
                                    >
                                        {isTimerPaused ? <FiPlay size={24} /> : <FiPause size={24} />}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowOptionsMenu(true);
                                        }}
                                        className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors active:scale-95"
                                    >
                                        <FiMoreHorizontal size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="absolute top-2 left-0 right-0 z-20 px-2">
                                <div className="flex space-x-1.5">
                                    {currentStories.map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                                        >
                                            <div
                                                className={`h-full rounded-full transition-all duration-100 ease-linear ${index < currentStoryIndex
                                                    ? "bg-white"
                                                    : index === currentStoryIndex
                                                        ? "bg-white"
                                                        : "transparent"
                                                    }`}
                                                style={{
                                                    width:
                                                        index === currentStoryIndex
                                                            ? `${progress}%`
                                                            : index < currentStoryIndex
                                                                ? "100%"
                                                                : "0%",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Story Content */}
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                {currentStory ? (
                                    <video
                                        ref={videoRef}
                                        src={currentStory.url}
                                        poster={currentStory.thumbnailUrl}
                                        className="w-full h-full object-contain"
                                        autoPlay
                                        muted={isMuted}
                                        playsInline
                                        preload="metadata"
                                        loop // Loop the video instead of going next
                                        onLoadedMetadata={(e) => {
                                            const duration = e.currentTarget.duration;
                                            if (duration && isFinite(duration)) {
                                                setCurrentDuration(duration * 1000);
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="text-white">No reel content available</div>
                                )}
                            </div>

                            {/* Tap Navigation Zones */}
                            <div className="absolute inset-0 z-10 flex">
                                <div
                                    className="w-1/2 h-full cursor-pointer"
                                    onClick={previousStory}
                                ></div>
                                <div
                                    className="w-1/2 h-full cursor-pointer"
                                    onClick={nextStory}
                                ></div>
                            </div>

                            {/* Reply Input - Glassmorphism Footer */}
                            {/* Reply Input - Glassmorphism Footer */}
                            {(() => {
                                const profile = profiles.find((p) => p.key === selectedStory);
                                const isOwner = profile?.userId === currentUserId || profile?.isYourStory;

                                if (isOwner) {
                                    return (
                                        <div className="absolute bottom-6 left-0 right-0 z-20 px-4 flex justify-between items-end pointer-events-none">
                                            <div className="bg-black/60 rounded-xl px-4 py-2 flex items-center gap-4 pointer-events-auto backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 text-white/90">
                                                    <FiEye size={16} />
                                                    <span className="text-sm font-semibold">
                                                        {(() => {
                                                            const reelId = currentStory?.reelId;
                                                            if (!reelId) return 0;
                                                            return reelDetailsById[reelId]?.views_count ?? 0;
                                                        })()}
                                                    </span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); setShowLikes(true); }} className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
                                                    <FiHeart size={16} />
                                                    <span className="text-sm font-semibold">
                                                        {(() => {
                                                            const reelId = currentStory?.reelId;
                                                            if (!reelId) return 0;
                                                            return reelDetailsById[reelId]?.likes?.length ?? 0;
                                                        })()}
                                                    </span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
                                                    <FiMessageCircle size={16} />
                                                    <span className="text-sm font-semibold">
                                                        {(() => {
                                                            const reelId = currentStory?.reelId;
                                                            if (!reelId) return 0;
                                                            return reelDetailsById[reelId]?.comments?.length ?? 0;
                                                        })()}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-[2px]">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Type a comment"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    onKeyDown={async (e) => {
                                                        if (e.key === "Enter" && commentText.trim() && currentStory) {
                                                            const text = commentText;
                                                            setCommentText(""); // Optimistic clear
                                                            try {
                                                                // Optimistic update
                                                                const newCommentObj: any = {
                                                                    id: Date.now(),
                                                                    reel_id: currentStory.reelId,
                                                                    user_id: Number(user?.id || 0),
                                                                    comment: text,
                                                                    user: {
                                                                        id: Number(user?.id || 0),
                                                                        first_name: user?.first_name || "You",
                                                                        last_name: user?.last_name || "",
                                                                        picture: user?.picture || FALLBACK_PROFILE_IMG
                                                                    },
                                                                    created_at: Math.floor(Date.now() / 1000)
                                                                };
                                                                setReelDetailsById(prev => {
                                                                    const reel = prev[currentStory.reelId];
                                                                    if (!reel) return prev;
                                                                    return {
                                                                        ...prev,
                                                                        [currentStory.reelId]: {
                                                                            ...reel,
                                                                            comments: [newCommentObj, ...(reel.comments || [])]
                                                                        }
                                                                    };
                                                                });

                                                                await commentReel(currentStory.reelId, text);
                                                                const res = await getReelDetails(currentStory.reelId);
                                                                if (res.data) {
                                                                    setReelDetailsById(prev => ({ ...prev, [currentStory.reelId]: res.data! }));
                                                                }
                                                            } catch (err) {
                                                                console.error("Failed to comment", err);
                                                                setCommentText(text); // Revert on failure
                                                            }
                                                        }
                                                    }}
                                                    className="w-full bg-white/10 border border-white/30 rounded-full py-2.5 px-5 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 text-sm backdrop-blur-md transition-all"
                                                />
                                                <button
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:scale-110 transition-transform"
                                                    onClick={async () => {
                                                        if (commentText.trim() && currentStory) {
                                                            const text = commentText;
                                                            setCommentText("");
                                                            try {
                                                                // Optimistic update
                                                                const newCommentObj: any = {
                                                                    id: Date.now(),
                                                                    reel_id: currentStory.reelId,
                                                                    user_id: Number(user?.id || 0),
                                                                    comment: text,
                                                                    user: {
                                                                        id: Number(user?.id || 0),
                                                                        first_name: user?.first_name || "You",
                                                                        last_name: user?.last_name || "",
                                                                        picture: user?.picture || FALLBACK_PROFILE_IMG
                                                                    },
                                                                    created_at: Math.floor(Date.now() / 1000)
                                                                };
                                                                setReelDetailsById(prev => {
                                                                    const reel = prev[currentStory.reelId];
                                                                    if (!reel) return prev;
                                                                    return {
                                                                        ...prev,
                                                                        [currentStory.reelId]: {
                                                                            ...reel,
                                                                            comments: [newCommentObj, ...(reel.comments || [])]
                                                                        }
                                                                    };
                                                                });

                                                                await commentReel(currentStory.reelId, text);
                                                                const res = await getReelDetails(currentStory.reelId);
                                                                if (res.data) {
                                                                    setReelDetailsById(prev => ({ ...prev, [currentStory.reelId]: res.data! }));
                                                                }
                                                            } catch (err) {
                                                                console.error("Failed to comment", err);
                                                                setCommentText(text);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <FiSend className="text-white" size={18} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!currentStory) return;

                                                        const reelId = currentStory.reelId;
                                                        const currentlyLiked = isLiked;

                                                        setIsLiked(!currentlyLiked); // Optimistic

                                                        try {
                                                            if (currentlyLiked) {
                                                                await dislikeReel(reelId);
                                                            } else {
                                                                await likeReel(reelId);
                                                            }

                                                            // Update cache
                                                            setReelDetailsById((prev) => {
                                                                const reel = prev[reelId];
                                                                if (!reel) return prev;
                                                                let newLikes = reel.likes ? [...reel.likes] : [];
                                                                if (currentlyLiked) {
                                                                    newLikes = newLikes.filter(
                                                                        (l) => l.user_id !== currentUserId,
                                                                    );
                                                                } else {
                                                                    if (
                                                                        !newLikes.some(
                                                                            (l) => l.user_id === currentUserId,
                                                                        )
                                                                    ) {
                                                                        newLikes.push({ user_id: currentUserId! });
                                                                    }
                                                                }

                                                                return {
                                                                    ...prev,
                                                                    [reelId]: { ...reel, likes: newLikes },
                                                                };
                                                            });
                                                        } catch (err) {
                                                            setIsLiked(currentlyLiked); // Revert
                                                        }
                                                    }}
                                                    className={`flex items-center gap-1 p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95`}
                                                >
                                                    <BsFillHeartFill size={16} className={`${isLiked ? "text-red-500 fill-red-500" : "text-white"}`} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowLikes(true);
                                                    }}
                                                    className="p-1"
                                                >
                                                    <span className="text-white text-[12px] font-bold">
                                                        {(() => {
                                                            const reelId = currentStory?.reelId;
                                                            if (!reelId) return 0;
                                                            return reelDetailsById[reelId]?.likes?.length ?? 0;
                                                        })()}
                                                    </span>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <EyeIcon
                                                    size={16}

                                                />
                                                <span className="text-white text-[10px] font-bold">
                                                    {(() => {
                                                        const reelId = currentStory?.reelId;
                                                        if (!reelId) return 0;
                                                        return reelDetailsById[reelId]?.views_count ?? 0;
                                                    })()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowComments(!showComments);
                                                }}
                                                className={`p-2 flex items-center gap-1 rounded-full text-white transition-all hover:scale-110 active:scale-95`}
                                            >
                                                <FiMessageCircle size={16} />
                                                <span className="text-sm font-semibold">
                                                    {(() => {
                                                        const reelId = currentStory?.reelId;
                                                        if (!reelId) return 0;
                                                        return reelDetailsById[reelId]?.comments?.length ?? 0;
                                                    })()}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Comments Sidebar Overlay */}
                            {showComments && currentStory && (
                                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowComments(false)}>
                                    <div className="absolute bottom-0 left-0 right-0 max-h-[70%] bg-[#1c1c1e] rounded-t-3xl p-6 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                                        <div className="w-12 h-1.5 bg-gray-700/50 rounded-full mx-auto mb-6" onClick={() => setShowComments(false)} />

                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-white font-bold text-lg">Comments</h3>
                                            <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white transition-colors">
                                                <FiX size={24} />
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide">
                                            {(() => {
                                                const reelId = currentStory.reelId;
                                                const details = reelDetailsById[reelId];
                                                const comments = details?.comments || [];

                                                if (comments.length === 0) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center py-10 opacity-30 text-white">
                                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                                            <p className="text-sm">No comments yet</p>
                                                        </div>
                                                    );
                                                }

                                                return comments.map((comment) => (
                                                    <div key={comment.id} className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                                            <img
                                                                src={comment.user?.picture || comment.user?.image || FALLBACK_PROFILE_IMG}
                                                                className="w-full h-full object-cover"
                                                                onError={e => e.currentTarget.src = FALLBACK_PROFILE_IMG}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-white text-xs font-bold">{comment.user?.first_name} {comment.user?.last_name}</span>
                                                                <span className="text-gray-500 text-[10px]">{formatTimeAgo(comment.created_at)}</span>
                                                            </div>
                                                            <p className="text-gray-300 text-sm mt-0.5">{comment.comment}</p>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
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
                                                            const text = commentText;
                                                            setCommentText("");
                                                            try {
                                                                // Optimistic update
                                                                const newCommentObj: any = {
                                                                    id: Date.now(),
                                                                    reel_id: currentStory.reelId,
                                                                    user_id: Number(user?.id || 0),
                                                                    comment: text,
                                                                    user: {
                                                                        id: Number(user?.id || 0),
                                                                        first_name: user?.first_name || "You",
                                                                        last_name: user?.last_name || "",
                                                                        picture: user?.picture || FALLBACK_PROFILE_IMG
                                                                    },
                                                                    created_at: Math.floor(Date.now() / 1000)
                                                                };
                                                                setReelDetailsById(prev => {
                                                                    const reel = prev[currentStory.reelId];
                                                                    if (!reel) return prev;
                                                                    return {
                                                                        ...prev,
                                                                        [currentStory.reelId]: {
                                                                            ...reel,
                                                                            comments: [newCommentObj, ...(reel.comments || [])]
                                                                        }
                                                                    };
                                                                });

                                                                await commentReel(currentStory.reelId, text);
                                                                const res = await getReelDetails(currentStory.reelId);
                                                                if (res.data) {
                                                                    setReelDetailsById(prev => ({ ...prev, [currentStory.reelId]: res.data! }));
                                                                }
                                                            } catch (err) {
                                                                setCommentText(text);
                                                            }
                                                        }
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 text-sm transition-all"
                                                />
                                                <button
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-500 hover:scale-110 transition-transform"
                                                    onClick={async () => {
                                                        if (commentText.trim() && currentStory) {
                                                            const text = commentText;
                                                            setCommentText("");
                                                            try {
                                                                // Optimistic update
                                                                const newCommentObj: any = {
                                                                    id: Date.now(),
                                                                    reel_id: currentStory.reelId,
                                                                    user_id: Number(user?.id || 0),
                                                                    comment: text,
                                                                    user: {
                                                                        id: Number(user?.id || 0),
                                                                        first_name: user?.first_name || "You",
                                                                        last_name: user?.last_name || "",
                                                                        picture: user?.picture || FALLBACK_PROFILE_IMG
                                                                    },
                                                                    created_at: Math.floor(Date.now() / 1000)
                                                                };
                                                                setReelDetailsById(prev => {
                                                                    const reel = prev[currentStory.reelId];
                                                                    if (!reel) return prev;
                                                                    return {
                                                                        ...prev,
                                                                        [currentStory.reelId]: {
                                                                            ...reel,
                                                                            comments: [newCommentObj, ...(reel.comments || [])]
                                                                        }
                                                                    };
                                                                });

                                                                await commentReel(currentStory.reelId, text);
                                                                const res = await getReelDetails(currentStory.reelId);
                                                                if (res.data) {
                                                                    setReelDetailsById(prev => ({ ...prev, [currentStory.reelId]: res.data! }));
                                                                }
                                                            } catch (err) {
                                                                setCommentText(text);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <FiSend size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Likes Sidebar Overlay */}
                            {showLikes && currentStory && (
                                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLikes(false)}>
                                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#1c1c1e] rounded-t-3xl p-6 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                                        <div className="w-12 h-1.5 bg-gray-700/50 rounded-full mx-auto mb-6" onClick={() => setShowLikes(false)} />

                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-white font-bold text-lg">Likes</h3>
                                            <button onClick={() => setShowLikes(false)} className="text-gray-400 hover:text-white transition-colors">
                                                <FiX size={24} />
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-4 mb-2 scrollbar-hide">
                                            {(() => {
                                                const reelId = currentStory.reelId;
                                                const details = reelDetailsById[reelId];
                                                const likes = details?.likes || [];

                                                if (likes.length === 0) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center py-10 opacity-30 text-white">
                                                            <BsFillHeartFill size={36} className="mb-2" />
                                                            <p className="text-sm">No likes yet</p>
                                                        </div>
                                                    );
                                                }

                                                return likes.map((like) => {
                                                    // Map against global loaded profiles if we don't have user object directly via like relation
                                                    const matchedProfile = profiles.find(p => p.userId === like.user_id);

                                                    return (
                                                        <div key={like.id || like.user_id} className="flex gap-3 items-center">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                                                <img
                                                                    src={matchedProfile?.img || FALLBACK_PROFILE_IMG}
                                                                    className="w-full h-full object-cover"
                                                                    onError={e => e.currentTarget.src = FALLBACK_PROFILE_IMG}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-white text-sm font-bold">{matchedProfile ? matchedProfile.name : `User ${like.user_id}`}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-red-500">
                                                                <BsFillHeartFill size={16} />
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons - Pinned Outside Main Card */}
                        <div className="hidden md:flex absolute inset-y-0 -left-16 -right-16 items-center justify-between pointer-events-none z-50">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    previousStory();
                                }}
                                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all pointer-events-auto hover:scale-110 active:scale-90 shadow-lg border border-white/20"
                            >
                                <FiChevronLeft size={28} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextStory();
                                }}
                                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all pointer-events-auto hover:scale-110 active:scale-90 shadow-lg border border-white/20"
                            >
                                <FiChevronRight size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Next Story Preview (Distance 1) */}
                    <div
                        className={`hidden lg:flex flex-col items-center justify-center w-1/5 h-full transition-all duration-500 ${nextUser1 ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"}`}
                        style={{
                            perspective: "1000px",
                            transform: nextUser1
                                ? "translateX(5%) rotateY(-20deg) scale(0.95) translateZ(0)"
                                : "none",
                            backfaceVisibility: "hidden",
                            transformStyle: "preserve-3d",
                        }}
                        onClick={() => nextUser1 && handleProfileClick(nextUser1.key)}
                    >
                        {nextUser1 && (
                            <div className="relative w-64 h-[448px] rounded-2xl overflow-hidden border border-white/30 shadow-xl transition-transform hover:scale-105">
                                {renderPreviewMedia(nextUser1, "w-full h-full object-cover")}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 flex items-end justify-center pb-8">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full border-2 border-white mx-auto mb-2 overflow-hidden">
                                            <img
                                                src={nextUser1.img}
                                                alt={nextUser1.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = FALLBACK_PROFILE_IMG;
                                                }}
                                            />
                                        </div>
                                        <p className="text-white font-bold text-sm">
                                            {nextUser1.name.split(" ")[0]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Far Next Story Preview (Distance 2) */}
                    <div
                        className={`hidden lg:flex flex-col items-center justify-center w-1/6 h-full transition-all duration-700 ${nextUser2 ? "opacity-60 cursor-pointer" : "opacity-0 pointer-events-none"}`}
                        style={{
                            perspective: "1000px",
                            transform: nextUser2
                                ? "translateX(20%) rotateY(-35deg) scale(0.85) translateZ(-50px)"
                                : "none",
                            backfaceVisibility: "hidden",
                            transformStyle: "preserve-3d",
                        }}
                        onClick={() => nextUser2 && handleProfileClick(nextUser2.key)}
                    >
                        {nextUser2 && (
                            <div className="relative w-56 h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-lg transition-all duration-500">
                                {renderPreviewMedia(nextUser2, "w-full h-full object-cover")}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-10 h-10 rounded-full border border-white/50 mx-auto mb-1 overflow-hidden">
                                            <img
                                                src={nextUser2.img}
                                                alt={nextUser2.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = FALLBACK_PROFILE_IMG;
                                                }}
                                            />
                                        </div>
                                        <p className="text-white font-medium text-xs opacity-80">
                                            {nextUser2.name.split(" ")[0]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Options Menu Modal */}
                    {showOptionsMenu && (
                        <div
                            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
                            onClick={() => setShowOptionsMenu(false)}
                        >
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                            <div
                                className="relative w-full max-w-sm bg-[#262626] rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col">
                                    {(() => {
                                        const profile = profiles.find((p) => p.key === selectedStory);
                                        const isOwner = profile?.userId === currentUserId || profile?.isYourStory;

                                        const options = [];
                                        if (isOwner) {
                                            options.push({ label: "Delete Reel", color: "text-red-500 font-bold", onClick: handleDeleteReel });
                                        } else {
                                            options.push({ label: "Report", color: "text-red-500 font-bold", onClick: () => { console.log("Reported"); setShowOptionsMenu(false); } });
                                        }

                                        // options.push({ label: "Mute", color: "text-red-500 font-bold", onClick: () => { console.log("Muted"); setShowOptionsMenu(false); } });
                                        // options.push({ label: "Share to...", color: "text-white", onClick: () => { console.log("Shared"); setShowOptionsMenu(false); } });

                                        return options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                className={`w-full py-3.5 px-4 text-sm border-b border-white/10 hover:bg-white/5 transition-colors active:bg-white/10 ${option.color}`}
                                                onClick={option.onClick}
                                            >
                                                {option.label}
                                            </button>
                                        ));
                                    })()}
                                    <button
                                        className="w-full py-3.5 px-4 text-sm text-white hover:bg-white/5 transition-colors active:bg-white/10"
                                        onClick={() => setShowOptionsMenu(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>,
                document.body
            )}

            {/* Reel Upload Modal */}
            <ReelUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    fetchReels();
                    fetchMyReels();
                    // Re-fetch again shortly after to handle potential backend indexing delays
                    setTimeout(() => {
                        fetchReels();
                        fetchMyReels();
                    }, 3000);
                }}
            />
        </>
    );
};

export default ReelSection;
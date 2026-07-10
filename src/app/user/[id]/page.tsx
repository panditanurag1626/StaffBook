"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import SkillsSidebar from "@/components/profile/SkillsSidebar";
import { THEME } from "@/styles/theme";
import { User, profileService } from "@/lib/api";
import { postService } from "@/lib/api/services/postService";
import { connectionService } from "@/lib/api/services/connectionService";
import { getReelsList, type Reel } from "@/lib/api/reelService";
import CertificationsSection from "@/components/profile/CertificationsSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import PostCard from "@/components/Networking/feed/PostCard";
import Card from "@/components/shared/Card";
import PlatformActionButton from "@/components/shared/PlatformActionButton";
import {
  FiArrowLeft, FiGrid, FiLoader, FiPlay, FiUser,
  FiBriefcase, FiAward, FiUserPlus, FiCheck
} from "react-icons/fi";
import { Building } from "lucide-react";
import type { Post } from "@/data/networking";

type CenterView = "overview" | "posts" | "connections";

function UserReels({ userId, userName }: { userId: string; userName: string }) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allReels: Reel[] = [];
        for (let page = 1; page <= 50; page++) {
          const reelsRes = await getReelsList(page);
          const pageReels = reelsRes.data?.reels ?? [];
          if (pageReels.length === 0) break;
          allReels.push(...pageReels);
        }
        const userReels = allReels.filter((r: Reel) => String(r.user_id) === String(userId));
        setReels(userReels);
      } catch {
        setReels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex justify-center py-4">
          <FiLoader className="w-5 h-5 text-purple-600 animate-spin" />
        </div>
      </Card>
    );
  }

  if (reels.length === 0) return null;

  return (
    <Card className="p-4">
      <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
        <FiPlay size={12} className="text-purple-500" />
        {userName}'s Reels
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {reels.slice(0, 4).map((reel) => (
          <div key={reel.id} className="group cursor-pointer relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-100">
            {reel.thumbnailUrl ? (
              <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <FiPlay size={20} className="text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FiPlay size={24} className="text-white" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ConnectionsList({ userId }: { userId: string }) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const res = await connectionService.getOtherConnections(Number(userId));
        setConnections(res?.data?.data ?? []);
      } catch {
        setConnections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <FiLoader className="w-6 h-6 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (connections.length === 0) {
    return <p className={`text-sm ${THEME.colors.text.body} text-center py-8`}>No connections yet</p>;
  }

  return (
    <div className="space-y-3">
      {connections.map((conn: any) => (
        <div
          key={conn.id}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => window.location.href = `/user/${conn.id}`}
        >
          <img
            src={conn.avatar || '/images/user_profile_placeholder.jpeg'}
            alt={conn.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">{conn.name}</p>
            <p className={`text-xs ${THEME.colors.text.body}`}>{conn.title || conn.headline || ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const sanitizeUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("http") && url.lastIndexOf("http") > 0) {
    return url.substring(url.lastIndexOf("http"));
  }
  return url;
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>("loading");
  const [isConnecting, setIsConnecting] = useState(false);

  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [connectionCount, setConnectionCount] = useState<number>(0);
  const [centerView, setCenterView] = useState<CenterView>("overview");
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await profileService.getOtherProfile(userId);
      const data = res?.data?.user;
      setProfile(data);
      setUserData(data);
      setUserName(data?.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : data?.username || 'User');

      try {
        const postsRes = await postService.getUserPosts(Number(userId));
        const posts = postsRes?.data?.data ?? postsRes?.data ?? [];
        setTotalPosts(Array.isArray(posts) ? posts.length : 0);
        setUserPosts(Array.isArray(posts) ? posts : []);
      } catch {
        setTotalPosts(0);
        setUserPosts([]);
      }

      try {
        const connRes = await connectionService.getOtherConnections(Number(userId));
        const conns = connRes?.data?.data ?? [];
        setConnectionCount(Array.isArray(conns) ? conns.length : 0);
      } catch {
        setConnectionCount(0);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSendConnection = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);
    try {
      setConnectionStatus("pending");
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleViewPosts = async () => {
    setCenterView("posts");
    if (userPosts.length === 0 && !postsLoading) {
      setPostsLoading(true);
      try {
        const postsRes = await postService.getUserPosts(Number(userId));
        const posts = postsRes?.data?.data ?? postsRes?.data ?? [];
        setUserPosts(Array.isArray(posts) ? posts : []);
      } catch {
        setUserPosts([]);
      } finally {
        setPostsLoading(false);
      }
    }
  };

  const handleViewConnections = () => {
    setCenterView("connections");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ed]">
        <FiLoader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 md:p-4 lg:p-8 mt-[60px] bg-[#f3f2ed]">
      <div className="w-full px-3 sm:px-6 max-w-7xl mx-auto">
        <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#666] hover:text-primary transition-colors"
          >
            <FiArrowLeft className="mr-1.5" size={16} />
            Back
          </button>
        </nav>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column (3 cols) - User Details & Actions */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Profile Card */}
            <Card className="p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-200 mb-3">
                {profile?.picture || profile?.image ? (
                  <img src={sanitizeUrl(profile?.picture || profile?.image) || '/images/user_profile_placeholder.jpeg'} alt={userName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/user_profile_placeholder.jpeg'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiUser size={32} />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-gray-700 text-center">{userName}</h3>
              {profile?.designation && (
                <p className={`text-xs ${THEME.colors.text.body} mt-1`}>{profile.designation}</p>
              )}
              {profile?.employerDetails?.company_name && (
                <p className={`text-xs ${THEME.colors.text.body} flex items-center justify-center gap-1 mt-1`}>
                  <Building size={12} />
                  {profile.employerDetails.company_name}
                </p>
              )}
              {profile?.location && (
                <p className={`text-xs ${THEME.colors.text.body} mt-1`}>{profile.location}</p>
              )}
            </Card>

            {/* Stat Boxes */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center cursor-pointer group hover:border-purple-300 hover:bg-purple-50/50 transition-all active:border-purple-400 active:bg-purple-100/50" onClick={handleViewPosts}>
                <div className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-purple-600 transition-colors">{totalPosts}</div>
                <div className="text-sm sm:text-base text-gray-500">Posts</div>
              </Card>
              <Card className="p-4 text-center cursor-pointer group hover:border-purple-300 hover:bg-purple-50/50 transition-all active:border-purple-400 active:bg-purple-100/50" onClick={handleViewConnections}>
                <div className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-purple-600 transition-colors">{connectionCount}</div>
                <div className="text-sm sm:text-base text-gray-500">Connection</div>
              </Card>
            </div>

            {/* Connect Button */}
            <Card className="p-4">
              {connectionStatus === "connected" || connectionStatus === "pending" ? (
                <PlatformActionButton
                  icon={FiCheck}
                  label="Connect"
                  showLabelBelow
                  disabled
                />
              ) : (
                <PlatformActionButton
                  icon={isConnecting ? FiLoader : FiUserPlus}
                  label="Connect"
                  showLabelBelow
                  isLoading={isConnecting}
                  onClick={handleSendConnection}
                />
              )}
            </Card>
          </div>

          {/* Center Column (6 cols) */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="p-8 min-h-[600px]">
              {centerView === "overview" && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h1 className="font-semibold text-xs sm:text-sm text-gray-700">Profile Overview</h1>
                  </div>

                  {profile?.bio && (
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                      <h2 className="font-semibold text-xs sm:text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <FiUser className="text-purple-500" /> About
                      </h2>
                      <p className={`${THEME.colors.text.body} leading-relaxed whitespace-pre-line text-sm`}>{profile.bio}</p>
                    </div>
                  )}

                  <div className="mb-8">
                    <h2 className="font-semibold text-xs sm:text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <FiBriefcase className="text-purple-500" /> Experience
                    </h2>
                    <ExperienceSection readOnly={true} experiences={userData?.experience || []} />
                  </div>
                  <hr className="my-6 border-gray-100" />

                  <div className="mb-8">
                    <h2 className="font-semibold text-xs sm:text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <FiAward className="text-purple-500" /> Education
                    </h2>
                    <EducationSection readOnly={true} educations={userData?.educations || []} />
                  </div>

                  <ProjectsSection readOnly={true} projects={userData?.projectList || []} />
                  <CertificationsSection readOnly={true} certifications={userData?.certificationList || []} />
                </>
              )}

              {centerView === "posts" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCenterView('overview')}>
                    <FiArrowLeft className="text-gray-500 hover:text-purple-600 transition-colors" size={20} />
                    <h1 className="font-semibold text-xs sm:text-sm text-gray-700">Recent Posts</h1>
                  </div>
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <FiLoader className="w-6 h-6 text-purple-600 animate-spin" />
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <FiGrid size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className={`text-sm ${THEME.colors.text.body}`}>No posts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {centerView === "connections" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCenterView('overview')}>
                    <FiArrowLeft className="text-gray-500 hover:text-purple-600 transition-colors" size={20} />
                    <h1 className="font-semibold text-xs sm:text-sm text-gray-700">Connections</h1>
                  </div>
                  <ConnectionsList userId={userId} />
                </div>
              )}
            </Card>
          </div>

          {/* Right Column (3 cols) */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6 space-y-4">
              <UserReels userId={userId} userName={userName} />
              <Card className="p-4">
                <SkillsSidebar readOnly={true} skills={userData?.skill || []} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
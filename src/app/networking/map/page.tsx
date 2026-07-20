"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import MapComponent from "../../../components/shared/MapComponent";
import PlatformActionButton from "../../../components/shared/PlatformActionButton";
import { connectionService } from "../../../lib/api/services/connectionService";
import { getCurrentUser } from "../../../lib/api/authService";
import { getCurrentLocation } from "../../../lib/utils";
import { sendNotificationToUser } from "../../../lib/firebaseNotifications";
import { FiCheck, FiUserPlus, FiArrowLeft, FiMapPin, FiCalendar, FiMail, FiPhone, FiBriefcase, FiFileText, FiAward, FiMap } from "react-icons/fi";
import toast from "react-hot-toast";
import { db } from "../../../lib/firebase";
import { ref as dbRef, onValue } from "firebase/database";

// Online/Offline status dot — listens to Firebase Realtime DB
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

const NetworkingMapPage: React.FC = () => {
  const router = useRouter();
  const [radius, setRadius] = useState(25);
  const [mapProfiles, setMapProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | number | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 19.076,
    lng: 72.8777,
  });
  const [locationLoaded, setLocationLoaded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initialize user + location
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.is_premium) setIsPremium(true);

    const getUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error("Error fetching user location:", error);
        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (apiKey) {
          try {
            const response = await fetch(
              `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
              }
            );
            if (response.ok) {
              const data = await response.json();
              if (data.location) setUserLocation(data.location);
            }
          } catch (err) {
            console.error("Google Geolocation API failed:", err);
          }
        }
      } finally {
        setLocationLoaded(true);
      }
    };

    getUserLocation();
  }, []);

  const mapUser = (user: any) => ({
    id: user.id || Math.random(),
    name: `${user.first_name} ${user.last_name}`,
    role: user.designation || "Member",
    company: user.employerDetails?.company_name || "",
    avatar: user.picture || "/images/user_profile_placeholder.jpeg",
    lat: parseFloat(user.latitude || "0"),
    lng: parseFloat(user.longitude || "0"),
    distance: user.distance_display,
    connection_status: user.connection_status,
    email: user.email,
    phone: user.phone,
    title: user.designation || "",
    headline: user.headline || "",
    location: user.location || "",
    city: user.city || "",
    experience: user.experience || [],
    is_premium: user.is_premium || false,
    user_mode_type: user.user_mode_type || null,
    user_type: user.user_type || null,
  });

  const fetchNearbyConnections = async (currentRadius: number, currentPage: number) => {
    if (currentPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await connectionService.getNearbyConnections(
        currentPage,
        userLocation.lat,
        userLocation.lng,
        currentRadius
      );

      if (response?.data) {
        const usersData = Array.isArray(response.data.connections.items)
          ? response.data.connections.items
          : response.data.connections.items || [];

        const meta = response.data.connections._meta;
        const pageCount = meta?.pageCount || 1;
        const total = meta?.totalCount || usersData.length;

        const mappedUsers = usersData.map(mapUser);

        if (currentPage === 1) {
          setMapProfiles(mappedUsers);
        } else {
          setMapProfiles(prev => [...prev, ...mappedUsers]);
        }

        setTotalCount(total);
        setHasMore(currentPage < pageCount);
        setPage(currentPage);
      }
    } catch (error) {
      console.error("Failed to fetch nearby connections", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    if (newRadius < 25 && !isPremium) {
      setRadius(25);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }
    // Reset pagination when radius changes
    setPage(1);
    setHasMore(false);
    setMapProfiles([]);
    setRadius(newRadius);
  };

  // Debounce fetch on radius / location change — always starts from page 1
  useEffect(() => {
    if (!locationLoaded) return;
    const timer = setTimeout(() => {
      fetchNearbyConnections(radius, 1);
    }, 500);
    return () => clearTimeout(timer);
  }, [radius, userLocation, locationLoaded]);

  // IntersectionObserver: auto-load next page when sentinel is visible
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchNearbyConnections(radius, page + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, radius]);

  const handleConnect = async (connectionUserId: number) => {
    try {
      const user = getCurrentUser();
      if (!user?.id) return;

      await connectionService.sendConnectionRequest(user.id, connectionUserId);

      await sendNotificationToUser(
        connectionUserId,
        Number(user.id),
        `${user.first_name} ${user.last_name}`,
        user.picture || "",
        "connection_request",
        `${user.first_name} ${user.last_name} sent you a connection request.`
      );

      toast.success("Connection request sent successfully!");
      fetchNearbyConnections(radius, 1);
    } catch (error) {
      console.error("Failed to send connection request:", error);
      toast.error("Failed to send connection request");
    }
  };

  return (
    <div className="h-[100dvh] bg-[#f3f2ed] flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Page Body — below navbar, exactly fills remaining height */}
      <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100dvh - 70px)', marginTop: '70px' }}>
        {/* Page Header Bar */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-4 shrink-0 shadow-sm z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-900 hover:text-purple-700 transition-colors font-medium"
          >
            <FiArrowLeft size={16} />
            Back
          </button>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
              <FiMapPin size={14} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">
                Connect Nearby
              </h1>
              <p className="text-xs font-medium text-gray-600 mt-0.5">
                {mapProfiles.length} people found within {radius} km
              </p>
            </div>
          </div>

          {/* Radius Slider — in header bar */}
          <div className="ml-auto flex items-center gap-3 relative">
            <span className="text-xs font-medium text-gray-600 hidden sm:block">
              Search Radius
            </span>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-24 sm:w-36 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${radius}%, #e5e7eb ${radius}%, #e5e7eb 100%)`,
              }}
            />
            <div className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-full min-w-[58px] text-center">
              <span className="text-xs font-bold text-purple-700">
                {radius} km
              </span>
            </div>

            {showTooltip && (
              <div className="absolute -bottom-9 right-0 bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50">
                Upgrade to increase radius beyond 25 km
              </div>
            )}
          </div>
        </div>

        {/* Main Two-Panel Layout — fills all remaining height, no overflow */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT — Map */}
          <div className="flex-1 relative min-h-0">
            <MapComponent
              users={mapProfiles}
              type="users"
              radius={radius}
              center={userLocation}
              className="h-full w-full"
              embedded={true}
              onRadiusChange={handleRadiusChange}
              onConnect={handleConnect}
              hoveredUserId={hoveredCardId}
            />

            {/* Floating Legend — desktop */}
            <div className="hidden lg:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 px-3 py-2.5 items-center gap-3">
              <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">MAP LEGEND</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] border-2 border-white shadow-sm shrink-0" />
                <span className="text-xs text-gray-700">Employer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c4b5fd] border-2 border-white shadow-sm shrink-0" />
                <span className="text-xs text-gray-700">Job Seeker</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none lg:pointer-events-auto lg:relative w-full lg:w-[380px] shrink-0 bg-transparent lg:bg-white lg:border-l lg:border-gray-100 flex flex-col lg:overflow-hidden lg:shadow-xl pb-[70px] lg:pb-0">
            {/* Panel Header */}
            <div className="hidden lg:block px-4 py-3 border-b border-gray-100 bg-gray-50/50 shrink-0 pointer-events-auto">
              <h3 className="text-sm font-semibold text-gray-700">
                Network with Nearby People
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading
                  ? "Searching..."
                  : totalCount > 0
                  ? `Showing ${mapProfiles.length} of ${totalCount} people`
                  : `${mapProfiles.length} results found`}
              </p>
            </div>

            {/* Scrollable Cards */}
            <div 
              className="flex-1 overflow-x-auto lg:overflow-x-hidden               overflow-y-hidden lg:overflow-y-auto px-4 lg:p-3 flex flex-row lg:flex-col gap-4 lg:gap-3 lg:custom-scrollbar snap-x snap-mandatory pointer-events-auto w-full max-w-[100vw] lg:bg-gray-50/30 hide-scroll max-h-[260px] lg:max-h-none"
              onScroll={(e) => {
                const target = e.currentTarget;
                const index = Math.round(target.scrollLeft / target.offsetWidth);
                if (index !== activeCardIndex) setActiveCardIndex(index);
              }}
            >
              {loading ? (
                // Skeleton loader
                <div className="flex flex-row lg:flex-col gap-4 lg:gap-3 lg:pt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-[75vw] sm:w-[280px] lg:w-auto shrink-0 snap-center bg-white rounded-2xl p-3 lg:p-4 border border-gray-100 animate-pulse shadow-lg lg:shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-px bg-gray-100 mb-3" />
                      <div className="flex gap-4 justify-between">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-gray-100" />
                            <div className="h-2 w-8 bg-gray-100 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : mapProfiles.length > 0 ? (
                mapProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="w-[70vw] sm:w-[280px] lg:w-auto shrink-0 snap-center bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-3 lg:p-4 border border-purple-200 hover:border-purple-400 transition-all duration-300 group shadow-lg lg:shadow-md lg:min-h-[240px] flex flex-col"
                  >
                    {/* User Info */}
                    <div className="flex items-start gap-3 mb-3 cursor-pointer flex-1"
                    >
                      <Link href={`/user/${profile.id}`} className="shrink-0">
                        <div className="relative">
                          <Image
                            src={profile.avatar || "/images/user_profile_placeholder.jpeg"}
                            alt={profile.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border border-gray-100"
                          />
                          <UserOnlineStatus userId={profile.id} />
                        </div>
                      </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
                            <Link href={`/user/${profile.id}`} className="shrink-0 min-w-0 max-w-[55%]">
                              <h4 className="text-sm font-semibold text-purple-950 truncate group-hover:text-purple-600 transition-colors">
                                {profile.name}
                              </h4>
                            </Link>
                            {profile.user_type === 'employer' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-700 text-white text-[9px] font-black uppercase tracking-wide shrink-0 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                                Employer
                              </span>
                            )}
                            {profile.user_type === 'job_seeker' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-800 text-[9px] font-black uppercase tracking-wide shrink-0 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                Job Seeker
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 truncate font-medium flex items-center gap-1 mt-1 min-h-4">
                            <FiBriefcase size={10} className="shrink-0 text-purple-500" />
                            <span className="max-w-[120px] truncate">{profile.title || ""}</span>
                          </p>
                          <p className="text-xs text-gray-700 truncate flex items-center gap-1 mt-1 min-h-4">
                            <FiFileText size={10} className="shrink-0 text-purple-500" />
                            <span className="max-w-[140px] truncate">{profile.headline || ""}</span>
                          </p>
                          <p className="text-xs text-gray-700 truncate flex items-center gap-1 mt-1 min-h-4">
                            <FiAward size={10} className="shrink-0 text-purple-500" />
                            <span className="max-w-[140px] truncate">{profile.experience && profile.experience.length > 0 ? `${profile.experience[0].title} at ${profile.experience[0].company_name}` : ""}</span>
                          </p>
                          <p className="text-xs text-gray-700 flex items-center gap-1 mt-1 min-h-4">
                            <FiMapPin size={10} className="shrink-0 text-purple-500" />
                            <span className="max-w-[80px] truncate">{profile.distance || ""}</span>
                          </p>
                          <p className="text-xs text-gray-700 truncate flex items-center gap-1 mt-1 min-h-4">
                            <FiMap size={10} className="shrink-0 text-purple-500" />
                            <span className="max-w-[100px] truncate">{(() => {
                              if (profile.city) return profile.city;
                              if (!profile.location) return "";
                              const first = profile.location.split(',')[0].trim();
                              return /^-?\d+(\.\d+)?$/.test(first) ? "" : first;
                            })()}</span>
                          </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-purple-200/60 mb-3" />

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-center gap-3">
                      {/* Connect / Status Button */}
                      {profile.connection_status === "connected" ? (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="h-10 w-10 flex items-center justify-center bg-green-100 border-2 border-green-300 rounded-full text-green-700">
                            <FiCheck size={16} />
                          </div>
                          <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">
                            Connected
                          </span>
                        </div>
                      ) : profile.connection_status === "sent_connection" ? (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="h-10 w-10 flex items-center justify-center bg-purple-200 border-2 border-purple-300 rounded-full text-purple-700">
                            <FiCheck size={16} />
                          </div>
                          <span className="text-[8px] font-black text-purple-700 uppercase tracking-widest">
                            Sent
                          </span>
                        </div>
                      ) : profile.connection_status === "received_connection" ? (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="h-10 w-10 flex items-center justify-center bg-blue-100 border-2 border-blue-300 rounded-full text-blue-700">
                            <FiCheck size={16} />
                          </div>
                          <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest">
                            Received
                          </span>
                        </div>
                      ) : (
                        <PlatformActionButton
                          icon={FiUserPlus}
                          size="md"
                          label="Connect"
                          showLabelBelow
                          className="!w-10 !h-10"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleConnect(profile.id);
                          }}
                        />
                      )}

                      {/* Meet */}
                      <PlatformActionButton
                        icon={FiCalendar}
                        label="Meet"
                        showLabelBelow
                        size="md"
                        className="!w-10 !h-10"
                        disabled={profile.connection_status !== "connected"}
                        title={
                          profile.connection_status !== "connected"
                            ? "Connect first to schedule a meeting"
                            : ""
                        }
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          window.dispatchEvent(
                            new CustomEvent("openMeetingModal", {
                              detail: {
                                candidateName: profile.name,
                                candidateId: profile.id,
                              },
                            })
                          );
                        }}
                      />

                      {/* Email */}
                      <PlatformActionButton
                        icon={FiMail}
                        label="EMAIL"
                        showLabelBelow
                        size="md"
                        className="!w-10 !h-10"
                        disabled={profile.connection_status !== "connected"}
                        title={
                          profile.connection_status !== "connected"
                            ? "Connect first to view email"
                            : ""
                        }
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          toast("Connect first to view email details", {
                            icon: "ℹ️",
                          });
                        }}
                      />

                      {/* Contact */}
                      <PlatformActionButton
                        icon={FiPhone}
                        label="CONTACT"
                        showLabelBelow
                        size="md"
                        className="!w-10 !h-10"
                        disabled={profile.connection_status !== "connected"}
                        title={
                          profile.connection_status !== "connected"
                            ? "Connect first to view contact"
                            : ""
                        }
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          toast("Connect first to view contact details", {
                            icon: "ℹ️",
                          });
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiUserPlus className="text-2xl text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">
                    No people found nearby
                  </p>
                  <p className="text-xs text-gray-400">
                    Try increasing the search radius
                  </p>
                </div>
              )}

              {/* Sentinel div — IntersectionObserver triggers next page load */}
              {hasMore && (
                <div ref={sentinelRef} className="py-2">
                  {loadingMore && (
                    <div className="flex items-center justify-center gap-2 py-3">
                      <div className="w-5 h-5 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
                      <span className="text-xs text-gray-400 font-medium">Loading more...</span>
                    </div>
                  )}
                </div>
              )}

              {/* All loaded indicator */}
              {!hasMore && mapProfiles.length > 0 && !loading && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] text-gray-400 font-medium shrink-0">All {mapProfiles.length} results loaded</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}
            </div>

            {/* Slider Dots (Mobile Only) */}
            {mapProfiles.length > 0 && (
              <div className="flex lg:hidden justify-center gap-1.5 pb-2 pointer-events-auto">
                {mapProfiles.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeCardIndex ? "w-4 bg-purple-600" : "w-1.5 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Mobile Legend — below cards, one row */}
            <div className="flex lg:hidden items-center justify-center gap-4 px-4 py-2 border-t border-gray-100 bg-white/95 pointer-events-auto">
              <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">MAP LEGEND</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7c3aed] border border-white shadow-sm shrink-0" />
                <span className="text-[9px] font-bold text-gray-900">Employer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c4b5fd] border border-white shadow-sm shrink-0" />
                <span className="text-[9px] font-bold text-gray-900">Job Seeker</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .hide-scroll {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .hide-scroll::-webkit-scrollbar {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NetworkingMapPage;

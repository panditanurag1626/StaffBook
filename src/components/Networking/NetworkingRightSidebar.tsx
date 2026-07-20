"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { THEME } from '../../styles/theme';
import { FiUserPlus, FiX, FiCheck, FiLoader } from "react-icons/fi";
import MapComponent from "../shared/MapComponent";
import ConnectButton from "../shared/ConnectButton";
import PlatformActionButton from "../shared/PlatformActionButton";
import { connectionService } from "../../lib/api/services/connectionService";
import { bannerService, Banner } from "../../lib/api/services/bannerService";
import { getCurrentUser } from "../../lib/api/authService";
import { sendNotificationToUser } from "../../lib/firebaseNotifications";
import { getCurrentLocation, cn } from "../../lib/utils";
import toast from 'react-hot-toast';
import Link from "next/link";

const BannerSlider: React.FC = () => {
  const [slides, setSlides] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await bannerService.getBannerSliders();
        if (res.data?.banners?.items) {
          setSlides(res?.data?.banners?.items);
        }
      } catch (err) {
        console.error("Failed to fetch banners", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="w-full h-40 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-md h-40 group border border-gray-100">
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides?.map((slide) => (
          <a
            key={slide.id}
            href={slide.target_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex-shrink-0 h-full relative bg-gray-50 block hover:opacity-95 transition-opacity"
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title || slide.name || "Sponsor Banner"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={slides.indexOf(slide) === 0}
            />
            {(slide.title || slide.name) && (slide.title !== "null" && slide.name !== "null") && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
                <h4 className="text-sm font-bold truncate">{slide.title || slide.name}</h4>
              </div>
            )}
          </a>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${currentSlide === idx ? "bg-white w-3" : "bg-white/50 hover:bg-white/80"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NetworkingRightSidebar: React.FC = () => {
  const [radius, setRadius] = React.useState(25);
  const [mapProfiles, setMapProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  // Default to Mumbai location as fallback
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 19.0760,
    lng: 72.8777
  });
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Hover popup state
  const [hoveredProfileId, setHoveredProfileId] = useState<string | null>(null);
  const sidebarHoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarHideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSidebarHoverCard = (profileId: string) => {
    if (sidebarHideTimeoutRef.current) clearTimeout(sidebarHideTimeoutRef.current);
    sidebarHoverTimeoutRef.current = setTimeout(() => {
      setHoveredProfileId(profileId);
    }, 300);
  };

  const hideSidebarHoverCard = () => {
    if (sidebarHoverTimeoutRef.current) clearTimeout(sidebarHoverTimeoutRef.current);
    sidebarHideTimeoutRef.current = setTimeout(() => {
      setHoveredProfileId(null);
    }, 300);
  };

  // Initialize checks and fetch data
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.is_premium) {
      setIsPremium(true);
    }

    // Fetch User Location using browser geolocation for better precision
    const getUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error("Error fetching user location:", error);
        // Fallback to Google Geolocation API if browser fails OR if you want it as a backup
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (apiKey) {
          try {
            const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });
            if (response.ok) {
              const data = await response.json();
              if (data.location) setUserLocation(data.location);
            }
          } catch (err) {
            console.error("Google Geolocation API failed too:", err);
          }
        }
      } finally {
        setLocationLoaded(true);
      }
    };

    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNearbyConnections = async (currentRadius: number) => {
    setLoading(true);
    try {
      // Use dynamic userLocation
      const response = await connectionService.getNearbyConnections(
        1,
        userLocation.lat,
        userLocation.lng,
        currentRadius
      );
      console.log(response);

      if (response && response.data) {
        // Map API response to MapUser interface
        // Assuming response.data is an array of users or response.data.items
        const usersData = Array.isArray(response.data.connections.items) ? response.data.connections.items : (response.data.connections.items || []);

        const mappedUsers = usersData.map((user: any) => ({
          id: user.id || Math.random(),
          name: `${user.first_name} ${user.last_name}`,
          role: user.designation || 'Member',
          company: user.employerDetails?.company_name || '',
          avatar: user.picture || "/images/user_profile_placeholder.jpeg",
          lat: parseFloat(user.latitude || '0'),
          lng: parseFloat(user.longitude || '0'),
          distance: user.distance_display,
          connection_status: user.connection_status,
          email: user.email,
          phone: user.phone,
          title: user.designation || '',
          headline: user.headline || '',
          location: user.location || '',
          experience: user.experience || [],
          is_premium: user.is_premium || false,
          user_mode_type: user.user_mode_type || null,
          user_type: user.user_type || null,
        }));
        setMapProfiles(mappedUsers);
      }
    } catch (error) {
      console.error("Failed to fetch nearby connections", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    if (newRadius < 25 && !isPremium) {
      setRadius(25);
      setShowTooltip(true);

      // Auto hide after 2 sec
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }
    setRadius(newRadius);
  };

  // Debounce API call when radius or location changes
  useEffect(() => {
    if (!locationLoaded) return;
    const Timer = setTimeout(() => {
      fetchNearbyConnections(radius);
    }, 500);
    return () => clearTimeout(Timer);
  }, [radius, userLocation, locationLoaded]);



  const handleConnect = async (connectionUserId: number) => {
    try {
      const user = getCurrentUser();
      if (!user?.id) {
        console.error("User not logged in");
        return;
      }
      await connectionService.sendConnectionRequest(user.id, connectionUserId);

      await sendNotificationToUser(
        connectionUserId,
        Number(user.id),
        `${user.first_name} ${user.last_name}`,
        user.picture || '',
        'connection_request',
        `${user.first_name} ${user.last_name} sent you a connection request.`
      );

      toast.success("Connection request sent successfully!");
      console.log(`Connection request sent to user ${connectionUserId}`);
      fetchNearbyConnections(radius);
    } catch (error) {
      console.error("Failed to send connection request:", error);
      toast.error("Failed to send connection request");
    }
  };

  return (
    <div className="flex flex-col gap-2 pb-28 lg:pb-4">
      <div className="flex flex-col gap-2">
        {/* Map Section */}
        <div className={THEME.components.card.default}>
          <div className="flex flex-col gap-4 mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Connect Nearby <span className="text-gray-400 font-normal">({mapProfiles.length})</span>
            </h3>

            {/* Radius Slider Section */}
            <div className="bg-white/50 rounded-xl relative mt-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Search Radius
                </span>
                <div className="px-4 py-2 bg-purple-50/80 border border-purple-100/30 rounded-[18px] shadow-sm min-w-[70px] text-center">
                  <span className="text-sm font-medium text-gray-700">
                    {radius} km
                  </span>
                </div>
              </div>
              <div className="relative flex items-center px-1 mb-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={radius}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="w-[85%] h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-purple-600"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(radius / 100) * 100}%, #f3f4f6 ${(radius / 100) * 100}%, #f3f4f6 100%)`
                  }}
                />

                {showTooltip && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[11px] px-3 py-1.5 rounded-md shadow-md whitespace-nowrap animate-fade-in">
                    Upgrade to increase radius beyond 25 km
                  </div>
                )}
              </div>
            </div>
          </div>

          <MapComponent
            users={mapProfiles}
            type="users"
            radius={radius}
            center={userLocation}
            className="h-[260px] w-full"
            onRadiusChange={handleRadiusChange}
            onConnect={handleConnect}
            expandRoute="/networking/map"
            markerHoverZoom={false}
          />

          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : mapProfiles.length > 0 ? (
              mapProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onMouseEnter={() => showSidebarHoverCard(profile.id)}
                  onMouseLeave={hideSidebarHoverCard}
                  className="flex items-center border-b-1 border-gray-300 gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group relative"
                >
                  <Link href={`/user/${profile.id}`}>
                    <Image
                      src={`${profile.avatar}`}
                      alt={profile.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"

                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/user/${profile.id}`}>
                      <h5 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                        {profile.name}
                      </h5>
                    </Link>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.distance}
                    </p>
                    {hoveredProfileId === profile.id && (
                      <div
                        onMouseEnter={() => showSidebarHoverCard(profile.id)}
                        onMouseLeave={hideSidebarHoverCard}
                        className="absolute top-full left-0 mt-1 z-50 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={profile.avatar || '/images/user_profile_placeholder.jpeg'}
                              alt={profile.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-sm font-bold text-gray-900">{profile.name}</h5>
                            {profile.title && (
                              <p className="text-xs text-gray-600 mt-0.5">{profile.title}</p>
                            )}
                            {profile.headline && (
                              <p className="text-xs text-gray-500 mt-0.5">{profile.headline}</p>
                            )}
                            {profile.location && (
                              <p className="text-xs text-gray-400 mt-0.5">{profile.location}</p>
                            )}
                            {profile.experience && profile.experience.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {profile.experience[0].title} at {profile.experience[0].company_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {profile.connection_status === 'not_connected' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleConnect(profile.id); }}
                              className="w-full py-1.5 text-xs font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                            >
                              Connect
                            </button>
                          )}
                          {profile.connection_status === 'connected' && (
                            <span className="block w-full py-1.5 text-xs font-semibold text-center text-gray-500 bg-gray-100 rounded-full">
                              Connected
                            </span>
                          )}
                          {(profile.connection_status === 'sent_connection' || profile.connection_status === 'received_connection') && (
                            <span className="block w-full py-1.5 text-xs font-semibold text-center text-gray-500 bg-gray-100 rounded-full">
                              {profile.connection_status === 'sent_connection' ? 'Connection Requested' : 'Connection Received'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {profile.connection_status === "connected" ? (
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="h-8 w-8 flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-full text-green-600 cursor-default">
                        <FiCheck size={14} />
                      </div>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">
                        Connected
                      </span>
                    </div>
                  ) : profile.connection_status === "sent_connection" ? (
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="h-8 w-8 flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-full text-gray-600 cursor-default">
                        <FiCheck size={14} />
                      </div>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">
                        Sent
                      </span>
                    </div>
                  ) : profile.connection_status === "received_connection" ? (
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="h-8 w-8 flex items-center justify-center bg-blue-50 border-2 border-blue-200 rounded-full text-blue-600 cursor-default">
                        <FiCheck size={14} />
                      </div>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">
                        Received
                      </span>
                    </div>
                  ) : (
                    <PlatformActionButton
                      icon={FiUserPlus}
                      size="sm"
                      label="Connect"
                      showLabelBelow
                      className="!w-8 !h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(profile.id);
                      }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-xs text-gray-400">
                No users found nearby.
              </div>
            )}
          </div>
        </div>

        {/* Promo Slider Banner */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-700 px-1">Promotional Ads</h3>
          <BannerSlider />
        </div>
      </div>
    </div >
  );
};

export default NetworkingRightSidebar;

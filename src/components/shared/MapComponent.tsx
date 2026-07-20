"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { GoogleMap, useJsApiLoader, Marker, Circle, OverlayView, InfoWindow } from "@react-google-maps/api";
import { FiLoader, FiMapPin, FiUserPlus, FiPlus, FiMaximize2, FiBookmark, FiNavigation, FiSend, FiPhone, FiCalendar, FiMail, FiDownload, FiCompass, FiCheck, FiX } from "react-icons/fi";
import { THEME } from "../../styles/theme";
import ConnectButton from "./ConnectButton";
import Modal from "./Modal";
import ApplyButton from "./ApplyButton";
import PlatformActionButton from "./PlatformActionButton";
import { getCurrentLocation } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { jobService } from "../../lib/api/services/jobService";
import toast from "react-hot-toast";
import { notifyJobInvite } from "../../lib/firebaseNotifications";
import { db } from "../../lib/firebase";
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

  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <span
      className={`absolute -top-0.5 -left-0.5 ${dotSize} ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full z-10`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};

const modalMapStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem 0 0 1rem",
};

const mobileModalMapStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0",
};

// Default center (New Delhi)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

const defaultUserImage = "/images/user_profile_placeholder.jpeg";

// Google Maps libraries to load
const libraries: ("places")[] = ["places"];

// Mock job locations
const jobLocations: MapJob[] = [
  { id: 1, lat: 28.6139, lng: 77.209, title: "Software Engineer" },
  { id: 2, lat: 28.5355, lng: 77.391, title: "Product Designer" },
  { id: 3, lat: 28.4595, lng: 77.0266, title: "Marketing Manager" },
];

interface MapUser {
  id: number | string;
  name: string;
  role: string;
  avatar: string;
  lat?: number;
  lng?: number;
  distance?: number | string;
  company?: string;
  connection_status?: string;
  is_premium?: boolean;
  phone?: string;
  email?: string;
  title?: string;
  headline?: string;
  location?: string;
  experience?: any[];
  user_mode_type?: string | null;
  user_type?: string | null;
}

interface MapJob {
  id: number | string;
  lat: number;
  lng: number;
  title: string;
  company?: string;
  location?: string;
  posterName?: string;
  posterImage?: string;
  distance?: number | string;
  isOnline?: boolean;
  phone?: string;
  email?: string;
  salary?: string;
}

interface MapComponentProps {
  users?: MapUser[];
  jobs?: MapJob[];
  className?: string;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
  embedded?: boolean;
  onConnect?: (userId: number) => void;
  onInvite?: (userId: number) => void;
  type?: 'users' | 'jobs';
  context?: 'networking' | 'find-candidates';
  jobPostId?: string | number;
  center?: { lat: number; lng: number };
  /** When provided, clicking the map thumbnail navigates to this route instead of opening the popup modal */
  expandRoute?: string;
  hoveredUserId?: string | number | null;
  /** Disable the 3x hover zoom on map markers (used in sidebar preview) */
  markerHoverZoom?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  users = [],
  jobs = [],
  className,
  radius,
  onRadiusChange,
  embedded = false,
  onConnect,
  onInvite,
  type = "users",
  context = "networking",
  jobPostId,
  center,
  expandRoute,
  hoveredUserId: externalHoveredUserId = null,
  markerHoverZoom = true,
}) => {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapCenter = center || currentLocation || defaultCenter;

  React.useEffect(() => {
    if (!center) {
      setIsLocating(true);
      getCurrentLocation()
        .then(loc => {
          setCurrentLocation(loc);
          setIsLocating(false);
        })
        .catch(err => {
          console.error("Geolocation failed:", err);
          setIsLocating(false);
        });
    }
  }, [center]);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAYth6W-TTXAdXotw1ZlhjRLrsYjrSidYo",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<{ id: string | number, type: string } | null>(null);
  const [hoveredUser, setHoveredUser] = useState<MapUser | null>(null);
  const [hoveredJob, setHoveredJob] = useState<MapJob | null>(null);
  const [hoveredModalUserId, setHoveredModalUserId] = useState<string | number | null>(null);
  const modalHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMapUserHoverCard = (userId: string | number) => {
    if (modalHideTimeoutRef.current) clearTimeout(modalHideTimeoutRef.current);
    modalHoverTimeoutRef.current = setTimeout(() => {
      setHoveredModalUserId(userId);
    }, 300);
  };

  const hideMapUserHoverCard = () => {
    if (modalHoverTimeoutRef.current) clearTimeout(modalHoverTimeoutRef.current);
    modalHideTimeoutRef.current = setTimeout(() => {
      setHoveredModalUserId(null);
    }, 300);
  };

  const formatConnectionStatus = (status: string) => {
    if (status === 'not_connected') return '+ Connect';
    if (status === 'sent_connection') return 'Connection Requested';
    if (status === 'received_connection') return 'Connection Received';
    const words = status.replace(/_/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  };
  const [revealedDetails, setRevealedDetails] = useState<{
    type: 'contact' | 'email';
    value: string;
    userName: string;
  } | null>(null);

  const handleInvite = async (targetUserId: string | number) => {
    if (context === 'find-candidates') {
      if (onInvite) {
        onInvite(Number(targetUserId));
      } else if (jobPostId) {
        setLoadingAction({ id: targetUserId, type: 'invite' });
        try {
          await jobService.sendJobInvite(jobPostId, targetUserId);
          toast.success("Job invitation sent!");

          // Dispatch global sync event so candidate cards update their status
          window.dispatchEvent(new CustomEvent('staffbook_candidateInvited', { detail: { candidateId: targetUserId } }));

          // Firebase notification
          if (user?.id && String(user.id) !== String(targetUserId)) {
            notifyJobInvite(targetUserId, user.id, user.employerDetails?.company_name || `${user.first_name} ${user.last_name}`, user.picture || '', jobPostId);
          }
        } catch (err: any) {
          let errMsg = err.response?.data?.message || "Failed to send invite";
          if (err.response?.data?.data?.errors?.message?.[0]) {
            errMsg = err.response.data.data.errors.message[0];
          }
          if (errMsg.toLowerCase().includes('already applied') || errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('already invited')) {
            errMsg = 'This user has already applied for this job.';
          }
          toast.error(errMsg);
        } finally {
          setLoadingAction(null);
        }
      } else {
        toast.error("Please select a job post to invite candidates.");
      }
    } else {
      // Networking context - Connect request
      if (onConnect) {
        onConnect(Number(targetUserId));
      }
    }
  };

  const handleAction = async (targetId: string | number, actionType: 'email' | 'contact' | 'cv') => {
    const isEmployer = user?.user_type === 'employer';
    const payload: any = {
      count: 1,
      user_type: isEmployer ? 'employer' : 'job_seeker',
      contact_flow: isEmployer ? 'employer_to_job_seeker' : 'job_seeker_to_employer'
    };

    if (isEmployer) {
      payload.candidate_id = Number(targetId);
    } else {
      payload.employer_id = Number(targetId);
    }

    if (jobPostId) {
      payload.job_post_id = Number(jobPostId);
    }

    setLoadingAction({ id: targetId, type: actionType });
    try {
      let res: any;
      // Ensure we have a valid numeric jobPostId or null
      const jId = jobPostId ? Number(jobPostId) : null;

      if (actionType === 'contact') {
        res = type === 'jobs' 
          ? await jobService.getEmployerContactDetails(targetId)
          : await jobService.revealCandidateContact(jId, targetId, payload);
      } else if (actionType === 'email') {
        res = type === 'jobs'
          ? await jobService.getEmployerEmailDetails(targetId)
          : await jobService.revealCandidateEmail(jId, targetId, payload);
      } else if (actionType === 'cv') {
        res = await jobService.downloadCandidateResume(jId, targetId);
      }

      const isSuccess = res && (
        res.status === 200 || 
        res.status === 201 || 
        res.status === 204 ||
        res.data?.already_unlocked ||
        res.data?.data?.already_unlocked ||
        res.data?.credit_consumed ||
        res.data?.data?.credit_consumed
      );

      if (isSuccess) {
        toast.success(`${actionType.toUpperCase()} details unlocked!`);

        // Show details in a modal
        if (actionType === 'contact' || actionType === 'email') {
          // Find the target in our local data
          const targetUser = users.find(u => String(u.id) === String(targetId));
          const targetJob = jobs.find(j => String(j.id) === String(targetId));

          // Use data from API response if available
          const responseData = res?.data?.data || res?.data || res;
          const value = actionType === 'contact'
            ? (responseData?.phone || targetUser?.phone || targetJob?.phone)
            : (responseData?.email || targetUser?.email || targetJob?.email);

          if (value) {
            setRevealedDetails({
              type: actionType,
              value: String(value),
              userName: targetUser?.name || targetJob?.posterName || targetJob?.company || targetJob?.title || 'User'
            });
          } else {
            toast.error(`Details unlocked! However, ${actionType} was not provided in the data.`);
          }
        }

        // If it's a CV download, open the URL
        if (actionType === 'cv') {
          const resumeUrl = res.data?.resume_url || res.data?.data?.resume_url;
          if (resumeUrl) {
            window.open(resumeUrl, '_blank');
          }
        }
      } else {
        throw new Error(res?.message || `Failed to process ${actionType}`);
      }
    } catch (err: any) {
      console.error(`Error in ${actionType} action:`, err);
      toast.error(err.response?.data?.message || err.message || `Failed to process ${actionType}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // Adjust map bounds when radius changes to ensure circle is visible
  React.useEffect(() => {
    if (map && radius && radius > 0) {
      const radiusInMeters = radius * 1000;
      const bounds = new window.google.maps.LatLngBounds();

      // Calculate circle bounds
      const circle = new window.google.maps.Circle({
        center: mapCenter,
        radius: radiusInMeters,
      });

      bounds.union(circle.getBounds()!);
      map.fitBounds(bounds);

      // Add some padding
      const zoom = map.getZoom();
      if (zoom) {
        map.setZoom(zoom - 0.5);
      }
    }
  }, [map, radius, mapCenter]);


  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds(mapCenter);

    // Only extend bounds for the relevant type
    if (type === "users" && users.length > 0) {
      if (users[0].lat) {
        users.forEach(u => {
          if (u.lat && u.lng) bounds.extend({ lat: u.lat, lng: u.lng });
        });
      }
    } else if (type === "jobs" && jobs.length > 0) {
      jobs.forEach((loc) => {
        if (loc.lat && loc.lng) bounds.extend({ lat: loc.lat, lng: loc.lng });
      });
    }

    // Only fit bounds if we extended them (i.e. we have data)
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
    // If empty, it stays at defaultCenter

    setMap(map);
  }, [users, jobs, type, mapCenter]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const renderMapContent = (isModal = false) => {
    // If embedded, treat as interactive modal content but with full dimensions
    const isInteractive = isModal || embedded;

    if (!isLoaded || isLocating) {
      return (
        <div className={`w-full ${isInteractive ? 'h-full' : (className ? 'h-full' : 'aspect-square')} bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2`}>
          <FiLoader className="animate-spin text-2xl" />
          <span className="text-sm font-medium">{isLocating ? 'Detecting Location...' : 'Loading Map...'}</span>
        </div>
      );
    }

    if (!(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAYth6W-TTXAdXotw1ZlhjRLrsYjrSidYo")) {
      // Premium Mock Map Visualization
      return (
        <div className={`w-full ${isInteractive ? 'h-full' : (className ? 'h-full' : 'aspect-square')} bg-[#f8fafc] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner`}>
          {/* Map Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

          {/* Schematic Map Elements (Buildings/Roads) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 400 400">
            <rect x="50" y="50" width="60" height="40" rx="4" fill="currentColor" />
            <rect x="150" y="20" width="80" height="100" rx="4" fill="currentColor" />
            <rect x="280" y="80" width="40" height="60" rx="4" fill="currentColor" />
            <line x1="0" y1="180" x2="400" y2="180" stroke="currentColor" strokeWidth="20" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeWidth="20" />
          </svg>

          {/* Dynamic Radius Circle (SVG) */}
          {radius && (
            <div className="z-20 absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-full aspect-square flex items-center justify-center overflow-visible">
                <div
                  className="border-2 border-purple-500/40 bg-purple-500/10 rounded-full transition-all duration-300 ease-out flex items-center justify-center relative"
                  style={{
                    width: `${Math.min(radius * 1.8 + 6, 96)}%`,
                    height: `${Math.min(radius * 1.8 + 6, 96)}%`,
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)'
                  }}
                >
                  <div
                    className="w-full h-full rounded-full border border-purple-500/20 animate-pulse"
                    style={{ animationDuration: '4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Center Point - High Density Navigation Aesthetic */}
          <div className="relative z-30 flex items-center justify-center">
            {/* Outer Pulsing Glow */}
            <div
              className={`absolute w-16 h-16 bg-purple-500/15 rounded-full animate-ping opacity-60`}
              style={{ animationDuration: '3.5s' }}
            ></div>
            <div
              className={`absolute w-12 h-12 bg-purple-500/10 rounded-full animate-ping opacity-80`}
              style={{ animationDuration: '2.5s' }}
            ></div>

            {/* Core Circle Icon */}
            <div className={`w-11 h-11 bg-white rounded-full shadow-[0_0_20px_rgba(147,51,234,0.25)] flex items-center justify-center border-[2.5px] border-purple-600 relative z-40 transition-transform duration-500 hover:scale-110 flex-shrink-0`}>
              <FiNavigation className="text-purple-600 rotate-45 transform translate-x-0.5 -translate-y-0.5" size={22} />
            </div>

            {/* Bottom Scan Label Tooltip */}
            <div className="absolute top-[52px] left-1/2 transform -translate-x-1/2 bg-white px-5 py-2.5 rounded-[22px] shadow-[0_10px_25px_-5px_rgba(147,51,234,0.15)] flex items-center gap-3 border border-purple-100/50 z-50 animate-fadeIn min-w-max">
              <div className="w-[3px] h-8 bg-purple-600 rounded-full" />
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-gray-900 leading-none tracking-tight">
                  {radius || 10} KM
                </span>
                <span className="text-[8px] font-bold text-gray-400 leading-tight uppercase tracking-[0.2em] mt-0.5">
                  RADIUS
                </span>
                <span className="text-[8px] font-bold text-gray-400 leading-[0.8] uppercase tracking-[0.2em]">
                  SCAN
                </span>
              </div>
            </div>
          </div>

          {/* Map Integration Overlay - Hide if embedded or modal */}
          {!isInteractive && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-30 cursor-pointer p-8 text-center bg-gradient-to-t from-white/80 via-white/40 to-transparent">
              <div>
                <p className="text-xs text-gray-800 font-black mb-1 uppercase tracking-tighter">Live Map Disabled</p>
                <p className="text-[10px] text-gray-500 leading-tight">Click to view setup instructions</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Dynamic style based on usage (Modal > Custom Class > Default Square)
    let mapStyle;
    if (embedded) {
      mapStyle = { width: "100%", height: "100%", borderRadius: "1rem" };
    } else if (isModal) {
      mapStyle = isMobile ? mobileModalMapStyle : modalMapStyle;
    } else if (className) {
      mapStyle = { width: "100%", height: "100%", borderRadius: "1rem" };
    } else {
      mapStyle = containerStyle;
    }

    return (
      <div className="relative w-full h-full">
        <GoogleMap
          mapContainerStyle={mapStyle}
          center={mapCenter}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: !isInteractive,
            zoomControl: isInteractive,
            scrollwheel: isInteractive,
            draggable: isInteractive,
            // 'greedy' enables pinch-to-zoom on all touch devices (phone/iPad)
            // and unrestricted scroll-wheel zoom on desktop — no "use 2 fingers" overlay
            gestureHandling: isInteractive ? 'greedy' : 'none',
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ]
          }}
        >
          {type === "users" && users.length > 0 && (
            users.map(u => (
              u.lat && u.lng && (
                <React.Fragment key={u.id}>
                  <OverlayView
                    position={{ lat: u.lat, lng: u.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div 
                      onMouseEnter={() => setHoveredUser(u)}
                      onMouseLeave={() => setHoveredUser(null)}
                      onClick={() => router.push(`/user/${u.id}`)}
                      className="relative transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:z-20 group"
                    >
                      <div className={`w-10 h-10 rounded-full overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition-transform duration-300 ${markerHoverZoom ? 'group-hover:scale-[3]' : ''}`}>
                        <img 
                          src={u.avatar || defaultUserImage} 
                          alt={u.name} 
                          className="w-full h-full object-cover bg-white pointer-events-none"
                        />
                      </div>
                      {/* Account type dot — dark purple / light purple */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm pointer-events-none ${
                        u.user_type === 'employer' ? 'bg-[#7c3aed]' : 'bg-[#c4b5fd]'
                      }`} />
                    </div>
                  </OverlayView>

                  {(hoveredUser?.id === u.id || externalHoveredUserId === u.id) && (
                    <InfoWindow 
                      position={{ lat: u.lat, lng: u.lng }} 
                      options={{ disableAutoPan: true, pixelOffset: new google.maps.Size(0, -25) }}
                    >
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onMouseEnter={() => setHoveredUser(u)}
                        onMouseLeave={() => setHoveredUser(null)}
                        onClick={() => router.push(`/user/${u.id}`)}
                      >
                        <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden border border-gray-100 shadow-sm relative">
                          <img 
                            src={u.avatar || defaultUserImage} 
                            alt={u.name} 
                            className="w-full h-full object-cover"
                          />
                          <UserOnlineStatus userId={u.id} />
                        </div>
                        <div className="flex flex-col justify-center max-w-[190px]">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-black text-gray-900 leading-tight truncate">{u.name}</p>
                            {u.user_type === 'employer' ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-700 text-white text-[8px] font-black uppercase tracking-wide shrink-0">Employer</span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-800 text-[8px] font-black uppercase tracking-wide shrink-0">Job Seeker</span>
                            )}
                          </div>
                          {u.role && <p className="text-[11px] font-bold text-gray-500 leading-tight mt-0.5 truncate">{u.role}</p>}
                          {(u as any).headline && <p className="text-[10px] text-gray-500 italic leading-tight mt-0.5 truncate">{(u as any).headline}</p>}
                          {(u as any).company && <p className="text-[10px] text-purple-600 font-semibold leading-tight mt-0.5 truncate">{(u as any).company}</p>}
                          {(u as any).location && <p className="text-[11px] font-medium text-gray-400 leading-tight mt-1 truncate">{(u as any).location.split(',')[0].trim()}</p>}
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </React.Fragment>
              )
            ))
          )}

          {type === "jobs" && jobs.length > 0 && (
            jobs.map((location) => (
              location.lat && location.lng && (
                <Marker
                  key={location.id}
                  position={{ lat: location.lat, lng: location.lng }}
                  onMouseOver={() => setHoveredJob(location)}
                  onMouseOut={() => setHoveredJob(null)}
                  icon={{
                    path: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z",
                    fillColor: "#8b5cf6",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 1.5,
                    scale: 1.2,
                    anchor: new google.maps.Point(12, 12),
                  }}
                >
                  {hoveredJob?.id === location.id && (
                    <InfoWindow options={{ disableAutoPan: true }}>
                      <div className="px-1 py-1 min-w-[120px]">
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider mb-0.5">{location.company}</p>
                        <p className="text-xs font-bold text-gray-900 leading-tight mb-1">{location.title}</p>
                        {location.salary && (
                          <div className="flex items-center gap-1 mt-1 pt-1 border-t border-gray-100">
                            <span className="text-[9px] font-bold text-gray-400">CTC:</span>
                            <span className="text-[10px] font-bold text-green-600">{location.salary}</span>
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              )
            ))
          )}

          {/* Dynamic Radius Circle */}
          {radius && radius > 0 && (
            <>
              <Circle
                center={mapCenter}
                radius={radius * 1000} // Convert km to meters
                options={{
                  fillColor: "#8b5cf6",
                  fillOpacity: 0.2,
                  strokeColor: "#8b5cf6",
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  clickable: false,
                  editable: false,
                  zIndex: 1,
                  visible: true,
                }}
              />
              {/* Custom Center Point Overlay replacing standard Marker */}
              <OverlayView
                position={mapCenter}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                  {/* Pings */}
                  <div className="absolute w-12 h-12 bg-purple-500/20 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>

                  {/* Icon */}
                  <div className="w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-purple-600 relative z-10 flex-shrink-0 overflow-hidden">
                    <FiNavigation className="text-purple-600 rotate-45" size={18} />
                  </div>

                  {/* Dynamic Tooltip Label */}
                  <div className="absolute top-[44px] left-1/2 transform -translate-x-1/2 bg-white px-4 py-2.5 rounded-[20px] shadow-xl flex items-center gap-2.5 border border-purple-100 min-w-max pointer-events-none">
                    <div className="w-[2.5px] h-7 bg-purple-600 rounded-full" />
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black text-gray-900 leading-none">{radius || 10} KM</span>
                      <span className="text-[7px] font-bold text-gray-400 leading-tight uppercase tracking-widest mt-0.5">RADIUS</span>
                      <span className="text-[7px] font-bold text-gray-400 leading-[0.8] uppercase tracking-widest">SCAN</span>
                    </div>
                  </div>
                </div>
              </OverlayView>
            </>
          )}
        </GoogleMap>
        
        {/* Inject CSS to reduce Google Maps standard UI font sizes and style InfoWindows */}
        <style jsx global>{`
          .gm-style-mtc button, .gm-style-mtc div {
            font-size: 10px !important;
            padding: 0 8px !important;
            height: 28px !important;
            line-height: 28px !important;
          }
          /* InfoWindow specific styling */
          .gm-style-iw.gm-style-iw-c {
            padding: 12px !important;
            border-radius: 16px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
            max-width: 260px !important;
          }
          .gm-style-iw-d {
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide the ugly default close 'X' button and its invisible header that causes extra top margin */
          .gm-ui-hover-effect, .gm-style-iw-ch {
            display: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        `}</style>
      </div>
    );
  };

  // If embedded, render just the map content without wrapper or modal logic
  if (embedded) {
    return (
      <div className={`relative w-full h-full ${className || ''}`}>
        {renderMapContent(true)}
      </div>
    );
  }

  return (
    <>
      <div
        className={`flex flex-col gap-4 relative group cursor-pointer ${className || ''}`}
        onClick={() => {
          if (expandRoute) {
            router.push(expandRoute);
          } else {
            setShowModal(true);
          }
        }}
      >
        <div className="pointer-events-none h-full w-full">
          {renderMapContent(false)}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1rem] flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiMaximize2 />
            {expandRoute ? 'Open Full Map' : 'Click to Expand'}
          </div>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="w-full h-full md:w-[90vw] md:max-w-[1000px] md:h-[600px] flex flex-col md:flex-row bg-white md:rounded-2xl overflow-hidden">

          {/* MOBILE HEADER - Top Row on Mobile */}
          <div className="md:hidden p-4 pb-2 bg-white z-20 flex flex-col gap-3 shrink-0">
            {onRadiusChange && (
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-sm font-medium text-gray-700">Search Radius</span>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={radius || 25}
                    onChange={(e) => onRadiusChange(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="text-xs font-bold text-purple-600 bg-white px-2 py-1 rounded-md border border-gray-100 min-w-[40px] text-center shadow-sm">
                    {radius || 25} km
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pr-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">{type === "users" ? "Network with Nearby People" : "Nearby Jobs"}</h3>
                <p className="text-xs text-gray-500">{type === "users" ? users.length : jobs.length} results found</p>
              </div>
            </div>
          </div>

          {/* Map Area - Reduced height on mobile */}
          <div className="flex-none h-[140px] md:h-full md:flex-1 relative border-y md:border-y-0 md:border-r border-gray-100">
            {renderMapContent(true)}
          </div>

          {/* List Area */}
          <div className="flex-1 md:w-[320px] lg:w-[350px] bg-white flex flex-col min-h-0">
            {/* DESKTOP HEADER - Hidden on mobile */}
            <div className="hidden md:flex p-4 pr-14 border-b border-gray-100 items-center justify-between sticky top-0 bg-white z-10">
              {onRadiusChange && (
                <div className="flex flex-col items-start pr-4 border-r border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Search Radius</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={radius || 25}
                      onChange={(e) => onRadiusChange(Number(e.target.value))}
                      className="w-24 md:w-32 h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-purple-600 hover:bg-gray-200 transition-all"
                    />
                    <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 min-w-[50px] text-center shadow-sm">
                      {radius || 25} km
                    </span>
                  </div>
                </div>
              )}
              <div className="flex-1 pl-4">
                <h3 className="text-sm font-semibold text-gray-700">{type === "users" ? context === 'find-candidates' ? "Explore Candidates in Your Area" : "Network with Nearby People" : "Nearby Jobs"}</h3>
                <p className="text-xs text-gray-500">{type === "users" ? users.length : jobs.length} results found</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3 bg-gray-50/30">
              {type === "users" ? (
                // Users List logic
                users.length > 0 ? (
                  users.map(user => {

                    const isPremium = context === 'find-candidates' && user?.is_premium;

                    return (
                      <div key={user.id} className={`transition-all duration-300 ${isPremium ? 'rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 shadow-purple-500/20 shadow-lg hover:shadow-purple-500/40 p-[3px]' : ''}`}>
                        <div
                          className={`bg-white flex flex-col hover:shadow-lg transition-all duration-300 group cursor-pointer shadow-sm ${isPremium ? 'rounded-[13px] p-3 h-full border-0' : 'rounded-2xl p-3 border border-gray-100'}`}
                          onClick={() => {
                            if (map && user.lat && user.lng) {
                              map.panTo({ lat: user.lat, lng: user.lng });
                              map.setZoom(14);
                            }
                          }}
                        >
                          {isPremium && (
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black px-4 py-0.5 rounded-b-xl shadow-md tracking-widest uppercase border-x border-b border-white/20 backdrop-blur-sm self-start -mt-1 mb-1.5">
                              Premium Candidate
                            </div>
                          )}
                          <div
                            onMouseEnter={() => showMapUserHoverCard(user.id)}
                            onMouseLeave={hideMapUserHoverCard}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const profileLink = context === 'find-candidates'
                                    ? `/profile/find-candidates/${user.id}${jobPostId ? `?jobId=${jobPostId}` : ''}`
                                    : `/user/${user.id}`;
                                  router.push(profileLink);
                                }}
                              >
                                <img
                                  src={user.avatar || defaultUserImage}
                                  alt={user.name}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4
                                  className="text-sm font-semibold text-gray-700 truncate hover:text-purple-600 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const profileLink = context === 'find-candidates'
                                      ? `/profile/find-candidates/${user.id}${jobPostId ? `?jobId=${jobPostId}` : ''}`
                                      : `/user/${user.id}`;
                                    router.push(profileLink);
                                  }}
                                >
                                  {user.name}
                                </h4>
                                {hoveredModalUserId === user.id && (
                                  <div
                                    onMouseEnter={() => showMapUserHoverCard(user.id)}
                                    onMouseLeave={hideMapUserHoverCard}
                                    className="absolute top-full left-0 mt-1 z-50 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="relative flex-shrink-0">
                                        <img
                                          src={user.avatar || defaultUserImage}
                                          alt={user.name}
                                          className="w-12 h-12 rounded-full object-cover"
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h5 className="text-sm font-bold text-gray-900">{user.name}</h5>
                                        {user.title && (
                                          <p className="text-xs text-gray-600 mt-0.5">{user.title}</p>
                                        )}
                                        {user.headline && (
                                          <p className="text-xs text-gray-500 mt-0.5">{user.headline}</p>
                                        )}
                                        {user.location && (
                                          <p className="text-xs text-gray-400 mt-0.5">{user.location}</p>
                                        )}
                                        {user.experience && user.experience.length > 0 && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {user.experience[0].title} at {user.experience[0].company_name}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                      {user.connection_status === 'not_connected' && onConnect && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); onConnect(Number(user.id)); }}
                                          className="w-full py-1.5 text-xs font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                                        >
                                          Connect
                                        </button>
                                      )}
                                      {user.connection_status === 'connected' && (
                                        <span className="block w-full py-1.5 text-xs font-semibold text-center text-gray-500 bg-gray-100 rounded-full">
                                          Connected
                                        </span>
                                      )}
                                      {(user.connection_status === 'sent_connection' || user.connection_status === 'received_connection') && (
                                        <span className="block w-full py-1.5 text-xs font-semibold text-center text-gray-500 bg-gray-100 rounded-full">
                                          {formatConnectionStatus(user.connection_status)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500 truncate font-semibold text-wrap">{user?.distance}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center justify-between gap-1 pt-3 border-t border-gray-50">
                            {user.connection_status === "connected" ? (
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className="h-8 w-8 flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-full text-green-600 cursor-default">
                                  <FiCheck size={14} />
                                </div>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">Connected</span>
                              </div>
                            ) : user.connection_status === "sent_connection" ? (
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className="h-8 w-8 flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-full text-gray-600 cursor-default">
                                  <FiCheck size={14} />
                                </div>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">Sent</span>
                              </div>
                            ) : user.connection_status === "received_connection" ? (
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className="h-8 w-8 flex items-center justify-center bg-blue-50 border-2 border-blue-200 rounded-full text-blue-600 cursor-default">
                                  <FiCheck size={14} />
                                </div>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">Received</span>
                              </div>
                            ) : (
                              <PlatformActionButton
                                icon={loadingAction?.id === user.id && loadingAction?.type === 'invite' ? FiUserPlus : FiUserPlus}
                                label="Connect"
                                showLabelBelow
                                size="sm"
                                className="!w-8 !h-8"
                                isLoading={loadingAction?.id === user.id && loadingAction?.type === 'invite'}
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleInvite(user.id);
                                }}
                              />
                            )}
                            <PlatformActionButton
                              icon={FiCalendar}
                              label="Meet"
                              showLabelBelow
                              size="sm"
                              className="!w-8 !h-8"
                              disabled={user.connection_status !== 'connected'}
                              title={user.connection_status !== 'connected' ? "Become a premium member to enable this." : ""}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                window.dispatchEvent(new CustomEvent('openMeetingModal', {
                                  detail: {
                                    candidateName: user.name,
                                    candidateId: user.id,
                                    jobPostId: jobPostId || undefined
                                  }
                                }));
                                setShowModal(false);
                              }}
                            />
                            <PlatformActionButton
                              icon={FiMail}
                              label="Email"
                              showLabelBelow
                              size="sm"
                              className="!w-8 !h-8"
                              isLoading={loadingAction?.id === user.id && loadingAction?.type === 'email'}
                              disabled={user.connection_status !== 'connected'}
                              title={user.connection_status !== 'connected' ? "Become a premium member to enable this." : ""}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleAction(user.id, 'email');
                              }}
                            />
                            {context !== 'networking' && (
                              <PlatformActionButton
                                icon={FiDownload}
                                label="CV"
                                showLabelBelow
                                size="sm"
                                className="!w-8 !h-8"
                                isLoading={loadingAction?.id === user.id && loadingAction?.type === 'cv'}
                                disabled={user.connection_status !== 'connected'}
                                title={user.connection_status !== 'connected' ? "Become a premium member to enable this." : ""}
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleAction(user.id, 'cv');
                                  setShowModal(false);
                                }}
                              />
                            )}
                            <PlatformActionButton
                              icon={FiPhone}
                              label="Contact"
                              showLabelBelow
                              size="sm"
                              className="!w-8 !h-8"
                              isLoading={loadingAction?.id === user.id && loadingAction?.type === 'contact'}
                              disabled={user.connection_status !== 'connected'}
                              title={user.connection_status !== 'connected' ? "Become a premium member to enable this." : ""}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleAction(user.id, 'contact');
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 gap-2 h-full">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <FiUserPlus className="text-2xl opacity-40" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">No profiles available</p>
                    <p className="text-xs text-gray-400">Try increasing the search radius</p>
                  </div>
                )
              ) : (
                // Jobs List logic
                jobs.length > 0 ? (
                  jobs.map(job => (
                    <div
                      key={job.id}
                      className="bg-white rounded-xl p-3 hover:shadow-lg transition-all duration-300 border border-gray-100 group shadow-sm"
                    >
                      {/* Top Section: Info & Actions Side-by-Side */}
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1 min-w-0 pr-1 pt-0.5">
                          <h3 className={`text-[15px] font-bold ${THEME.colors.text.heading} leading-tight mb-0.5 break-words line-clamp-2`}>
                            {job.title}
                          </h3>
                          <p className="text-xs text-gray-600 font-semibold truncate uppercase tracking-wide">
                            {job.company || "Company Name"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <PlatformActionButton
                            icon={FiBookmark}
                            label="Save"
                            showLabelBelow
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowModal(false);
                            }}
                            title="Save the job"
                          />
                          <PlatformActionButton
                            icon={FiMail}
                            label="Email"
                            showLabelBelow
                            size="sm"
                            isLoading={loadingAction?.id === job.id && loadingAction?.type === 'email'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(job.id, 'email');
                            }}
                            title="Email"
                          />
                          <PlatformActionButton
                            icon={FiPhone}
                            label="Contact"
                            showLabelBelow
                            size="sm"
                            isLoading={loadingAction?.id === job.id && loadingAction?.type === 'contact'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(job.id, 'contact');
                            }}
                            title="Contact"
                          />
                          <PlatformActionButton
                            icon={FiSend}
                            label="Apply"
                            showLabelBelow
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowModal(false);
                              router.push(`/profile/jobs/${job.id}`);
                            }}
                            title="Apply Now"
                          />
                        </div>
                      </div>

                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2 mt-2">Meet The Recruiter</p>

                      {/* Bottom Section: Recruiter Info with DP */}
                      <div className="flex items-center gap-2.5">
                        {/* Profile Image */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} p-[1.5px]`}>
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                              {job.posterImage ? (
                                <img
                                  src={job.posterImage}
                                  alt={job.posterName || "Poster"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${THEME.colors.gradient.sky} flex items-center justify-center text-white font-bold text-xs`}>
                                  {(job.posterName || job.company || "U").charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Online/Offline Status Tag */}
                          {job.isOnline !== false ? (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" title="Online"></div>
                          ) : (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 border-2 border-white rounded-full" title="Offline"></div>
                          )}
                        </div>

                        {/* Name, Designation and Distance */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-[13px] font-bold ${THEME.colors.text.heading} leading-tight truncate`}>
                            {job.posterName || job.company || "Recruiter"}
                          </h4>
                          <div className="flex flex-col">
                            {job.distance && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 mt-0.5">
                                <FiNavigation size={10} />
                                <span>{typeof job.distance === 'number' ? (job.distance as number).toFixed(1) : job.distance} km away</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 gap-2 h-full">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <FiBookmark className="text-2xl opacity-40" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">No jobs available</p>
                    <p className="text-xs text-gray-400">Try increasing the search radius</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* revealed details modal (Email/Contact) */}
      {revealedDetails && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setRevealedDetails(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {revealedDetails.type === 'contact' ? 'Contact Details' : 'Email Details'}
              </h3>
              <button onClick={() => setRevealedDetails(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${revealedDetails.type === 'contact' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {revealedDetails.type === 'contact' ? (
                    <FiPhone className="text-green-600" size={18} />
                  ) : (
                    <FiMail className="text-blue-600" size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                    {revealedDetails.type === 'contact' ? 'Phone Number' : 'Email Address'}
                  </p>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {revealedDetails.value || "Not available"}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                Details for {revealedDetails.userName}
              </p>
            </div>

            <button onClick={() => setRevealedDetails(null)} className="mt-8 w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-sm">
              Done
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default React.memo(MapComponent);

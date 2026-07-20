"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiX,
  FiMaximize2,
  FiMapPin,
  FiCheck,
  FiUserPlus,
  FiCalendar,
  FiMail,
  FiPhone,
  FiChevronDown,
} from "react-icons/fi";
import MapComponent from "../shared/MapComponent";
import PlatformActionButton from "../shared/PlatformActionButton";
import { connectionService } from "../../lib/api/services/connectionService";
import { getCurrentUser } from "../../lib/api/authService";
import { getCurrentLocation } from "../../lib/utils";
import { sendNotificationToUser } from "../../lib/firebaseNotifications";
import toast from "react-hot-toast";
import { db } from "../../lib/firebase";
import { ref as dbRef, onValue } from "firebase/database";

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

interface MobileMapBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMapBottomSheet: React.FC<MobileMapBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const [radius, setRadius] = useState(25);
  const [mapProfiles, setMapProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(
    { lat: 19.076, lng: 72.8777 }
  );
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Init only when sheet opens
  useEffect(() => {
    if (!isOpen) return;
    const user = getCurrentUser();
    if (user?.is_premium) setIsPremium(true);

    const getUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch {
        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
          "AIzaSyAYth6W-TTXAdXotw1ZlhjRLrsYjrSidYo";
        try {
          const res = await fetch(
            `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.location) setUserLocation(data.location);
          }
        } catch {}
      } finally {
        setLocationLoaded(true);
      }
    };
    getUserLocation();
  }, [isOpen]);

  const fetchNearby = async (currentRadius: number) => {
    setLoading(true);
    try {
      const response = await connectionService.getNearbyConnections(
        1,
        userLocation.lat,
        userLocation.lng,
        currentRadius
      );
      if (response?.data) {
        const usersData =
          Array.isArray(response.data.connections.items)
            ? response.data.connections.items
            : response.data.connections.items || [];

        setMapProfiles(
          usersData.map((user: any) => ({
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
            experience: user.experience || [],
            is_premium: user.is_premium || false,
            user_mode_type: user.user_mode_type || null,
            user_type: user.user_type || null,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch nearby connections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!locationLoaded) return;
    const timer = setTimeout(() => fetchNearby(radius), 500);
    return () => clearTimeout(timer);
  }, [radius, userLocation, locationLoaded]);

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
      toast.success("Connection request sent!");
      fetchNearby(radius);
    } catch {
      toast.error("Failed to send connection request");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="lg:hidden fixed bottom-[72px] left-0 right-0 z-[201] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-slide-up"
        style={{ height: "82vh", maxHeight: "82vh" }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <FiMapPin size={13} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none">
                Connect Nearby
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {loading ? "Searching..." : `${mapProfiles.length} people found`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand to full page */}
            <Link
              href="/networking/map"
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <FiMaximize2 size={11} />
              Full Map
            </Link>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>

        {/* Map area — fixed height */}
        <div className="shrink-0" style={{ height: "40%" }}>
          <MapComponent
            users={mapProfiles}
            type="users"
            radius={radius}
            center={userLocation}
            className="h-full w-full"
            embedded={true}
            onRadiusChange={setRadius}
            onConnect={handleConnect}
          />
        </div>

        {/* Radius Slider */}
        <div className="shrink-0 px-4 py-2.5 border-y border-gray-100 bg-white flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 shrink-0">Radius</span>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={radius}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val < 25 && !isPremium) {
                toast("Upgrade to search below 25 km", { icon: "ℹ️" });
                return;
              }
              setRadius(val);
            }}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-purple-600"
            style={{
              background: `linear-gradient(to right, #9333ea 0%, #9333ea ${radius}%, #e5e7eb ${radius}%, #e5e7eb 100%)`,
            }}
          />
          <div className="px-2.5 py-1 bg-purple-50 border border-purple-100 rounded-full shrink-0">
            <span className="text-xs font-bold text-purple-700">{radius} km</span>
          </div>
        </div>

        {/* Scrollable User Cards */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50/40 custom-scrollbar pb-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
            </div>
          ) : mapProfiles.length > 0 ? (
            mapProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
              >
                {/* User info row */}
                <div className="flex items-center gap-2.5 mb-2">
                  <Link href={`/user/${profile.id}`} onClick={onClose} className="shrink-0">
                    <div className="relative">
                      <img
                        src={profile.avatar || "/images/user_profile_placeholder.jpeg"}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      />
                      <UserOnlineStatus userId={profile.id} />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link href={`/user/${profile.id}`} onClick={onClose}>
                        <h4 className="text-sm font-semibold text-gray-900 truncate hover:text-purple-700 transition-colors">
                          {profile.name}
                        </h4>
                      </Link>
                      {profile.user_type === 'employer' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-700 text-white text-[8px] font-black uppercase tracking-wide shrink-0">
                          <span className="w-1 h-1 rounded-full bg-white/80" />
                          Employer
                        </span>
                      )}
                      {profile.user_type === 'job_seeker' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-800 text-[8px] font-black uppercase tracking-wide shrink-0">
                          <span className="w-1 h-1 rounded-full bg-purple-500" />
                          Job Seeker
                        </span>
                      )}
                    </div>
                    {profile.title && (
                      <p className="text-[11px] text-gray-500 truncate">{profile.title}</p>
                    )}
                    <p className="text-[11px] text-purple-600 font-semibold">
                      {profile.distance}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {profile.connection_status === "connected" ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-full text-green-600">
                        <FiCheck size={12} />
                      </div>
                      <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
                        Connected
                      </span>
                    </div>
                  ) : profile.connection_status === "sent_connection" ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-full text-gray-500">
                        <FiCheck size={12} />
                      </div>
                      <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
                        Sent
                      </span>
                    </div>
                  ) : profile.connection_status === "received_connection" ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 flex items-center justify-center bg-blue-50 border-2 border-blue-200 rounded-full text-blue-600">
                        <FiCheck size={12} />
                      </div>
                      <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
                        Received
                      </span>
                    </div>
                  ) : (
                    <PlatformActionButton
                      icon={FiUserPlus}
                      size="sm"
                      label="Connect"
                      showLabelBelow
                      className="!w-7 !h-7"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleConnect(profile.id);
                      }}
                    />
                  )}

                  <PlatformActionButton
                    icon={FiCalendar}
                    label="Meet"
                    showLabelBelow
                    size="sm"
                    className="!w-7 !h-7"
                    disabled={profile.connection_status !== "connected"}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      window.dispatchEvent(
                        new CustomEvent("openMeetingModal", {
                          detail: { candidateName: profile.name, candidateId: profile.id },
                        })
                      );
                      onClose();
                    }}
                  />

                  <PlatformActionButton
                    icon={FiMail}
                    label="Email"
                    showLabelBelow
                    size="sm"
                    className="!w-7 !h-7"
                    disabled={profile.connection_status !== "connected"}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toast("Connect first to view email", { icon: "ℹ️" });
                    }}
                  />

                  <PlatformActionButton
                    icon={FiPhone}
                    label="Contact"
                    showLabelBelow
                    size="sm"
                    className="!w-7 !h-7"
                    disabled={profile.connection_status !== "connected"}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toast("Connect first to view contact", { icon: "ℹ️" });
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <FiUserPlus className="text-2xl text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">No people found nearby</p>
              <p className="text-xs text-gray-300">Try increasing the radius</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  );
};

export default MobileMapBottomSheet;

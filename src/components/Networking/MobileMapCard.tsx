"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMaximize2, FiMapPin } from "react-icons/fi";
import { connectionService } from "../../lib/api/services/connectionService";
import { getCurrentLocation } from "../../lib/utils";

const MobileMapCard: React.FC = () => {
  const router = useRouter();
  const [profileCount, setProfileCount] = useState(0);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [employerCount, setEmployerCount] = useState(0);
  const [seekerCount, setSeekerCount] = useState(0);

  useEffect(() => {
    const fetchNearbyPreview = async () => {
      try {
        const location = await getCurrentLocation().catch(() => ({ lat: 19.076, lng: 72.8777 }));
        const response = await connectionService.getNearbyConnections(
          1,
          location.lat,
          location.lng,
          25 // Default radius
        );

        if (response?.data?.connections?.items) {
          const items = response.data.connections.items;
          setProfileCount(response.data.connections._meta?.totalCount || items.length);
          
          const uniqueAvatars = items
            .map((u: any) => u.picture)
            .filter(Boolean)
            .slice(0, 5);
          setAvatars(uniqueAvatars);

          let employers = 0;
          let seekers = 0;
          items.forEach((u: any) => {
            if (u.user_type === 'employer') employers++;
            else if (u.user_type === 'job_seeker') seekers++;
          });
          setEmployerCount(employers);
          setSeekerCount(seekers);
        }
      } catch (e) {
        console.error("Failed to fetch map preview data", e);
      }
    };
    fetchNearbyPreview();
  }, []);

  return (
    <div 
      onClick={() => router.push('/networking/map')}
      className="lg:hidden w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow mt-1 mb-2"
    >
      {/* Top Map Image Preview */}
      <div className="relative h-32 w-full bg-gradient-to-br from-blue-100 to-blue-50">
        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.076,72.8777&zoom=12&size=600x300&maptype=roadmap&key=AIzaSyAYth6W-TTXAdXotw1ZlhjRLrsYjrSidYo')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
      </div>

      {/* Bottom Content */}
      <div className="p-4 relative z-10 -mt-8 bg-white/95 backdrop-blur-sm rounded-t-2xl">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-1.5">
              <FiMapPin className="text-purple-600" size={14} />
              Connect Nearby
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {profileCount} people found within 25 km
            </p>
          </div>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
            Live
          </span>
        </div>

        {/* Avatars */}
        {avatars.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2">
              {avatars.map((avatar, idx) => (
                <div key={idx} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                  <img src={avatar} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {profileCount > 5 && (
              <span className="text-xs text-gray-400">+{profileCount - 5} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[10px] text-gray-600">Employers {employerCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-300" />
              <span className="text-[10px] text-gray-600">Seekers {seekerCount}</span>
            </div>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 transition-colors">
            Open Full Map <FiMaximize2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMapCard;

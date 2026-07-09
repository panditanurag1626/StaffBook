"use client";

import React from "react";
import { FiPlay, FiHeart, FiMessageCircle, FiShare2, FiBookmark } from "react-icons/fi";

interface Reel {
  id: string;
  user: string;
  avatar: string;
  thumbnail: string;
  title: string;
  views: string;
  likes: string;
}

export default function ReelsSection() {
  const reels: Reel[] = [
    {
      id: "1",
      user: "Sarah Johnson",
      avatar: "SJ",
      thumbnail: "bg-gradient-to-br from-purple-400 to-pink-500",
      title: "Day in the life of a Software Engineer",
      views: "12K",
      likes: "1.2K",
    },
    {
      id: "2",
      user: "Mike Chen",
      avatar: "MC",
      thumbnail: "bg-gradient-to-br from-blue-400 to-cyan-500",
      title: "Interview Tips for Tech Jobs",
      views: "25K",
      likes: "2.5K",
    },
    {
      id: "3",
      user: "Priya Sharma",
      avatar: "PS",
      thumbnail: "bg-gradient-to-br from-orange-400 to-red-500",
      title: "Resume Building Masterclass",
      views: "18K",
      likes: "1.8K",
    },
    {
      id: "4",
      user: "Alex Kumar",
      avatar: "AK",
      thumbnail: "bg-gradient-to-br from-green-400 to-teal-500",
      title: "Remote Work Setup Tour",
      views: "8K",
      likes: "890",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#222]">Trending Reels</h2>
        <button className="text-sm text-primary font-medium hover:underline">
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="group cursor-pointer"
          >
            <div className={`relative aspect-[9/16] rounded-xl ${reel.thumbnail} overflow-hidden`}>
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiPlay size={20} className="text-primary ml-1" />
                </div>
              </div>

              {/* User Info */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-primary">
                  {reel.avatar}
                </div>
              </div>

              {/* Stats */}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                  {reel.title}
                </p>
                <div className="flex items-center gap-3 text-white text-xs">
                  <span className="flex items-center gap-1">
                    <FiPlay size={12} />
                    {reel.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiHeart size={12} />
                    {reel.likes}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 mt-2 font-medium truncate">
              {reel.user}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { FiPlus } from "react-icons/fi";

interface Story {
  id: string;
  user: string;
  avatar: string;
  viewed: boolean;
}

export default function StoriesSection() {
  const stories: Story[] = [
    { id: "1", user: "Your Story", avatar: "YS", viewed: false },
    { id: "2", user: "John Doe", avatar: "JD", viewed: false },
    { id: "3", user: "Sarah Smith", avatar: "SS", viewed: true },
    { id: "4", user: "Mike Chen", avatar: "MC", viewed: false },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E4FF] mb-6">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {/* Add Story */}
        <div className="flex-shrink-0 text-center cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <FiPlus size={24} />
          </div>
          <p className="text-xs mt-2 text-gray-600">Add Story</p>
        </div>

        {/* Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 text-center cursor-pointer group">
            <div className={`w-16 h-16 rounded-full p-0.5 ${
              story.viewed ? "bg-gray-300" : "bg-gradient-to-br from-gradient-start to-gradient-end"
            } group-hover:scale-105 transition-transform`}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {story.avatar}
                </div>
              </div>
            </div>
            <p className="text-xs mt-2 text-gray-600 truncate w-16">{story.user}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

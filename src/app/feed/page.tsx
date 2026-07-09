"use client";

import React from "react";
import ModernNavbar from "@/components/shared/ModernNavbar";
import ModernSidebar from "@/components/shared/ModernSidebar";
import StoriesSection from "@/components/social/StoriesSection";
import ReelsSection from "@/components/social/ReelsSection";
import FeedPost from "@/components/social/FeedPost";
import { FiEdit3, FiImage, FiVideo, FiCalendar } from "react-icons/fi";

export default function FeedPage() {
  const posts = [
    {
      id: "1",
      user: "Sarah Johnson",
      avatar: "SJ",
      role: "Senior Software Engineer at Google",
      time: "2 hours ago",
      content: "Just completed an amazing project using Next.js 14 and the new App Router! The performance improvements are incredible. Anyone else working with the latest Next.js features? Would love to hear your experiences! 🚀",
      image: "bg-gradient-to-br from-blue-400 to-purple-500",
      likes: 234,
      comments: 45,
      shares: 12,
    },
    {
      id: "2",
      user: "Mike Chen",
      avatar: "MC",
      role: "Product Manager at Microsoft",
      time: "5 hours ago",
      content: "Excited to announce that we're hiring! Looking for talented developers to join our team. Check out the opportunities on our careers page. #hiring #techjobs",
      likes: 189,
      comments: 32,
      shares: 28,
    },
    {
      id: "3",
      user: "Priya Sharma",
      avatar: "PS",
      role: "UX Designer at Adobe",
      time: "1 day ago",
      content: "Just published a new article on designing accessible interfaces. Link in comments! What are your favorite accessibility tools?",
      image: "bg-gradient-to-br from-pink-400 to-orange-500",
      likes: 456,
      comments: 67,
      shares: 34,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      
      <div className="flex pt-16">
        <ModernSidebar mode="seeker" />
        
        <main className="flex-1 p-6 max-w-4xl mx-auto">
          {/* Create Post */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E4FF] mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end text-white font-bold flex items-center justify-center">
                JD
              </div>
              <input
                type="text"
                placeholder="Share your thoughts..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-around pt-3 border-t border-gray-100">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
                <FiImage size={20} className="text-green-600" />
                <span className="font-medium">Photo</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
                <FiVideo size={20} className="text-red-600" />
                <span className="font-medium">Video</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
                <FiCalendar size={20} className="text-blue-600" />
                <span className="font-medium">Event</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
                <FiEdit3 size={20} className="text-purple-600" />
                <span className="font-medium">Article</span>
              </button>
            </div>
          </div>

          {/* Stories */}
          <StoriesSection />

          {/* Reels */}
          <div className="mb-6">
            <ReelsSection />
          </div>

          {/* Feed Posts */}
          <div className="space-y-6">
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        </main>

        {/* Right Sidebar - Suggestions */}
        <aside className="hidden xl:block w-80 p-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E4FF] sticky top-20">
            <h3 className="font-bold text-[#222] mb-4">Suggested Connections</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold flex items-center justify-center text-sm">
                    U{i}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">User {i}</p>
                    <p className="text-xs text-gray-500">Software Engineer</p>
                  </div>
                  <button className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-medium hover:opacity-90">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

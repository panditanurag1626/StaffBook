"use client";

import React, { useState } from "react";
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal } from "react-icons/fi";

interface Post {
  id: string;
  user: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
}

export default function FeedPost({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end text-white font-bold flex items-center justify-center">
            {post.avatar}
          </div>
          <div>
            <h3 className="font-bold text-[#222]">{post.user}</h3>
            <p className="text-sm text-gray-600">{post.role}</p>
            <p className="text-xs text-gray-500">{post.time}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <FiMoreHorizontal size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className={`rounded-xl overflow-hidden mb-4 ${post.image} h-64`}></div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-3">
        <span className="text-sm text-gray-600">{post.likes} likes</span>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{post.comments} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            liked
              ? "text-red-500 bg-red-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FiHeart size={20} className={liked ? "fill-current" : ""} />
          <span className="font-medium">Like</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
          <FiMessageCircle size={20} />
          <span className="font-medium">Comment</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
          <FiShare2 size={20} />
          <span className="font-medium">Share</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`p-2 rounded-lg transition-all ${
            saved
              ? "text-primary bg-purple-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FiBookmark size={20} className={saved ? "fill-current" : ""} />
        </button>
      </div>
    </div>
  );
}

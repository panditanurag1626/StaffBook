"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiBell,
  FiMessageCircle,
  FiSearch,
  FiMenu,
  FiBriefcase,
  FiUsers,
  FiHome,
  FiGrid
} from "react-icons/fi";
import { THEME } from "@/styles/theme";
import MeetingModal from "./MeetingModal";
import { FiCalendar } from "react-icons/fi";

export default function ModernNavbar() {
  const [modeToggle, setModeToggle] = useState<"networking" | "seeker" | "employer">("networking");
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedCandidateName, setSelectedCandidateName] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [selectedJobPostId, setSelectedJobPostId] = useState<number | null>(null);
  const [isModalFromNavbar, setIsModalFromNavbar] = useState(false);

  React.useEffect(() => {
    const handleOpenMeetingModal = (event: any) => {
      setSelectedCandidateName(event.detail?.candidateName || "");
      setSelectedCandidateId(event.detail?.candidateId || null);
      setSelectedJobPostId(event.detail?.jobPostId || null);
      setIsModalFromNavbar(event.detail?.isFromNavbar || false);
      setIsMeetingModalOpen(true);
    };
    window.addEventListener('openMeetingModal', handleOpenMeetingModal);
    return () => window.removeEventListener('openMeetingModal', handleOpenMeetingModal);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] flex items-center justify-center text-white font-bold text-xl`}>
              S
            </div>
            <span className="text-xl font-bold text-gray-900 hidden md:block">StaffBook</span>
          </Link>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setModeToggle("networking")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${modeToggle === "networking"
                  ? `bg-white text-[${THEME.colors.primary}] shadow-sm`
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <FiUsers className="inline mr-1" size={16} />
              <span className="hidden sm:inline">Network</span>
            </button>
            <button
              onClick={() => setModeToggle("seeker")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${modeToggle === "seeker"
                  ? `bg-white text-[${THEME.colors.primary}] shadow-sm`
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <FiSearch className="inline mr-1" size={16} />
              <span className="hidden sm:inline">Find Jobs</span>
            </button>
            <button
              onClick={() => setModeToggle("employer")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${modeToggle === "employer"
                  ? `bg-white text-[${THEME.colors.primary}] shadow-sm`
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <FiBriefcase className="inline mr-1" size={16} />
              <span className="hidden sm:inline">Hire</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiSearch size={20} className="text-gray-600" />
            </button>

            {/* Meetings */}
            <button
              onClick={() => {
                setIsModalFromNavbar(true);
                setIsMeetingModalOpen(true);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiCalendar size={20} className="text-gray-600" />
            </button>

            {/* Messages */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <FiMessageCircle size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <FiBell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <button className={`w-10 h-10 rounded-full bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white font-bold flex items-center justify-center hover:scale-105 transition-transform`}>
              JD
            </button>
          </div>
        </div>
      </div>
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => {
          setIsMeetingModalOpen(false);
          setSelectedCandidateName("");
          setSelectedCandidateId(null);
          setSelectedJobPostId(null);
        }}
        initialCandidateName={selectedCandidateName}
        initialCandidateId={selectedCandidateId}
        initialJobPostId={selectedJobPostId}
        mode={modeToggle}
        isFromNavbar={isModalFromNavbar}
      />
    </nav>
  );
}

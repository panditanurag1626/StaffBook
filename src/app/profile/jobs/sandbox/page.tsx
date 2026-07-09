"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiBookmark,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiSend,
  FiNavigation,
  FiCheck
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import ProfileSidebar from "@/components/shared/ProfileSidebar";
import ProfileLayout from "@/components/shared/ProfileLayout";
import { THEME } from "@/styles/theme";
import PlatformActionButton from "@/components/shared/PlatformActionButton";

export default function JobSandbox() {
  const [isSaved, setIsSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("not_connected");

  // Fake job details matching Mayur's post
  const fakeJob = {
    posterName: "Mayur Y",
    posterImage: "/images/user_profile_placeholder.jpeg",
    posterDesignation: "Senior Developer",
    isOnline: true,
    distanceDisplay: "1296.6 km away",
    company: "Curioso",
    companyLogo: "/images/staffbook-logo.png", // Fallback or standard logo
    position: "Java Developer",
    postedDate: "Posted at 12-05-2026 02:51 pm",
    workMode: "Work from office",
    experienceLevel: "2-5 Yrs",
    location: "Ahmedabad, Gujarat, India",
    salary: "₹ 5.0 LPA - ₹ 12.0 LPA",
  };

  return (
    <div className={`profile-page min-h-screen ${THEME.colors.background.page} pt-4 md:pt-6 lg:pt-8 mt-[50px] text-black`}>
      <div className="flex gap-6 w-full max-w-7xl mx-auto px-4">
        {/* Sidebar */}
        <div className="w-[20%] flex-shrink-0 -mt-[50px] sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide hidden lg:block">
          <ProfileSidebar />
        </div>

        {/* Content */}
        <div className="w-full lg:w-[80%] flex-1 m-4">
          <div className="mb-8">
            <h1 className="text-3xl font-black font-Montserrat mb-2 text-gray-900">Job Card Design Sandbox</h1>
            <p className="text-gray-600 text-sm">
              We have designed three premium card options to resolve pixel distortion and unaligned branding. Review them below live!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* ==================== OPTION 1 ==================== */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-purple-700 bg-purple-100 self-start px-2.5 py-1 rounded-full uppercase tracking-wider">
                Option 1: Overlap Badge (Recommended)
              </span>
              <div className="bg-white rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
                
                {/* Header Band */}
                <div className="relative p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 p-[1.5px] shadow-sm">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          <img
                            src={fakeJob.posterImage}
                            alt={fakeJob.posterName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      {fakeJob.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-950 leading-tight">{fakeJob.posterName}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{fakeJob.posterDesignation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                    <FiNavigation size={10} />
                    <span>{fakeJob.distanceDisplay}</span>
                  </div>
                </div>

                {/* Company Logo and Job Title Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Brand Info Banner */}
                    <div className="flex items-center gap-3.5 mb-4">
                      {/* Undistorted square company logo card */}
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0">
                        <div className="w-full h-full bg-purple-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                          SB
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-extrabold text-gray-900 leading-snug line-clamp-1">{fakeJob.position}</h4>
                        <p className="text-xs text-gray-500 font-semibold">{fakeJob.company}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium mb-4">
                      <FiClock size={11} />
                      {fakeJob.postedDate}
                    </p>

                    {/* Details badges in dynamic layout */}
                    <div className="space-y-2 text-xs text-gray-600 border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center text-gray-400">
                          <FiBriefcase size={12} />
                        </div>
                        <span>{fakeJob.experienceLevel}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center text-gray-400">
                          <FiMapPin size={12} />
                        </div>
                        <span className="truncate">{fakeJob.location}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center text-gray-400">
                          <FaRupeeSign size={11} />
                        </div>
                        <span className="font-bold text-gray-900">{fakeJob.salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between gap-0.5 mt-6 border-t border-gray-100 pt-3">
                    <PlatformActionButton
                      icon={FiBookmark}
                      label="Save"
                      showLabelBelow
                      isSaved={isSaved}
                      onClick={() => setIsSaved(!isSaved)}
                    />
                    <PlatformActionButton
                      icon={connectionStatus === "connected" ? FiCheck : FiUserPlus}
                      label="Connect"
                      showLabelBelow
                      disabled={connectionStatus !== "not_connected"}
                      onClick={() => setConnectionStatus("connected")}
                    />
                    <PlatformActionButton icon={FiMail} label="Email" showLabelBelow onClick={() => {}} />
                    <PlatformActionButton icon={FiPhone} label="Contact" showLabelBelow onClick={() => {}} />
                    <PlatformActionButton icon={FiSend} label="Apply" showLabelBelow onClick={() => {}} />
                  </div>
                </div>

              </div>
            </div>

            {/* ==================== OPTION 2 ==================== */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100 self-start px-2.5 py-1 rounded-full uppercase tracking-wider">
                Option 2: Double Badge Split (Modern Minimalist)
              </span>
              <div className="bg-white rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Stepped/Overlapping avatars showing relationship */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3 items-center">
                          <div className="relative z-10 w-9 h-9 rounded-full border-2 border-white bg-white overflow-hidden shadow-sm">
                            <img src={fakeJob.posterImage} alt={fakeJob.posterName} className="w-full h-full object-cover" />
                          </div>
                          <div className="w-9 h-9 rounded-xl border-2 border-white bg-purple-600 shadow-sm flex items-center justify-center text-white font-extrabold text-[10px] z-0">
                            SB
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-none mb-0.5">{fakeJob.posterName}</h4>
                          <p className="text-[10px] text-gray-500 font-semibold">{fakeJob.company}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {fakeJob.distanceDisplay}
                      </span>
                    </div>

                    {/* Job position */}
                    <div className="mb-4">
                      <h4 className="text-lg font-black text-gray-900 mb-0.5 leading-snug">{fakeJob.position}</h4>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                        <FiClock size={10} />
                        {fakeJob.postedDate}
                      </p>
                    </div>

                    {/* Details block inside styled light gray card */}
                    <div className="bg-gray-50/50 rounded-xl p-3.5 space-y-2 border border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiBriefcase size={12} className="text-gray-400" />
                          <span>{fakeJob.experienceLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin size={12} className="text-gray-400" />
                          <span className="truncate">{fakeJob.location.split(",")[0]}</span>
                        </div>
                      </div>
                      <div className="border-t border-gray-200/50 pt-2 flex items-center gap-2 text-xs">
                        <FaRupeeSign size={11} className="text-gray-400" />
                        <span className="font-black text-purple-700">{fakeJob.salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between gap-0.5 mt-6 border-t border-gray-100 pt-3">
                    <PlatformActionButton
                      icon={FiBookmark}
                      label="Save"
                      showLabelBelow
                      isSaved={isSaved}
                      onClick={() => setIsSaved(!isSaved)}
                    />
                    <PlatformActionButton
                      icon={connectionStatus === "connected" ? FiCheck : FiUserPlus}
                      label="Connect"
                      showLabelBelow
                      disabled={connectionStatus !== "not_connected"}
                      onClick={() => setConnectionStatus("connected")}
                    />
                    <PlatformActionButton icon={FiMail} label="Email" showLabelBelow onClick={() => {}} />
                    <PlatformActionButton icon={FiPhone} label="Contact" showLabelBelow onClick={() => {}} />
                    <PlatformActionButton icon={FiSend} label="Apply" showLabelBelow onClick={() => {}} />
                  </div>
                </div>

              </div>
            </div>

            {/* ==================== OPTION 3 ==================== */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 self-start px-2.5 py-1 rounded-full uppercase tracking-wider">
                Option 3: Rounded Compact Icon Grid
              </span>
              <div className="bg-white rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
                
                {/* Visual Top Bar */}
                <div className="h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 w-full"></div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <img src={fakeJob.posterImage} alt={fakeJob.posterName} className="w-9 h-9 rounded-full object-cover border border-purple-100" />
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-none mb-0.5">{fakeJob.posterName}</h4>
                          <span className="text-[10px] text-gray-400 font-semibold">{fakeJob.posterDesignation}</span>
                        </div>
                      </div>

                      {/* Clean company logo badge at top right */}
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center p-1 flex-shrink-0">
                        <div className="w-full h-full bg-purple-600 rounded-md flex items-center justify-center text-white font-black text-[10px]">
                          SB
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-base font-extrabold text-gray-900 mb-1 leading-snug">{fakeJob.position}</h4>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="font-semibold">{fakeJob.company}</span>
                        <span>{fakeJob.distanceDisplay}</span>
                      </div>
                    </div>

                    {/* Standard compact layout */}
                    <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-2">
                        <FiBriefcase size={12} className="text-purple-600" />
                        <span>{fakeJob.experienceLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMapPin size={12} className="text-purple-600" />
                        <span className="truncate">{fakeJob.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRupeeSign size={12} className="text-purple-600" />
                        <span className="font-extrabold text-gray-900">{fakeJob.salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between gap-0.5 mt-6 border-t border-gray-100 pt-3">
                    <PlatformActionButton
                      icon={FiBookmark}
                      label="Save"
                      showLabelBelow
                      isSaved={isSaved}
                      onClick={() => setIsSaved(!isSaved)}
                    />
                    <PlatformActionButton
                      icon={connectionStatus === "connected" ? FiCheck : FiUserPlus}
                      label="Connect"
                      showLabelBelow
                      disabled={connectionStatus !== "not_connected"}
                      onClick={() => setConnectionStatus("connected")}
                    />
                    <PlatformActionButton icon={FiMail} label="Email" showLabelBelow onClick={() => {}} />
                    <PlatformActionButton icon={FiPhone} label="Contact" showLabelBelow onClick={() => {}} />
                    <PlatformActionButton icon={FiSend} label="Apply" showLabelBelow onClick={() => {}} />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

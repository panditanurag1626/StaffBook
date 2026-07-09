"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiUserPlus,
  FiEye,
  FiMessageCircle,
  FiSearch,
  FiFilter,
  FiMoreHorizontal,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiTrendingUp,
  FiStar,
  FiUserCheck,
  FiGlobe,
  FiChevronRight,
} from "react-icons/fi";
import { THEME } from "@/styles/theme";

interface Connection {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  mutualConnections: number;
  connectionDate: string;
  isOnline: boolean;
}

interface ProfileVisitor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  visitDate: string;
  viewCount: number;
}

interface NetworkSuggestion {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  mutualConnections: number;
  reason: string;
}

export default function ProfessionalNetwork() {
  const [activeTab, setActiveTab] = useState<
    "connections" | "visitors" | "suggestions"
  >("connections");

  const connections: Connection[] = [
    {
      id: "1",
      name: "Priya Sharma",
      title: "Senior Software Engineer",
      company: "Microsoft",
      location: "Bangalore",
      avatar: "PS",
      mutualConnections: 12,
      connectionDate: "2024-01-10",
      isOnline: true,
    },
    {
      id: "2",
      name: "Rahul Kumar",
      title: "Product Manager",
      company: "Google",
      location: "Mumbai",
      avatar: "RK",
      mutualConnections: 8,
      connectionDate: "2024-01-08",
      isOnline: false,
    },
    {
      id: "3",
      name: "Anita Patel",
      title: "UX Designer",
      company: "Amazon",
      location: "Hyderabad",
      avatar: "AP",
      mutualConnections: 15,
      connectionDate: "2024-01-05",
      isOnline: true,
    },
  ];

  const visitors: ProfileVisitor[] = [
    {
      id: "1",
      name: "Vikram Singh",
      title: "Tech Recruiter",
      company: "TechHire Solutions",
      avatar: "VS",
      visitDate: "2 hours ago",
      viewCount: 3,
    },
    {
      id: "2",
      name: "Neha Gupta",
      title: "HR Manager",
      company: "StartupXYZ",
      avatar: "NG",
      visitDate: "1 day ago",
      viewCount: 1,
    },
    {
      id: "3",
      name: "Arjun Mehta",
      title: "Engineering Lead",
      company: "TechCorp",
      avatar: "AM",
      visitDate: "2 days ago",
      viewCount: 2,
    },
  ];

  const suggestions: NetworkSuggestion[] = [
    {
      id: "1",
      name: "Kavya Reddy",
      title: "Frontend Developer",
      company: "Flipkart",
      location: "Bangalore",
      avatar: "KR",
      mutualConnections: 5,
      reason: "Works at Flipkart",
    },
    {
      id: "2",
      name: "Sanjay Joshi",
      title: "DevOps Engineer",
      company: "Zomato",
      location: "Delhi",
      avatar: "SJ",
      mutualConnections: 3,
      reason: "Similar background",
    },
    {
      id: "3",
      name: "Deepika Nair",
      title: "Data Scientist",
      company: "Paytm",
      location: "Noida",
      avatar: "DN",
      mutualConnections: 7,
      reason: "Mutual connections",
    },
  ];

  return (
    <div className="min-h-screen p-2 md:p-4 lg:p-8 mt-[50px]">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Breadcrumb */}
        <div className={`mb-6 p-4 ${THEME.components.glass} rounded-xl`}>
          <nav
            className="flex items-center text-sm font-medium"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center space-x-1">
              <li>
                <Link
                  href="/networking"
                  className="group flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-light-bg hover:to-light-bg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </li>
              <li>
                <FiChevronRight
                  className="mx-2 text-gray-400 group-hover:text-primary transition-colors duration-200"
                  size={16}
                />
              </li>
              <li>
                <Link
                  href="/profile"
                  className="group flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-light-bg hover:to-light-bg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative">
                    Profile
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </li>
              <li>
                <FiChevronRight className="mx-2 text-gray-400" size={16} />
              </li>
              <li>
                <span className="flex items-center px-4 py-2.5 rounded-lg text-primary bg-gradient-to-r from-light-bg to-light-bg font-semibold shadow-sm border border-[#E5E3FF]">
                  <FiBriefcase className="mr-2" size={16} />
                  Network
                </span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-Montserrat text-primary mb-2">
            Professional Network
          </h1>
          <p className="text-lg text-[#666] font-Montserrat">
            Grow your network, track profile visitors, and discover new
            connections
          </p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${THEME.components.glass} rounded-2xl p-6 hover:shadow-2xl transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                <FiUsers size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">247</h3>
                <p className="text-sm text-[#666]">Connections</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <FiTrendingUp size={14} />
              <span className="font-bold">+12 this week</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                <FiEye size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">89</h3>
                <p className="text-sm text-[#666]">Profile Views</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <FiTrendingUp size={14} />
              <span className="font-bold">+23% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-primary text-white">
                <FiUserPlus size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">15</h3>
                <p className="text-sm text-[#666]">Pending Invites</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <FiStar size={14} />
              <span className="font-bold">5 sent today</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                <FiGlobe size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">92%</h3>
                <p className="text-sm text-[#666]">Network Quality</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <FiTrendingUp size={14} />
              <span className="font-bold">Excellent</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`${THEME.components.glass} rounded-2xl p-2 mb-8`}>
          <div className="flex gap-2">
            {[
              {
                key: "connections",
                label: "My Network",
                icon: <FiUsers size={18} />,
                count: 247,
              },
              {
                key: "visitors",
                label: "Profile Visitors",
                icon: <FiEye size={18} />,
                count: 89,
              },
              {
                key: "suggestions",
                label: "Suggestions",
                icon: <FiUserPlus size={18} />,
                count: 12,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-lg"
                    : "text-[#666] hover:text-primary hover:bg-light-bg"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-light-bg text-secondary"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className={`${THEME.components.glass} rounded-2xl p-4 mb-8`}>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search your network..."
                className="w-full pl-10 pr-4 py-3 border border-[#E8E4FF] rounded-xl focus:outline-none focus:border-primary transition-colors duration-300"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-3 border border-[#E8E4FF] rounded-xl hover:border-primary transition-colors duration-300">
                <FiFilter size={16} />
                Filter
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-xl transition-all duration-300">
                <FiUserPlus size={16} className="inline mr-2" />
                Invite
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "connections" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">
                My Connections
              </h2>
              <p className="text-[#666]">247 connections</p>
            </div>

            <div className="grid gap-6">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end text-white font-bold text-lg flex items-center justify-center">
                          {connection.avatar}
                        </div>
                        {connection.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#222] mb-1">
                          {connection.name}
                        </h3>
                        <p className="text-[#666] font-medium mb-2">
                          {connection.title}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-[#666] mb-3">
                          <div className="flex items-center gap-1">
                            <FiBriefcase size={14} />
                            {connection.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiMapPin size={14} />
                            {connection.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiUsers size={14} />
                            {connection.mutualConnections} mutual connections
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-secondary">
                          <FiCalendar size={14} />
                          Connected on {connection.connectionDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 border border-[#E8E4FF] rounded-lg hover:border-primary transition-colors duration-300">
                        <FiMessageCircle size={16} />
                        Message
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-[#E8E4FF] rounded-lg hover:border-primary transition-colors duration-300">
                        <FiMoreHorizontal size={16} />
                        More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "visitors" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">
                Recent Profile Visitors
              </h2>
              <p className="text-[#666]">89 views this month</p>
            </div>

            <div className="grid gap-6">
              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gradient-end to-gradient-end text-white font-bold text-lg flex items-center justify-center">
                        {visitor.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#222] mb-1">
                          {visitor.name}
                        </h3>
                        <p className="text-[#666] font-medium mb-2">
                          {visitor.title}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-[#666] mb-3">
                          <div className="flex items-center gap-1">
                            <FiBriefcase size={14} />
                            {visitor.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiEye size={14} />
                            Viewed {visitor.viewCount} time
                            {visitor.viewCount > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-secondary">
                          <FiCalendar size={14} />
                          {visitor.visitDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                        <FiUserPlus size={16} />
                        Connect
                      </button>
                      <button className={`${THEME.components.button.primary} py-2 px-4 w-full block mb-4 text-center text-sm`}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "suggestions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">
                People You May Know
              </h2>
              <p className="text-[#666]">12 suggestions</p>
            </div>

            <div className="grid gap-6">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-primary text-white font-bold text-lg flex items-center justify-center">
                        {suggestion.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#222] mb-1">
                          {suggestion.name}
                        </h3>
                        <p className="text-[#666] font-medium mb-2">
                          {suggestion.title}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-[#666] mb-3">
                          <div className="flex items-center gap-1">
                            <FiBriefcase size={14} />
                            {suggestion.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiMapPin size={14} />
                            {suggestion.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiUsers size={14} />
                            {suggestion.mutualConnections} mutual connections
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-light-bg text-secondary text-sm font-medium rounded-full">
                          <FiStar size={14} />
                          {suggestion.reason}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                        <FiUserPlus size={16} />
                        Connect
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-[#E8E4FF] rounded-lg hover:border-primary transition-colors duration-300">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

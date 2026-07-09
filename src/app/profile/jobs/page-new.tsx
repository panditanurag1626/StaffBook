"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProfileLayout from "@/components/shared/ProfileLayout";
import ProfileSubMenu from "@/components/shared/ProfileSubMenu";
import Button from "@/components/shared/Button";
import {
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiBookmark,
  FiStar,
  FiNavigation,
  FiFilter,
  FiTrendingUp,
} from "react-icons/fi";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  matchScore?: number;
  distance?: number;
  isOnline?: boolean;
  logo: string;
}

function JobsPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "recommended"
  );
  const [radius, setRadius] = useState(10);
  const [onlineFilter, setOnlineFilter] = useState<"all" | "online" | "offline">("all");

  React.useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const jobsMenuItems = [
    { icon: <FiStar size={18} />, label: "Recommended", key: "recommended" },
    { icon: <FiMapPin size={18} />, label: "Nearby Jobs", key: "nearby" },
    { icon: <FiClock size={18} />, label: "Recent Posts", key: "recent" },
  ];

  const recommendedJobs: Job[] = [
    {
      id: "1",
      title: "Senior React Developer",
      company: "TechCorp",
      location: "Bangalore",
      salary: "₹18-25 LPA",
      type: "Full-time",
      postedDate: "2 days ago",
      matchScore: 95,
      logo: "TC",
    },
    {
      id: "2",
      title: "Full Stack Engineer",
      company: "InnovateLabs",
      location: "Mumbai",
      salary: "₹15-22 LPA",
      type: "Full-time",
      postedDate: "1 day ago",
      matchScore: 88,
      logo: "IL",
    },
    {
      id: "3",
      title: "Frontend Developer",
      company: "StartupXYZ",
      location: "Hyderabad",
      salary: "₹12-18 LPA",
      type: "Remote",
      postedDate: "3 days ago",
      matchScore: 82,
      logo: "SX",
    },
  ];

  const nearbyJobs: Job[] = [
    {
      id: "n1",
      title: "UI/UX Developer",
      company: "DesignHub",
      location: "Koramangala, Bangalore",
      salary: "₹14-20 LPA",
      type: "Full-time",
      postedDate: "1 day ago",
      distance: 2.3,
      isOnline: true,
      logo: "DH",
    },
    {
      id: "n2",
      title: "React Native Developer",
      company: "MobileFirst",
      location: "Whitefield, Bangalore",
      salary: "₹16-24 LPA",
      type: "Full-time",
      postedDate: "2 days ago",
      distance: 7.5,
      isOnline: true,
      logo: "MF",
    },
    {
      id: "n3",
      title: "Backend Engineer",
      company: "CloudTech",
      location: "HSR Layout, Bangalore",
      salary: "₹18-26 LPA",
      type: "Hybrid",
      postedDate: "4 days ago",
      distance: 4.2,
      isOnline: false,
      logo: "CT",
    },
  ];

  const filteredNearbyJobs = nearbyJobs.filter((job) => {
    const withinRadius = job.distance! <= radius;
    if (onlineFilter === "online") return withinRadius && job.isOnline;
    if (onlineFilter === "offline") return withinRadius && !job.isOnline;
    return withinRadius;
  });

  const JobCard = ({ job }: { job: Job }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#A78BFA] transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#D88BB8] text-white font-bold flex items-center justify-center">
            {job.logo}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#8B7FD8] transition-colors">
              {job.title}
            </h3>
            <p className="text-gray-600 text-sm">{job.company}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="p-2 hover:bg-purple-50 rounded-lg transition-colors w-auto h-auto">
          <FiBookmark size={20} className="text-gray-400 hover:text-[#8B7FD8]" />
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiMapPin size={16} />
          <span>{job.location}</span>
          {job.distance && (
            <span className="text-[#8B7FD8] font-medium">• {job.distance} km away</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiDollarSign size={16} />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiBriefcase size={16} />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiClock size={16} />
          <span>{job.postedDate}</span>
        </div>
      </div>

      {job.matchScore && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Match Score</span>
            <span className="font-bold text-[#8B7FD8]">{job.matchScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#8B7FD8] to-[#D88BB8] transition-all"
              style={{ width: `${job.matchScore}%` }}
            ></div>
          </div>
        </div>
      )}

      {job.isOnline !== undefined && (
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${job.isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
          <span className="text-xs text-gray-600">{job.isOnline ? "Hiring Now" : "Offline"}</span>
        </div>
      )}

      <Button className="w-full py-3 bg-gradient-to-r from-[#8B7FD8] to-[#D88BB8] hover:from-[#7C6FCC] hover:to-[#C77CA9] text-white font-medium rounded-lg transition-all">
        Apply Now
      </Button>
    </div>
  );

  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] to-[#FDF2F8] px-6 -mt-6">
        <div className="max-w-7xl mx-auto">
          <ProfileSubMenu
            menuItems={jobsMenuItems}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key)}

          />

          {/* Recommended Jobs */}
          {activeTab === "recommended" && (
            <div className="mt-[3px] space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                <Button variant="ghost" className="text-sm text-[#8B7FD8] font-medium hover:underline hover:bg-transparent p-0 h-auto">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* Nearby Jobs with Map */}
          {activeTab === "nearby" && (
            <div className="mt-[3px] space-y-6">
              {/* Filter Controls */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FiMapPin className="text-[#8B7FD8]" />
                      Jobs Near You
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredNearbyJobs.filter(j => j.isOnline).length} employers hiring now within {radius}km
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Online/Offline Filter */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                      <Button
                        onClick={() => setOnlineFilter("all")}
                        variant={onlineFilter === "all" ? "primary" : "ghost"}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          onlineFilter === "all"
                            ? "bg-white text-[#8B7FD8] shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        All
                      </Button>
                      <Button
                        onClick={() => setOnlineFilter("online")}
                        variant={onlineFilter === "online" ? "primary" : "ghost"}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          onlineFilter === "online"
                            ? "bg-white text-green-600 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Online
                      </Button>
                      <Button
                        onClick={() => setOnlineFilter("offline")}
                        variant={onlineFilter === "offline" ? "primary" : "ghost"}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          onlineFilter === "offline"
                            ? "bg-white text-gray-600 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Offline
                      </Button>
                    </div>

                    {/* Radius Filter */}
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
                        <FiNavigation size={16} className="text-[#8B7FD8]" />
                        <select
                          value={radius}
                          onChange={(e) => setRadius(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          <option value={5}>5 km</option>
                          <option value={10}>10 km</option>
                          <option value={25}>25 km</option>
                          <option value={50}>50 km</option>
                          <option value={100}>100 km</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map View Placeholder */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <FiMapPin size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">Interactive Map View</p>
                  <p className="text-sm text-gray-500 mt-2">Google Maps integration coming soon</p>
                </div>
              </div>

              {/* Nearby Jobs List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNearbyJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* Recently Posted Jobs */}
          {activeTab === "recent" && (
            <div className="mt-[3px] space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Recently Posted</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiClock size={16} />
                  <span>Last 7 days</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
          <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] to-[#FDF2F8] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7FD8]"></div>
            <span className="ml-3 text-gray-600">Loading jobs...</span>
          </div>
        </ProfileLayout>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}

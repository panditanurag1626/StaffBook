"use client";

import React, { useState } from "react";
import { FiMapPin, FiUsers, FiBriefcase, FiFilter, FiNavigation } from "react-icons/fi";
import Button from "../shared/Button";

interface NearbyUser {
  id: string;
  name: string;
  role: string;
  company?: string;
  distance: number;
  isOnline: boolean;
  avatar: string;
  skills?: string[];
}

export default function ProximityMapView({ mode }: { mode: "seeker" | "employer" }) {
  const [radius, setRadius] = useState(10);
  const [viewMode, setViewMode] = useState<"map" | "list">("list");

  // Mock data
  const nearbyUsers: NearbyUser[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: mode === "seeker" ? "Hiring Manager" : "React Developer",
      company: mode === "seeker" ? "TechCorp" : undefined,
      distance: 2.3,
      isOnline: true,
      avatar: "SJ",
      skills: mode === "employer" ? ["React", "TypeScript", "Node.js"] : undefined,
    },
    {
      id: "2",
      name: "Michael Chen",
      role: mode === "seeker" ? "HR Director" : "Full Stack Engineer",
      company: mode === "seeker" ? "StartupXYZ" : undefined,
      distance: 5.7,
      isOnline: true,
      avatar: "MC",
      skills: mode === "employer" ? ["Python", "Django", "AWS"] : undefined,
    },
    {
      id: "3",
      name: "Priya Sharma",
      role: mode === "seeker" ? "Recruiter" : "UI/UX Designer",
      company: mode === "seeker" ? "InnovateLabs" : undefined,
      distance: 8.1,
      isOnline: false,
      avatar: "PS",
      skills: mode === "employer" ? ["Figma", "Adobe XD", "CSS"] : undefined,
    },
  ];

  const filteredUsers = nearbyUsers.filter((user) => user.distance <= radius);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#222] flex items-center gap-2">
              <FiMapPin className="text-primary" />
              Nearby {mode === "seeker" ? "Employers" : "Job Seekers"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredUsers.filter(u => u.isOnline).length} online within {radius}km
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Radius:</label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "primary" : "ghost"}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode !== "list" ? "bg-gray-100 text-gray-700" : ""
                }`}
              >
                List
              </Button>
              <Button
                onClick={() => setViewMode("map")}
                variant={viewMode === "map" ? "primary" : "ghost"}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode !== "map" ? "bg-gray-100 text-gray-700" : ""
                }`}
              >
                Map
              </Button>
            </div>
            </div>
          </div>
        </div>


      {/* Map/List View */}
      {viewMode === "map" ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] h-[600px] flex items-center justify-center">
          <div className="text-center">
            <FiMapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Map integration coming soon</p>
            <p className="text-sm text-gray-500 mt-2">Will integrate Google Maps / Mapbox</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end text-white font-bold text-xl flex items-center justify-center">
                    {user.avatar}
                  </div>
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-[#222]">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.role}</p>
                  {user.company && (
                    <p className="text-sm text-gray-500">{user.company}</p>
                  )}
                  
                  <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                    <FiNavigation size={14} />
                    <span>{user.distance} km away</span>
                  </div>

                  {user.skills && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <Button 
                    fullWidth 
                    variant="primary"
                    className="mt-3 text-sm"
                  >
                    {mode === "seeker" ? "View Jobs" : "View Profile"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

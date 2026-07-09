"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiMapPin,
  FiBriefcase,
  FiFileText,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiSettings,
} from "react-icons/fi";
import { THEME } from "@/styles/theme";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function ModernSidebar({ mode }: { mode: "seeker" | "employer" }) {
  const pathname = usePathname();

  const seekerMenu: MenuItem[] = [
    { id: "home", label: "Home", href: "/", icon: <FiHome size={20} /> },
    { id: "nearby", label: "Nearby Jobs", href: "/profile/nearby", icon: <FiMapPin size={20} /> },
    { id: "jobs", label: "Browse Jobs", href: "/profile/jobs", icon: <FiBriefcase size={20} /> },
    { id: "insights", label: "My Insights", href: "/profile/insights", icon: <FiTrendingUp size={20} /> },
    { id: "resume", label: "Resume", href: "/profile/resume", icon: <FiFileText size={20} /> },
    { id: "meetings", label: "Meetings", href: "/profile/meetings", icon: <FiCalendar size={20} /> },
  ];

  const employerMenu: MenuItem[] = [
    { id: "home", label: "Home", href: "/", icon: <FiHome size={20} /> },
    { id: "nearby", label: "Nearby Talent", href: "/profile/nearby", icon: <FiMapPin size={20} /> },
    { id: "candidates", label: "Candidates", href: "/profile/candidate-insights", icon: <FiUsers size={20} /> },
    { id: "postings", label: "My Postings", href: "/profile/jobs?mode=employer", icon: <FiBriefcase size={20} /> },
    { id: "jobs", label: "Jobs", href: "/profile/find-candidates?tab=manage-jobs", icon: <FiBriefcase size={20} /> },
    { id: "meetings", label: "Meetings", href: "/profile/meetings", icon: <FiCalendar size={20} /> },
  ];

  const menuItems = mode === "seeker" ? seekerMenu : employerMenu;

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.href)
                ? `bg-gradient-to-r from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white shadow-md`
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
        >
          <FiSettings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}

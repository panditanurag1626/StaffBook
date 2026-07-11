"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUsers, FiBriefcase, FiUserPlus, FiStar } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const MobileBottomNav = () => {
  const path = usePathname();
  const { isEmployer } = useAuth();

  const items = [
    { label: "Networking", href: "/networking", icon: FiUsers },
    { label: isEmployer ? "Find Candidates" : "Find Jobs", href: isEmployer ? "/profile/find-candidates" : "/profile/jobs", icon: FiBriefcase },
    { label: "My Connections", href: "/connections", icon: FiUserPlus },
    { label: "Services", href: "/premium-services", icon: FiStar },
  ];

  if (["/signin", "/signup", "/"].includes(path)) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around py-1.5">
        {items.map((item) => {
          const isActive = path.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${isActive ? "text-purple-700" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

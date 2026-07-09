"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiUsers, FiBriefcase, FiUserPlus, FiGrid, FiSearch } from 'react-icons/fi';
import { THEME } from '@/styles/theme';
import { useAuth } from '@/context/AuthContext';

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { isEmployer } = useAuth();

  const navItems = [
    {
      label: 'Networking',
      href: '/networking',
      icon: <FiUsers size={20} />,
    },
    {
      label: isEmployer ? 'Find Candidates' : 'Find Jobs',
      href: isEmployer ? '/profile/find-candidates' : '/profile/jobs',
      icon: isEmployer ? <FiSearch size={20} /> : <FiBriefcase size={20} />,
    },
    {
      label: 'My Connection',
      href: '/connections',
      icon: <FiUserPlus size={20} />,
    },
    {
      label: 'Services',
      href: '/services',
      icon: <FiGrid size={20} />,
    },
  ];

  const isActive = (href: string) => {
    // Handle both /profile/jobs and /profile/find-candidates as active for the jobs/candidates tab
    if (href === '/profile/jobs' && pathname.startsWith('/profile/jobs')) return true;
    if (href === '/profile/find-candidates' && pathname.startsWith('/profile/find-candidates')) return true;
    return pathname === href;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Gradient Top Border Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-200 to-transparent opacity-50" />

      <div className="bg-white/90 backdrop-blur-xl pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="flex items-center justify-around h-[72px] px-2 max-w-2xl mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex flex-col items-center justify-center w-full h-full cursor-pointer select-none transition-all duration-300`}
              >
                {/* Active Indicator Splash */}
                {active && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-purple-500/10 rounded-full blur-md animate-pulse" />
                )}

                {/* Icon Container */}
                <div className={`relative transition-all duration-300 transform ${active
                  ? '-translate-y-1'
                  : 'group-hover:-translate-y-0.5'
                  }`}>
                  <div className={`p-2 rounded-2xl transition-all duration-300 ${active
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-purple-600 shadow-sm ring-1 ring-purple-100'
                    : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, {
                      className: `transition-all duration-300 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`,
                      size: active ? 22 : 22
                    })}
                  </div>
                </div>

                {/* Label */}
                <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 mt-1 ${active
                  ? 'text-purple-700'
                  : 'text-gray-500'
                  }`}>
                  {item.label}
                </span>

                {/* Active Dot (Small indicator at bottom if label is hidden or for extra style) */}
                {active && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;

'use client'
import React, { useState } from 'react';
import NetworkingLeftSidebar from '../Networking/NetworkingLeftSidebar';
import StorySection from './StorySection';
import { FiMenu, FiX } from 'react-icons/fi';
import JobSearchBar from './SubMenuWrapper';
import ProfileAvatar from './ProfileAvatar';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

import SlimBanner from './SlimBanner';

interface ProfileLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showStories?: boolean;
  showJobSearchBar?: boolean;
  showBanner?: boolean; // Added option to hide banner if needed
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  children,
  showSidebar = true,
  showStories = true,
  showJobSearchBar = true,
  showBanner = true
}) => {
  const { isSidebarOpen, setIsSidebarOpen } = useAuth();



  return (
    <div className="min-h-screen w-full bg-[#f3f2ed]">
      <div className="max-w-7xl mx-auto pt-[90px] px-2 sm:px-4 lg:px-8 pb-16 lg:pb-0">


        {/* Mobile Sidebar Overlay */}
        {showSidebar && isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 mt-[70px]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          {showSidebar && (
            <div className={`
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
              lg:translate-x-0 lg:col-span-3 lg:block
              fixed lg:static top-[70px] left-0 h-[calc(100vh-70px)] lg:h-auto lg:z-0 z-50
              w-80 lg:w-auto bg-[#f3f2ed] lg:bg-transparent shadow-lg lg:shadow-none
              transition-transform duration-300 ease-in-out
              p-4 lg:p-0
            `}>
              <div className="lg:sticky lg:top-[80px] h-full lg:max-h-[calc(100vh-80px)] overflow-y-auto pb-28 lg:pb-0">
                <NetworkingLeftSidebar />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={`${showSidebar ? 'lg:col-span-9' : 'lg:col-span-12'} flex flex-col`}>
            {showJobSearchBar && <div className='w-full mb-6'>
              <JobSearchBar />
            </div>}

            <main className="w-full">
              {children}
            </main>

            {showBanner && <SlimBanner />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout; 
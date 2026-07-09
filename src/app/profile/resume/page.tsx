"use client";

import React, { Suspense } from "react";
import ProfileLayout from '../../../components/shared/ProfileLayout';
import { THEME } from '@/styles/theme';
import ResumeContent from '@/components/profile/ResumeContent';

export default function ResumeBuilder() {
  return (
    <Suspense fallback={
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className={`min-h-screen ${THEME.colors.background.page} p-4 md:p-6 flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </ProfileLayout>
    }>
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className={`min-h-screen ${THEME.colors.background.page} px-4 sm:px-6 lg:px-8 mt-6`}>
          <div className="max-w-7xl mx-auto">
            <ResumeContent />
          </div>
        </div>
      </ProfileLayout>
    </Suspense>
  );
}

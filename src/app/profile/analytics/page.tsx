"use client";

import React from "react";
import ProfileLayout from '../../../components/shared/ProfileLayout';
import AnalyticsHeader from "@/components/profile/analytics/AnalyticsHeader";
import MetricsGrid from "@/components/profile/analytics/MetricsGrid";
import ProfileViewsChart from "@/components/profile/analytics/ProfileViewsChart";
import SearchKeywords from "@/components/profile/analytics/SearchKeywords";
import ActionableInsights from "@/components/profile/analytics/ActionableInsights";

export default function ProfileAnalytics() {
  return (
    <ProfileLayout
      showSidebar={true}
      showStories={false}
      showJobSearchBar={false}
    >
      <div className="min-h-screen bg-[#f3f2ed] p-4 md:p-6 -mt-[10px]">
        <div className="max-w-7xl mx-auto">
          <AnalyticsHeader />
          <MetricsGrid />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProfileViewsChart />
            <SearchKeywords />
          </div>

          <ActionableInsights />
        </div>
      </div>
    </ProfileLayout>
  );
}

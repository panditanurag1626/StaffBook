"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProfileLayout from '../../../components/shared/ProfileLayout';
import ProfileSubMenu from '@/components/shared/ProfileSubMenu';
import { THEME } from '@/styles/theme';
import {
  FiUsers,
  FiTarget,
  FiBriefcase,
  FiEye,
  FiBarChart,
  FiUserPlus,
  FiSearch,
  FiBookmark,
  FiCalendar,
  FiUser,
  FiMessageCircle,
  FiDownload,
  FiPhone,
  FiGrid,
  FiBarChart2,
  FiMail,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/lib/api/services/userService";



import AnalyticsCard from '@/components/shared/AnalyticsCard';

function RecruiterInsightsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profileTab, setProfileTab] = useState<"basic" | "analytics" | "company">("analytics");
  const { isEmployer, user } = useAuth();
  const isEmployerUser = user?.user_type === 'employer';
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  React.useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await userService.getProfileAnalytics();
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };
    fetchAnalyticsData();
  }, []);

  // Main profile menu items
  const profileMenuItems = [
    { icon: <FiUser />, label: 'Personal Details', key: 'basic' },
    ...(isEmployer ? [{ icon: <FiBriefcase />, label: 'Company Details', key: 'company' }] : []),
    { icon: <FiGrid />, label: "My Posts and Reels", key: "posts" },
    { icon: <FiBarChart2 />, label: 'Profile Analytics', key: 'analytics' },
  ];

  interface InsightData {
    id: string;
    title: string;
    value: string;
    icon: React.ReactNode;
    hasNewData?: boolean;
  }

  const profileCompletenessData: InsightData[] = [
    { id: '1', title: analyticsData?.overview?.labels?.profile_viewed || 'Profile viewed', value: analyticsData?.overview?.profile_viewed ?? 0, icon: <FiEye /> },
  ];

  const jobSeekerModeData: InsightData[] = [
    {
      id: '3',
      title: analyticsData?.job_seeker_mode?.labels?.interview_invites || 'Meetings Scheduled',
      value: analyticsData?.job_seeker_mode?.interview_invites ?? 0,
      icon: <FiCalendar />,
      hasNewData: true
    },
    {
      id: '4',
      title: analyticsData?.job_seeker_mode?.labels?.recruiters_message || 'Recruiter Messages',
      value: analyticsData?.job_seeker_mode?.recruiters_message ?? 0,
      icon: <FiMessageCircle />,
      hasNewData: analyticsData?.job_seeker_mode?.recruiters_message_unread > 0
    },
    {
      id: '5',
      title: analyticsData?.job_seeker_mode?.labels?.job_responses || 'Job Responses',
      value: analyticsData?.job_seeker_mode?.job_responses ?? 0,
      icon: <FiBriefcase />
    },
    {
      id: '6',
      title: analyticsData?.job_seeker_mode?.labels?.applied_jobs || 'Applied Jobs',
      value: analyticsData?.job_seeker_mode?.applied_jobs ?? 0,
      icon: <FiTarget />
    },
    {
      id: '7',
      title: analyticsData?.job_seeker_mode?.labels?.resume_downloads || 'Downloaded Resumes',
      value: analyticsData?.job_seeker_mode?.resume_downloads ?? 0,
      icon: <FiDownload />
    },
    {
      id: '8',
      title: analyticsData?.job_seeker_mode?.labels?.searched_you || 'See Who Searched You',
      value: analyticsData?.job_seeker_mode?.searched_you ?? 0,
      icon: <FiSearch />
    },
    { id: '9', title: analyticsData?.overview?.labels?.contact_viewed || 'Contact Viewed', value: analyticsData?.overview?.contact_viewed ?? 0, icon: <FiPhone /> },
  ];

  const employerModeData: InsightData[] = [
    {
      id: '10',
      title: analyticsData?.employer_mode?.labels?.job_posts || 'Job Posts',
      value: analyticsData?.employer_mode?.job_posts ?? 0,
      icon: <FiBriefcase />
    },
    {
      id: '11',
      title: analyticsData?.employer_mode?.labels?.applications_received || 'Applications Received',
      value: analyticsData?.employer_mode?.applications_received ?? 0,
      icon: <FiUserPlus />
    },
    {
      id: '12',
      title: analyticsData?.employer_mode?.labels?.candidates_viewed || 'Candidates Viewed',
      value: analyticsData?.employer_mode?.candidates_viewed ?? 0,
      icon: <FiUsers />
    },
    {
      id: '13',
      title: analyticsData?.employer_mode?.labels?.shortlisted || 'Shortlisted',
      value: analyticsData?.employer_mode?.shortlisted ?? 0,
      icon: <FiBookmark />
    },
    {
      id: '14',
      title: analyticsData?.employer_mode?.labels?.connections || 'Connections',
      value: analyticsData?.employer_mode?.connections ?? 0,
      icon: <FiUsers />
    },
    { id: '15', title: analyticsData?.overview?.labels?.contact_viewed || 'Contact Viewed', value: analyticsData?.overview?.contact_viewed ?? 0, icon: <FiPhone /> },
    {
      id: '16',
      title: analyticsData?.employer_mode?.labels?.email_views || 'Email Views',
      value: analyticsData?.employer_mode?.email_views ?? 0,
      icon: <FiMail />
    },
    {
      id: '17',
      title: analyticsData?.employer_mode?.labels?.download_cv || 'Downloaded Resumes',
      value: analyticsData?.employer_mode?.download_cv ?? 0,
      icon: <FiDownload />
    },
  ];

  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <div className={`min-h-screen ${THEME.colors.background.page} px-3 sm:px-6 pb-20`}>
        <div className="max-w-7xl mx-auto">
          {/* Main Profile SubMenu */}
          <ProfileSubMenu
            menuItems={profileMenuItems}
            activeTab={profileTab}
            onTabChange={(key) => {
              if (key === 'basic') {
                router.push('/profile');
              } else if (key === 'company') {
                router.push('/profile?tab=company');
              } else if (key === 'posts') {
                router.push('/profile?tab=posts');
              }
              setProfileTab(key as any);
            }}
            variant="primary"
          />

          <div className="mt-6 space-y-8">

            {/* Profile Strength Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-900">Profile Strength</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {profileCompletenessData.map((stat) => (
                  <AnalyticsCard
                    key={stat.id}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    hasNewData={stat.hasNewData}
                  />
                ))}
              </div>
            </section>

            {/* Show insights based on user_type */}
            {isEmployerUser ? (
              <section>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full mt-1" />
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{analyticsData?.employer_mode?.labels?.section || "Employer Insights"}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Profile Performance Insights</p>
                    </div>
                  </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {employerModeData.map((stat) => (
                    <AnalyticsCard
                      key={stat.id}
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                      hasNewData={stat.hasNewData}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
                  <h2 className="text-base font-bold text-gray-900">{analyticsData?.job_seeker_mode?.labels?.section || "Job Seeker Insights"}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {jobSeekerModeData.map((stat) => (
                    <AnalyticsCard
                      key={stat.id}
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                      hasNewData={stat.hasNewData}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default function RecruiterInsights() {
  return (
    <Suspense fallback={
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className="min-h-screen bg-gradient-to-br from-light-bg to-[#F3EFFF] p-4 md:p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </ProfileLayout>
    }>
      <RecruiterInsightsContent />
    </Suspense>
  );
}

import React from 'react';
import Link from 'next/link';
import { profilePerformanceStats } from '../../data/profilePerformanceStats';
import connectionsIcon from '../svgs/ConnectionsIcon'; // Assuming default export or need to adjust import if named
import postsIcon from '../svgs/PostsIcon';
import jobPostsIcon from '../svgs/JobPostsIcon';
import profileViewsIcon from '../svgs/ProfileViewsIcon';
import resumeDownloadsIcon from '../svgs/ResumeDownloadsIcon';
import contactViewedIcon from '../svgs/ContactViewedIcon';
import { THEME } from '../../styles/theme';
import Card from '../shared/Card';
import { FiTrendingUp, FiEye, FiSearch, FiUsers, FiActivity } from 'react-icons/fi';

// Mapping icons for the new analytics
// Using React Icons for consistency and modern look if SVGs are missing or inconsistent
const icons: Record<string, React.ElementType> = {
  'Profile Views': FiEye,
  'Search Appearances': FiSearch,
  'Connections': FiUsers,
  'Post Impressions': FiActivity,
};

const ProfilePerformanceStats: React.FC = () => {
  return (
    <Card className="flex flex-col gap-2 relative overflow-hidden border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header with Title and "View All" */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Profile Analytics
            <span className="text-xs font-normal text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              Private to you
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your profile's performance over the last 7 days
          </p>
        </div>
        <Link 
          href="/profile/insights?tab=insights"
          className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline"
        >
          View all analytics
        </Link>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profilePerformanceStats.map((stat) => {
          const Icon = icons[stat.label] || FiTrendingUp;
          return (
            <div 
              key={stat.label} 
              className="flex flex-col p-4 bg-gray-50 bg-opacity-50 rounded-xl border border-gray-100 hover:bg-white hover:border-purple-200 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-purple-50 transition-colors">
                  <Icon className={`w-5 h-5 ${THEME.components.icon.primary}`} />
                </div>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  {stat.label}
                </div>
              </div>
              
              {/* Dummy Trend/Sparkline Visual */}
              <div className="mt-3 flex items-center text-xs font-medium text-green-600">
                <FiTrendingUp className="mr-1 w-3 h-3" />
                <span>+12% this week</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ProfilePerformanceStats;
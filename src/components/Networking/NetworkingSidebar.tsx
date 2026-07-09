'use client'
import React from 'react';
import { userStats } from '../../data/networking';
import { SITE_CONFIG } from '../../constants/siteconfig';
import { FiChevronDown, FiMapPin } from 'react-icons/fi';
import { THEME } from '@/styles/theme';
import Image from 'next/image';

const NetworkingSidebar: React.FC = () => {
  return (
    <div className="w-full lg:w-80 xl:w-96 bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
      {/* User Profile Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Image
            src="/images/user_profile_placeholder.jpeg"
            alt="Riya Goyal"
            width={60}
            height={60}
            className="w-15 h-15 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">Riya Goyal</h3>
            <p className="text-sm text-gray-600">HR of appxone.com (2 yrs)</p>
          </div>
        </div>
        <button className={`w-full ${THEME.components.button.primary} text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all`}>
          {SITE_CONFIG.networking.viewProfile}
        </button>
      </div>

      {/* Stats Section */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          {userStats.map((stat, index) => (
            <div key={index} className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-700 font-medium">{stat.label}</p>
              <p className="text-lg font-bold text-purple-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

        {/* Map */}
        <div className="mb-4">
          <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
            <div className="text-center">
              <FiMapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">World Map</p>
            </div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="space-y-3">
          {[
            'Radius',
            'Company Type',
            'Rural Schools',
            'Salary Expectation',
            'Duration',
            'Timelines',
            'Posted by',
            'Industries',
            'Top Companies',
            'Preferences'
          ].map((filter) => (
            <div key={filter} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <span className="text-sm text-gray-700">{filter}</span>
              <FiChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkingSidebar; 
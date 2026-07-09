'use client';

import React from 'react';
import Card from './Card';
import { 
  FiMapPin, 
  FiNavigation, 
  FiBriefcase, 
  FiClock, 
  FiCalendar, 
  FiBookmark,
  FiArrowUpRight,
  FiUserPlus
} from 'react-icons/fi';
import { Candidate } from '@/types/candidate';
import PlatformActionButton from './PlatformActionButton';
import { formatSalaryLPA } from '@/lib/utils';
import { FaRupeeSign } from 'react-icons/fa';

interface CandidateGridCardProps {
  candidate: Candidate;
}

export default function CandidateGridCard({ candidate }: CandidateGridCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group" noPadding>
      {/* Top Header Section */}
      <div className="p-4 border-b border-gray-50 bg-gray-50/30 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-purple-100">
              <img 
                src={candidate.image} 
                alt={candidate.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {candidate.isOnline && (
              <div className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-10" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate leading-tight group-hover:text-purple-700 transition-colors">
              {candidate.name}
            </h3>
            {candidate.company && (
              <p className="text-[11px] text-gray-600 font-semibold truncate mt-0.5">{candidate.company}</p>
            )}
            <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-1 line-clamp-1 mt-0.5">
              {candidate.title}
            </h4>
            {candidate.distance_display && candidate.distance_display !== "Location not available" && (
              <div className="flex items-center gap-1 text-[9px] text-purple-600 font-bold mt-1 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 w-fit">
                <FiNavigation size={8} />
                <span>{candidate.distance_display} km away</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Below Header - Matching Image */}
        <div className="flex items-center justify-between mt-4">
          <PlatformActionButton 
            label="Connect" 
            size="compact" 
            icon={FiUserPlus}
            className="w-[105px]"
          />
          <PlatformActionButton 
            icon={FiCalendar} 
            size="compact" 
            className="w-8 h-8" 
          />
        </div>
      </div>

      {/* Body Section */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-1 line-clamp-1">
            {candidate.title}
          </h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {candidate.education.split(' ').slice(0, 2).join(' ')}
          </p>
        </div>

        {/* Attributes List */}
        <div className="space-y-2.5 mb-6 text-[11px] font-semibold text-gray-500">
          <div className="flex items-center gap-2.5">
            <FiClock className="text-gray-300" size={13} />
            <span>Hybrid / Immediate</span>
          </div>
          <div className="flex items-center gap-2.5">
            <FiBriefcase className="text-gray-300" size={13} />
            <span>{candidate.experience}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <FiMapPin className="text-gray-300" size={13} />
            <span className="truncate">{candidate.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-black">
            <FaRupeeSign className="text-gray-300" size={13} />
            <span className="font-bold whitespace-nowrap">{formatSalaryLPA(candidate.salary)}</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          <PlatformActionButton 
            icon={FiBookmark} 
            size="compact" 
            className="w-8 h-8" 
          />
          <PlatformActionButton 
            label="Resume" 
            size="compact" 
            icon={FiArrowUpRight}
            className="w-[105px]"
          />
        </div>
      </div>
    </Card>
  );
}

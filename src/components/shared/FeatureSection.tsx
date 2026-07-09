'use client';

import {
  Plus,
  Video,
  Bookmark,
  Building2,
  MapPin,
  BadgeIndianRupee
} from 'lucide-react';
import Image from 'next/image';
import SeeAllButton from './SeeAllButton';
import { featuredJobs } from '../../data/featuredJobs';
import { SITE_CONFIG } from '../../constants/siteconfig';

export default function FeaturedJobsSection({width=true}:{width?:boolean}) {
  return (
    <section className="w-full bg-[#f7f7fa] py-6 md:py-10">
      <div className={`w-full mx-auto px-3 md:px-6 ${width ? 'max-w-full' : 'max-w-6xl'}`}>
        {/* Header */}
        <div className="flex flex-row w-full justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl md:text-[28px] font-bold text-gray-900">{SITE_CONFIG.featuredJobsSection.title}</h2>
          <SeeAllButton>{SITE_CONFIG.featuredJobsSection.seeAll}</SeeAllButton>
        </div>
        {/* Cards Row */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 hide-scrollbar">
          {featuredJobs.map((job, index) => (
            <div
              key={index}
              className="w-[250px] min-w-[250px] md:w-[280px] md:min-w-[280px] bg-white rounded-[16px] shadow-md border border-gray-200 p-0 flex-shrink-0 flex flex-col"
            >
              {/* Top Bar */}
              <div className="flex justify-between items-center px-3 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={job.userImg}
                    alt="Profile"
                    width={28}
                    height={28}
                    className="rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="text-[12px] leading-tight">
                    <p className="font-semibold text-gray-900">{job.user}</p>
                    <p className="text-[#939393] text-[10px]">{job.time}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-full bg-light-bg flex items-center justify-center">
                    <Plus size={14} className="text-primary" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-light-bg flex items-center justify-center">
                    <Video size={14} className="text-primary" />
                  </div>
                </div>
              </div>
              {/* Company Image */}
              <div className={`w-full h-[100px] md:h-[120px] rounded-[12px] mb-2 flex items-center justify-center ${job.companyBg}`}>
                <Image
                  src={job.companyLogo}
                  alt={job.company}
                  width={120}
                  height={60}
                  className="object-contain max-h-[50px] md:max-h-[60px]"
                />
              </div>
              {/* Role and Company */}
              <div className="flex justify-between items-center px-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] md:text-[16px] text-gray-900 leading-4 truncate">{job.role}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 font-semibold truncate">{job.company}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-light-bg flex items-center justify-center flex-shrink-0 ml-2">
                  <Bookmark size={16} className="text-primary" />
                </div>
              </div>
              {/* Info tags */}
              <div className="text-[10px] md:text-xs text-gray-500 mb-2 px-3 space-y-[1px]">
                <p className="flex items-center text-[11px] md:text-[12px] gap-1">
                  <Building2 size={11} className="text-[#939393] flex-shrink-0" /> 
                  <span className="truncate">{job.workType}</span>
                </p>
                <p className="flex items-center text-[11px] md:text-[12px] gap-1">
                  <Video size={11} className="text-[#939393] flex-shrink-0" /> 
                  <span className="truncate">{job.mode}</span>
                </p>
                <p className="flex items-center text-[11px] md:text-[12px] gap-1">
                  <MapPin size={11} className="text-[#939393] flex-shrink-0" /> 
                  <span className="truncate">{job.location}</span>
                </p>
              </div>
              {/* Salary and Button */}
              <div className="flex justify-between items-center px-3 pb-3 mt-auto">
                <p className="text-[12px] md:text-[14px] font-semibold text-[#101022] flex items-center gap-1">
                  <BadgeIndianRupee size={13} /> 
                  <span className="truncate">{job.salary}</span>
                </p>
                <button className="w-[90px] md:w-[100px] h-[28px] md:h-[32px] text-[10px] md:text-xs font-bold rounded-full bg-gradient-to-r from-primary to-gradient-end text-white shadow-md flex-shrink-0">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

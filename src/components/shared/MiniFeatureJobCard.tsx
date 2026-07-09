'use client';

import {
  Plus,
  Video,
  Bookmark,
  Building2,
  MapPin,
  BadgeIndianRupee,
} from 'lucide-react';
import Image from 'next/image';
import SeeAllButton from './SeeAllButton';

const miniFeaturedJobs = [
  {
    company: 'Google',
    companyLogo: '/homePage/google-logo.png',
    time: '2h ago',
    companyBg: 'bg-white',
    role: 'UI/UX Designer',
    workType: 'Work from office',
    mode: 'Both',
    location: 'Bangalore, IN',
    salary: '20L–25L p.a',
  },
  {
    company: 'Upwork',
    companyLogo: '/homePage/logo1.png',
    time: '2h ago',
    companyBg: 'bg-[#E6FFF2]',
    role: 'UI/UX Designer',
    workType: 'Work from office',
    mode: 'Both',
    location: 'Bangalore, IN',
    salary: '20L–25L p.a',
  },
  {
    company: 'Webflow',
    companyLogo: '/homePage/google-logo.png',
    time: '2h ago',
    companyBg: 'bg-[#E6F0FF]',
    role: 'UI/UX Designer',
    workType: 'Work from office',
    mode: 'Both',
    location: 'Bangalore, IN',
    salary: '20L–25L p.a',
  },
  {
    company: 'Notion',
    companyLogo: '/homePage/google-logo.png',
    time: '2h ago',
    companyBg: 'bg-[#F6F6F6]',
    role: 'UI/UX Designer',
    workType: 'Work from office',
    mode: 'Both',
    location: 'Bangalore, IN',
    salary: '20L–25L p.a',
  },
];

  export default function MiniFeaturedJobCards({width=true,title}:{width?:boolean,title: string }) {
  return (
    <section className="w-full bg-[#f7f7fa] py-8 md:py-12">
      <div className={`w-full mx-auto px-3 md:px-6 ${width ? 'max-w-full' : 'max-w-6xl'}`}>
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className="text-2xl md:text-[32px] font-bold text-gray-900">
            {title}
          </h2>
          <SeeAllButton>See All</SeeAllButton>
        </div>

        {/* Cards Row */}
        <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
          {miniFeaturedJobs.map((job, index) => (
            <div
              key={index}
              className="w-[300px] min-w-[300px] bg-white rounded-[20px] shadow-md border border-gray-200 p-0 flex-shrink-0 flex flex-col"
            >
              {/* Top Bar */}
              <div className="flex justify-between items-center px-4 pt-4 pb-2">
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src={job.companyLogo}
                    alt="Company"
                    width={32}
                    height={32}
                    className="rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="text-[13px] leading-tight">
                    <p className="font-semibold text-gray-900">{job.company}</p>
                    <p className="text-[#939393] text-[11px]">{job.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-light-bg flex items-center justify-center">
                    <Plus size={16} className="text-primary" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-light-bg flex items-center justify-center">
                    <Video size={16} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* Role and Company */}
              <div className="flex justify-between items-center px-4 mb-2">
                <div>
                  <p className="font-bold text-[18px] text-gray-900 leading-5">
                    {job.role}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold">
                    {job.company}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-light-bg flex items-center justify-center">
                  <Bookmark size={18} className="text-primary" />
                </div>
              </div>

              {/* Info tags */}
              <div className="text-xs text-gray-500 mb-2 px-4 space-y-[2px]">
                <p className="flex items-center text-[13px] gap-1">
                  <Building2 size={13} className="text-[#939393]" /> {job.workType}
                </p>
                <p className="flex items-center text-[13px] gap-1">
                  <Video size={13} className="text-[#939393]" /> {job.mode}
                </p>
                <p className="flex items-center text-[13px] gap-1">
                  <MapPin size={13} className="text-[#939393]" /> {job.location}
                </p>
              </div>

              {/* Salary and Button */}
              <div className="flex justify-between items-center px-4 pb-4 mt-auto">
                <p className="text-[15px] font-semibold text-[#101022] flex items-center gap-1">
                  <BadgeIndianRupee size={15} /> {job.salary}
                </p>
                <button className="w-[110px] h-[36px] text-sm font-bold rounded-full bg-gradient-to-r from-primary to-gradient-end text-white shadow-md">
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

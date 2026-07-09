'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const tabs = ['All', 'Near You', 'Your City', 'Your State'];
const jobList = [
  {
    title: 'UI/UX Designer',
    company: 'Google Enterprises',
    logo: '/homePage/google-logo.png',
  },
  {
    title: 'React Developer',
    company: 'Google Enterprises',
    logo: '/homePage/google-logo.png',
  },
  {
    title: 'Backend Engineer',
    company: 'Google Enterprises',
    logo:'/homePage/google-logo.png',
  },
  {
    title: 'UI/UX Designer',
    company: 'Google Enterprises',
    logo: '/homePage/google-logo.png',
  },
  {
    title: 'John Cena',
    company: 'Google Enterprises',
    logo:'/homePage/google-logo.png',
  },
];

export default function MapFilterSection() {
  const [activeTab, setActiveTab] = useState('Near You');

  return (
    <section className="w-full py-12  flex justify-center">
      <div className="w-full max-w-[1227px] px-4 md:px-0">
        {/* Title */}
        <div className="text-2xl font-semibold text-black mb-6">Explore Jobs in Your Area</div>

        {/* Main Card */}
        <div className="bg-white rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 h-auto md:h-[473px]">
          {/* Left Side - Map Image */}
          <div className="w-full md:w-[597px] h-[396px] overflow-hidden rounded-xl">
            <Image
              src="/homePage/location.png" // replace with actual map image
              alt="Map"
              width={597}
              height={396}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Right Side */}
          <div className="flex flex-col w-full md:w-[516px] max-h-[400px]">
            {/* Tabs */}
            <div className="flex space-x-3 mb-4 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#7F56D9] text-white'
                      : 'bg-[#f0e8ff] text-[#7F56D9]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Scrollable Card List */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[345px]">
              {jobList.map((job, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 w-full h-[72px] bg-[#f5e8ff] rounded-xl px-4"
                >
                  <Image
                    src={job.logo}
                    alt={job.title}
                    width={42}
                    height={42}
                    className="rounded-full"
                  />
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-semibold text-black">{job.title}</p>
                    <span className="text-xs text-gray-500">{job.company}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
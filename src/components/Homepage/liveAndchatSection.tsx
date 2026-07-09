'use client'

import Image from 'next/image';
import { SITE_CONFIG } from '../../constants/siteconfig';

export default function CombinedChatJobSection() {
  return (
    <section className="w-full bg-white relative overflow-hidden px-4 md:px-12 lg:px-24 py-16 space-y-32">
      {/* Blurred Circle */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] bg-sky-200 opacity-50 rounded-full filter blur-3xl z-0 pointer-events-none"></div>
      {/* --- Live Chat Section --- */}
      <div className="max-w-[1335px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Column */}
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-[28px] text-[#101022] md:text-4xl font-bold leading-tight">
            <span className="text-transparent  bg-clip-text bg-gradient-to-r from-primary to-gradient-end">
              {SITE_CONFIG.homepage.liveChatTitle.split(' ')[0]} {SITE_CONFIG.homepage.liveChatTitle.split(' ')[1]}
            </span>{' '}
            {SITE_CONFIG.homepage.liveChatTitle.split(' ').slice(2).join(' ')}
          </h2>
          <p className="text-base md:text-lg text-gray-700">
            {SITE_CONFIG.homepage.liveChatSubtitle}
          </p>
          <div className="flex justify-center lg:justify-start">
            <button className="bg-gradient-to-r from-primary to-gradient-end text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform">
              {SITE_CONFIG.homepage.exploreNow}
            </button>
          </div>
        </div>
        {/* Right Column - Image */}
        <div className="flex justify-center">
          <Image
            src="/homePage/chat1.png"
            alt="Live Chat UI Mockup"
            className="w-full max-w-[400px] h-auto"
            height={500}
            width={500}
          />
        </div>
      </div>
      {/* --- Job Post Section --- */}
      <div className="max-w-[1335px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Column - Image */}
        <div className="flex justify-start">
          <Image
            height={500}
            width={500}
            src="/homePage/job.png"
            alt="Job Card Preview"
            className="w-full max-w-[400px] h-auto"
          />
        </div>
        {/* Right Column - Text */}
        <div className="space-y-6 text-center lg:text-right">
          <h2 className="text-[48px] text-[#101022] font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gradient-end">
              {SITE_CONFIG.homepage.postJobTitle.split(' ')[0]} {SITE_CONFIG.homepage.postJobTitle.split(' ')[1]}
            </span>{' '}
            {SITE_CONFIG.homepage.postJobTitle.split(' ').slice(2).join(' ')}
          </h2>
          <p className="text-lg text-gray-700">
            {SITE_CONFIG.homepage.postJobSubtitle}
          </p>
          <div className="flex justify-center lg:justify-end">
            <button className="bg-gradient-to-r from-primary to-gradient-end text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform">
              {SITE_CONFIG.homepage.exploreNow}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

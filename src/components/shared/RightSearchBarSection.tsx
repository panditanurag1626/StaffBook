'use client';

import {
  Briefcase,
  MessageSquare,
  Save,
  Bell,
  Monitor,
  Users,
} from 'lucide-react';

export default function RightSearchBarSection() {
  const menuItems = [
    { icon: Users, label: 'Hire' },
    { icon: Briefcase, label: 'Get Hired' },
    { icon: MessageSquare, label: 'Live Chat' },
    { icon: Save, label: 'Saved Jobs' },
    { icon: Bell, label: 'Subscribe' },
    { icon: Monitor, label: 'Ads' },
  ];

  const inputLabels = [
    'Job Title/ Role',
    'Skills',
    'Experience',
    'Company',
    'Location',
    'Date Posted',
  ];

  return (
    <section className="w-full bg-white py-24 relative ">
      <div className="w-[1093px] mx-auto relative no-scrollbar">
        {/* Floating Menu */}
        <div className="absolute top-[-46px] left-1/2 -translate-x-1/2 w-[817px] h-[93px] bg-gradient-to-r from-primary to-gradient-end rounded-full shadow-lg flex items-center justify-around px-8 z-10">
          {menuItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-white text-sm">
              <item.icon size={24} />
              <span className="mt-1">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main Input Box */}
        <div className="mt-[70px] h-[182px] bg-white rounded-[20px] overflow-y-auto no-scrollbar border border-gray-200 flex flex-col">
          {/* Top Row (Labels) */}
          <div className="grid grid-cols-6 bg-light-bg h-[50%]">
            {inputLabels.map((label, index) => (
              <div
                key={index}
                className="flex items-end justify-center px-2 pb-2  text-[13px] font-semibold text-primary"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Bottom Row (Inputs) */}
          <div className="grid grid-cols-6 h-[50%] bg-white">
            {inputLabels.map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-center px-3 border-r last:border-r-0"
              >
                <input
                  type="text"
                  placeholder="Enter preferred Role"
                  className="w-full text-[13px] text-gray-700  px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Video, Star, Send, X, MessageSquare, Image as ImageIcon, MapPin } from 'lucide-react';
import Image from 'next/image';
import { CgProfile } from 'react-icons/cg';
import { HiBadgeCheck } from 'react-icons/hi';

const people = [
  {
    name: 'Rahul Kalki',
    id: 'SB2024AR81',
    age: 28,
    role: 'Finance Executive at Upwork',
    img: '/images/user_profile_placeholder.jpeg',
    location: 'Noida',
    details: ["5' 9\"", 'Noida', 'Professional'],
    education: 'MBA / Finance',
    status: 'Active Today',
    isVerified: true,
    nearby: true,
    imageCount: 4
  },
  {
    name: 'Komal Singh',
    id: 'SB2024KS22',
    age: 25,
    role: 'Software Developer',
    img: '/images/user_profile_placeholder.jpeg',
    location: 'Delhi',
    details: ["5' 4\"", 'Delhi', 'IT Professional'],
    education: 'B.Tech / CSE',
    status: 'Online Now',
    isVerified: true,
    nearby: false,
    imageCount: 6
  },
  {
    name: 'Ashish Soni',
    id: 'SB2024AS45',
    age: 30,
    role: 'Product Designer',
    img: '/images/user_profile_placeholder.jpeg',
    location: 'Mumbai',
    details: ["5' 10\"", 'Mumbai', 'Creative'],
    education: 'B.Des',
    status: 'Active 2h ago',
    isVerified: false,
    nearby: true,
    imageCount: 3
  },
  {
    name: 'Priya Verma',
    id: 'SB2024PV09',
    age: 24,
    role: 'Marketing Lead',
    img: '/images/user_profile_placeholder.jpeg',
    location: 'Bangalore',
    details: ["5' 5\"", 'Bangalore', 'Marketing'],
    education: 'M.Com',
    status: 'Online Now',
    isVerified: true,
    nearby: true,
    imageCount: 5
  },
];

export default function CreativeSection() {
  const renderCard = (person: any, idx: number) => (
    <div
      key={idx}
      className="relative w-[320px] h-[550px] rounded-[32px] overflow-hidden shrink-0 group shadow-2xl border border-white/10"
    >
      {/* Full Image Background */}
      <Image
        src={person.img}
        alt={person.name}
        fill
        className="object-cover group-hover:scale-105 transition duration-1000 ease-out"
      />

      {/* Top Badges */}
      <div className="absolute top-5 right-5 flex flex-col items-end gap-3 z-10">
        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[12px] font-medium border border-white/10">
          <ImageIcon size={14} />
          <span>{person.imageCount || 4}</span>
        </div>
        {person.nearby && (
          <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[12px] font-medium italic border border-white/10">
            Nearby
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

      {/* Info Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white pb-28">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-white/90 drop-shadow-md">{person.status || 'Active Today'}</p>

          <div className="flex items-center gap-2">
            <h3 className="text-[26px] font-bold font-Montserrat leading-tight drop-shadow-lg uppercase tracking-tight">
              {person.id || person.name.split(' ')[0]}, {person.age || 29}
            </h3>
            {person.isVerified && <HiBadgeCheck className="text-blue-500 bg-white rounded-full" size={24} />}
          </div>

          <div className="text-[14px] font-medium text-white/95 drop-shadow-md space-x-1.5">
            <span>{person.details?.[0] || "5' 8\""}</span>
            <span className="opacity-60">•</span>
            <span>{person.location || 'Noida'}</span>
            <span className="opacity-60">•</span>
            <span>Professional</span>
          </div>

          <div className="text-[14px] font-medium text-white/95 drop-shadow-md">
            {person.role || 'Software Professional'}
          </div>

          <div className="text-[14px] font-medium text-white/95 drop-shadow-md">
            {person.education || 'B.E/B.Tech'}
          </div>
        </div>

        {/* Self Managed Subtext */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-md border-l-2 border-white/30">
          <p className="text-[12px] italic text-white/90">Profile managed by Self</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between gap-2">
          {/* Interest */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <button className="w-14 h-14 bg-[#8b1d31] rounded-full flex items-center justify-center border border-white/10 shadow-lg hover:scale-110 active:scale-95 transition-all">
              <Send size={24} className="text-white -rotate-12 ml-1" />
            </button>
            <span className="text-[12px] font-bold text-white tracking-wide">Interest</span>
          </div>

          {/* Shortlist */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <button className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-lg hover:scale-110 active:scale-95 transition-all">
              <Star size={24} className="text-white" />
            </button>
            <span className="text-[12px] font-bold text-white tracking-wide">Shortlist</span>
          </div>

          {/* Ignore */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <button className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-lg hover:scale-110 active:scale-95 transition-all">
              <X size={24} className="text-white" />
            </button>
            <span className="text-[12px] font-bold text-white tracking-wide">Ignore</span>
          </div>

          {/* Chat */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <button className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-lg hover:scale-110 active:scale-95 transition-all">
              <MessageSquare size={24} className="text-white" />
            </button>
            <span className="text-[12px] font-bold text-white tracking-wide">Chat</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full py-10 bg-[#f7f7fa]">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-4 md:px-10 mb-8">
        <h2 className="text-[32px] md:text-[36px] font-bold text-gray-900 font-Montserrat tracking-tight">
          Connection <span className="text-purple-600">Requests</span>
        </h2>
        <button className="px-6 py-2 rounded-full bg-white border border-gray-200 text-purple-600 font-bold hover:bg-purple-50 transition-all shadow-sm">
          See All
        </button>
      </div>

      {/* Horizontal Scroll Containers */}
      <div className="w-full">
        {/* Row 1 */}
        <div className="overflow-x-auto scrollbar-hide pb-10">
          <div className="flex gap-8 px-4 md:px-10 min-w-max">
            {people.map((person, idx) => renderCard(person, idx))}
            {/* Repeat for visual fill if needed or use more data */}
          </div>
        </div>

        {/* Row 2 */}
        <div className="overflow-x-auto scrollbar-hide pb-10">
          <div className="flex gap-8 px-4 md:px-10 min-w-max">
            {people.slice().reverse().map((person, idx) => renderCard(person, idx + 100))}
          </div>
        </div>
      </div>
    </section>
  );
}

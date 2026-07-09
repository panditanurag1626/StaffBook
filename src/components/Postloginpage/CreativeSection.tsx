'use client';

import { Video } from 'lucide-react';
import Image from 'next/image';
import { CgProfile } from 'react-icons/cg';
import SeeAllButton from '../shared/SeeAllButton';

const people = [
  { name: 'Rahul Kalki', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Komal Kalki', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Shyam', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Radhika', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Yash', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Anjali', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
];

export default function CreativeSection() {
  return (
    <section className="w-full py-10 bg-gray-50">
      {/* Header */}
      <div className="max-w-full md:mx-10 flex justify-between items-center px-4">
        <div className="text-2xl md:text-3xl max-w-[70%] text-Montserrat font-semibold text-gray-900">
          Join over 2m <span className="text-[#7F56D9]">Creatives</span> around the world
        </div>
        {/* <button className="flex text-Montserrat items-center text-sm text-[#7F56D9] font-medium">
          See All <span className="ml-1">{'>'}</span>
        </button> */}
        <SeeAllButton>
          See All
        </SeeAllButton>
      </div>

      {/* Cards Row - Scrollable */}
      <div className="max-w-[1440px] mx-auto mt-6 overflow-x-auto">
        <div className="min-w-full flex justify-start">
          {/* Horizontal Row with margin on left only in small devices */}
          <div className="flex gap-4 pl-4 sm:pl-6 md:pl-10 pr-0 min-w-max">
            {people.map((person, idx) => (
              <div
                key={idx}
                className="relative w-[217px] h-[313px] rounded-[12px] overflow-hidden shrink-0 group bg-black"
              >
                {/* Background Image */}
                <Image
                  src={person.img}
                  alt={person.name}
                  fill
                  className="object-cover opacity-70 group-hover:scale-105 transition duration-300"
                />

                {/* Overlay Info */}
                <div className="absolute bottom-0 w-full p-4 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <h3 className="text-[20px] text-Montserrat font-semibold">{person.name}</h3>
                  <p className="text-[12px] text-[#939393] text-Montserrat mt-1">{person.role}</p>

                  <div className="flex text-purple-600 mx-auto mt-4 ml-4 gap-20">
                    <div className="w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center">
                      <Video size={19} />
                    </div>
                    <div className="w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center">
                      <CgProfile size={19} />
                    </div>
                  </div>

                  <div className="flex mt-1 text-[#939393] mx-auto ml-4 gap-20 text-Montserrat text-[12px]">
                    <span>Chat</span>
                    <span>Connect</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

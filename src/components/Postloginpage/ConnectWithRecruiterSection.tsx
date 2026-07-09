'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Video } from 'lucide-react';
import { CgProfile } from 'react-icons/cg';
import gsap from 'gsap';

type Person = { name: string; role: string; img: string };

const people = [
  { name: 'Rahul Kalki', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Komal Kalki', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Shyam', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Radhika', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Yash', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
  { name: 'Anjali', role: 'Finance Executive at Upwork', img: '/images/user_profile_placeholder.jpeg' },
];

export default function ConnectWithRecruiterSection() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(row1Ref.current, {
        x: '-10%',
        ease: 'linear',
        duration: 20,
        repeat: -1,
      });

      // To create a seamless infinite marquee effect (so cards always appear from the left as they move right),
      // animate from -100% to 0% and reset, duplicating the row's content in the JSX for a smooth loop.
      // Here, we animate the row to the right and reset to the start for a marquee effect.
      if (row2Ref.current) {
        const row = row2Ref.current;
        const animate = () => {
          gsap.set(row, { x: '-40%' });
          gsap.to(row, {
            x: '0%',
            ease: 'linear',
            duration: 40,
            onComplete: animate,
          });
        };
        animate();
      }
    });

    return () => ctx.revert();
  }, []);

  const Card = (person: Person, idx: number, keyPrefix: string) => (
    <div
      key={`${keyPrefix}-${idx}`}
      className="relative w-[217px] h-[313px] rounded-[12px] overflow-hidden shrink-0 bg-black group"
    >
      <Image
        src={person.img}
        alt={person.name}
        fill
        className="object-cover opacity-70 group-hover:scale-105 transition duration-300"
      />
      <div className="absolute bottom-0 w-full p-4 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <h3 className="text-[20px] font-semibold">{person.name}</h3>
        <p className="text-[12px] text-[#939393] mt-1">{person.role}</p>
        <div className="flex mx-auto mt-4 ml-4 gap-20">
          <div className="w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center">
            <Video className="text-purple-600" size={19} />
          </div>
          <div className="w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center">
            <CgProfile className='text-purple-600' size={19} />
          </div>
        </div>
        <div className="flex mt-1 text-[#939393] mx-auto ml-4 gap-20 text-[12px]">
          <span>Chat</span>
          <span>Connect</span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full py-10  flex justify-center relative">
      <div className="w-[1250px] h-[630px] bg-white opacity-70 z-10 overflow-hidden relative">
        <h2 className="text-[32px] font-medium text-black mb-6">Explore Jobs in Your Area</h2>


        {/* Left Image (on top) */}
        <div className="absolute top-[65px] left-[30px] w-[392px] h-[785px] z-20">
          <Image
            src="/homePage/chat1.png"
            alt="Chat"
            width={392}
            height={785}
            className="object-contain"
          />
        </div>

        {/* Scrolling rows behind overlay */}
        <div className="absolute top-[60px] left-0 right-0 z-0 space-y-8 px-4">
          <div className="flex gap-4 w-max" ref={row1Ref}>
            {[...people, ...people].map((p, i) => Card(p, i, 'row1'))}
          </div>
          <div className="flex gap-4 w-max" ref={row2Ref}>
            {[...people, ...people].map((p, i) => Card(p, i, 'row2'))}
          </div>
        </div>

        {/* Button at bottom right */}
        <div className="absolute bottom-[40px] right-[280px] z-20">
          <button className="absolute left-1/2 -translate-x-1/2 bottom-0 mb-4 w-[180px] h-[48px] md:w-[320px] md:h-[56px] lg:w-[441px] lg:h-[68px] bg-gradient-to-r from-[#5b5be7] to-[#b14be4] text-white text-[16px] md:text-[20px] font-semibold rounded-full shadow-lg flex items-center justify-center">
            Connect Now
          </button>
        </div>
      </div>
    </section>
  );
}

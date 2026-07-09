'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './HeroSection';

export default function HeroAndMakesDiff() {

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const raf = requestAnimationFrame(() => {
      const makesEl = document.getElementById('makes-spacer');
      const diffEl = document.getElementById('diff-spacer');
      const targetEl = document.getElementById('makes-diff-target');
      const animated = document.getElementById('makes-diff-animated');
      const makesLine = document.getElementById('makes-line');
      const wrapper = document.getElementById('makes-diff-wrapper');

      if (!makesEl || !diffEl || !targetEl || !animated || !makesLine || !wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const makesRect = makesEl.getBoundingClientRect();
      const diffRect = diffEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const startX = diffRect.left - wrapperRect.left;
      const startY = makesRect.top - wrapperRect.top;
      const endX = targetRect.left - wrapperRect.left;
      const endY = targetRect.top - wrapperRect.top;

      const makesOffsetX = makesRect.left - diffRect.left;

      // Show overlay and set initial position
      gsap.set(animated, { x: startX, y: startY, opacity: 1 });
      gsap.set(makesLine, { x: makesOffsetX });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#hero-section',
          start: 'bottom bottom',
          end: '+=100%',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(animated, { x: endX, y: endY, ease: 'none' }, 0);
      tl.to(makesLine, { x: 0, ease: 'none' }, 0);

      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(raf);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div id="makes-diff-wrapper" className="relative overflow-x-hidden">
      <Hero />

      {/* Next section — same bg gradient, dummy text on right, empty left for heading */}
      <section className="bg-gradient-to-b from-[#3b0764] via-[#5b21b6] to-[#0D001A]">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            <div id="makes-diff-target" className="h-0" />
            <p className="text-purple-300/80 text-base md:text-lg leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </div>
      </section>

      {/* Single animated heading — hidden until GSAP positions it */}
      <div
        id="makes-diff-animated"
        className="absolute top-0 left-0 pointer-events-none z-50 opacity-0 font-['Inter_Tight',system-ui,sans-serif] font-medium text-[clamp(2.2rem,7vw,4.5rem)] leading-[1.1]"
      >
        <span id="makes-line" className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300/90 to-purple-100">Makes a</span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300/90 to-purple-100">Difference</span>
      </div>
    </div>
  );
}

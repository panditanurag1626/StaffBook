'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import gsap from 'gsap';
import { SITE_CONFIG } from '../../constants/siteconfig';
import { leftSteps, rightSteps } from '../../data/resumeSteps';

// Add types for steps
import { Step } from '../../types/resume';
import { TemplateIcon, InfoIcon, SuggestionIcon, DownloadIcon } from '../svgs/ResumeStepIcons';

const stepIcons: React.ReactElement[] = [
  <TemplateIcon key="template" />,
  <InfoIcon key="info" />,
  <SuggestionIcon key="suggestion" />,
  <DownloadIcon key="download" />,
];

export default function ResumeSection() {
  useEffect(() => {
    gsap.fromTo(
      '.blur-dot',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.2, delay: 0.2 }
    );
    gsap.from('.resume-center-img', {
      y: 50,
      opacity: 0,
      duration: 1.2,
      delay: 0.3,
      ease: 'power2.out',
    });
  }, []);

  // Responsive: stack columns on mobile, 3-col on desktop
  return (
    <section className="relative w-full flex justify-center items-center py-10 md:py-20 bg-gradient-to-br from-[#eaf1ff] to-[#fafdff] overflow-visible">
      <div className="absolute top-0 left-0 w-[220px] h-[120px] rounded-full blur-[90px] bg-sky-200 opacity-70 blur-dot z-0" />
      <div className="relative z-10 w-full max-w-7xl px-4 mx-auto">
        {/* Title */}
        <h2 className="text-3xl md:text-5xl text-black font-medium text-center mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gradient-end">
            {SITE_CONFIG.homepage.resumeTitleGradient}
          </span>{' '}
          <span className='text-gray-900'>

          {SITE_CONFIG.homepage.resumeTitleRest}
          </span>
        </h2>
        <div className="text-lg md:text-xl text-center max-w-[75%] mx-auto text-gray-700 font-medium mb-10">
          {SITE_CONFIG.homepage.resumeSubtitle}
          <br className="hidden md:block" />
        </div>
        <div className="w-full ">
          <div className="grid grid-cols-3 gap-8 items-center md:scale-100  scale-90 origin-top mx-auto">
            {/* Left Steps */}
            <div className="flex flex-col gap-12 md:gap-20 items-center md:items-end">
              {leftSteps.map((step: Step, index: number) => (
                <div key={index} className="flex flex-col items-center md:items-end text-center md:text-right w-full max-w-xs">
                  <div className="flex items-center gap-2 mb-2 w-full justify-center md:justify-end">
                    <span className="text-base font-semibold text-gray-500">0{index + 1}</span>
                    <div className="h-px w-full max-w-[80px] bg-gray-300" />
                  </div>
                  <div className="mb-4 scale-125">{stepIcons[index]}</div>
                  <h4 className="text-lg md:text-xl font-bold text-[#101022] mb-1">{step.title}

                    
                  </h4>
                  <p className="text-sm text-gray-500 max-w-[200px]">{step.desc}</p>
                </div>
              ))}
            </div>
            {/* Center Image */}
            <div className="flex justify-center items-center">
              <div className="relative">
                <Image
                  src="/homePage/ats.png"
                  alt="Resume Preview"
                  width={322}
                  height={371}
                  className="resume-center-img"
                />
                {/* Scanner corners (decorative) */}
                {/* Scanner corners (decorative) - Removed */}
              </div>
            </div>
            {/* Right Steps */}
            <div className="flex flex-col gap-12 md:gap-20 items-center md:items-start">
              {rightSteps.map((step: Step, index: number) => (
                <div key={index} className="flex flex-col items-center md:items-start text-center md:text-left w-full max-w-xs">
                  <div className="flex items-center gap-2 mb-2 w-full justify-center md:justify-start">
                    <span className="text-base font-semibold text-gray-500">0{index + 3}</span>
                    <div className="h-px w-full max-w-[80px] bg-gray-300" />
                  </div>
                  <div className="mb-4 scale-125">{stepIcons[index + 2]}</div>
                  <h4 className="text-lg md:text-xl font-bold text-[#101022] mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-500 max-w-[200px]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

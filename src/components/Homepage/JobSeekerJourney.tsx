'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiUser, FiSearch, FiMapPin, FiUsers, FiMessageSquare, FiDownload } from 'react-icons/fi';

const steps = [
  { icon: FiUser, label: 'AI Resume & Profile', img: '/homePage/profile.png', desc: 'Build an ATS-optimised resume' },
  { icon: FiSearch, label: 'Browse & Apply Jobs', img: '/homePage/job.png', desc: 'Find roles matched to your skills' },
  { icon: FiMapPin, label: 'Nearby Map Search', img: '/homePage/map.png', desc: 'Discover opportunities around you' },
  { icon: FiUsers, label: 'Network via Reels & Stories', img: '/homePage/job-photo.png', desc: 'Showcase your personality visually' },
  { icon: FiMessageSquare, label: 'Chat & Video Calls', img: '/homePage/chat1.png', desc: 'Connect directly with recruiters' },
  { icon: FiDownload, label: 'Track & Download', img: '/homePage/ats.png', desc: 'Manage applications & download resumes' },
];

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function JobSeekerJourney() {
  return (
    <section className="w-full bg-gradient-to-br from-[#f8f6ff] to-white py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
            For Job Seekers
          </span>
          <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022] leading-tight">
            Your journey from{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">
              resume to hired
            </span>
          </h2>
          <p className="text-base text-gray-500 mt-3 max-w-xl mx-auto">
            Every tool you need to find the right opportunity — all in one platform.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative w-[260px] h-[530px] flex-shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-blue-500/20 rounded-[3rem] blur-xl" />
            <div className="relative w-full h-full bg-white rounded-[3rem] border-[3px] border-gray-200 shadow-2xl overflow-hidden flex flex-col">
              <div className="h-6 flex items-center justify-center">
                <div className="w-20 h-1.5 bg-gray-300 rounded-full" />
              </div>
              <div className="flex-1 relative">
                <Image
                  src="/homePage/profile.png"
                  alt="StaffBook App"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="h-1.5 flex items-center justify-center">
                <div className="w-20 h-1 bg-gray-200 rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-purple-50/50 transition-colors cursor-default"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-200 shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-[#101022]">{step.label}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

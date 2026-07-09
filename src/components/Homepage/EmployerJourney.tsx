'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiBriefcase, FiUsers, FiMapPin, FiVideo, FiMessageSquare, FiDownload } from 'react-icons/fi';

const steps = [
  { icon: FiBriefcase, label: 'Post Jobs', img: '/homePage/post-job-cover.png', desc: 'Reach thousands of qualified candidates' },
  { icon: FiUsers, label: 'Find Candidates', img: '/homePage/profile.png', desc: 'Advanced filters for precise matching' },
  { icon: FiMapPin, label: 'Nearby Map Search', img: '/homePage/map.png', desc: 'Discover local talent in your area' },
  { icon: FiVideo, label: 'Video Interviews', img: '/homePage/chat1.png', desc: 'Built-in calls — no third-party needed' },
  { icon: FiMessageSquare, label: 'Chat in Real-Time', img: '/homePage/chat2.png', desc: 'Instant messaging with applicants' },
  { icon: FiDownload, label: 'Manage & Export', img: '/homePage/ats.png', desc: 'Bulk downloads, Excel export & insights' },
];

const stepVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function EmployerJourney() {
  return (
    <section className="w-full bg-white py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            For Employers
          </span>
          <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022] leading-tight">
            Hire smarter with{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">
              StaffBook
            </span>
          </h2>
          <p className="text-base text-gray-500 mt-3 max-w-xl mx-auto">
            Everything you need to find, engage, and hire the right talent.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative w-[260px] h-[530px] flex-shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-xl" />
            <div className="relative w-full h-full bg-white rounded-[3rem] border-[3px] border-gray-200 shadow-2xl overflow-hidden flex flex-col">
              <div className="h-6 flex items-center justify-center">
                <div className="w-20 h-1.5 bg-gray-300 rounded-full" />
              </div>
              <div className="flex-1 relative">
                <Image
                  src="/homePage/post-job-cover.png"
                  alt="StaffBook Employer"
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
                  className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-blue-50/50 transition-colors cursor-default"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
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

'use client'

import { motion } from 'framer-motion';
import { FiUsers, FiMapPin, FiClock, FiVideo, FiMessageSquare } from 'react-icons/fi';
import { MdSlowMotionVideo } from 'react-icons/md';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useRef } from 'react';

const features = [
  {
    icon: FiUsers,
    title: 'Networking',
    desc: 'Connect, share posts, and grow your professional network.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: FiMapPin,
    title: 'Nearby Map Search',
    desc: 'Discover jobs and candidates around you on an interactive map.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FiClock,
    title: 'Online Availability',
    desc: 'Show when you are free and find ready-to-connect people.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: MdSlowMotionVideo,
    title: 'Reels',
    desc: 'Short video snippets to showcase your personality and skills.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: FiMessageSquare,
    title: 'Stories',
    desc: '24-hour updates that keep your network engaged.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: FiVideo,
    title: 'Online Video Calls',
    desc: 'Built-in video interviews and meetings — no third-party tools.',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    icon: HiOutlineSparkles,
    title: 'AI Chat Bot Assistance',
    desc: 'Smart help with resumes, job matching, and platform navigation.',
    gradient: 'from-fuchsia-500 to-purple-500',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function FeatureCards() {
  const ref = useRef(null);

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
          <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022] leading-tight">
            Everything you need in{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">
              one place
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-500 mt-3 max-w-2xl mx-auto">
            Modern tools designed to make job hunting and hiring effortless.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
                    border: '1px solid rgba(139,92,246,0.15)',
                  }}
                />
                <div
                  className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient} shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="relative z-10 text-lg font-semibold text-[#101022] mb-2">
                  {feature.title}
                </h3>
                <p className="relative z-10 text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

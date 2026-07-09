'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiPlay } from 'react-icons/fi';

export default function Hero() {
  const router = useRouter();

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#ede9fe] via-[#ddd6fe] to-[#c4b5fd]">
      {/* ---- Background layers ---- */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: 'rgba(167, 139, 250, 0.25)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: 'rgba(196, 181, 253, 0.2)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[250px] pointer-events-none" style={{ background: 'rgba(221, 214, 254, 0.15)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Text + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-purple-200/50 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">India's First AI-Powered Job Portal</span>
            </div>

            <h1 className="font-['Inter_Tight',system-ui,sans-serif] font-bold leading-[0.95] tracking-[-0.03em] text-[#1a0033]">
              <span className="text-[clamp(1.8rem,5vw,3rem)] block">India's AI driven</span>
              <span className="text-[clamp(1.8rem,5vw,3rem)] bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-600 text-transparent bg-clip-text">
                Job Portal
              </span>
              <span className="text-[clamp(1.8rem,5vw,3rem)] block text-[#2d0a4e]">which solves real Indian problems</span>
            </h1>

            <p className="text-base md:text-lg text-[#2d0a4e]/70 mt-5 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Because 1 new employee and 1 right job can change a lot.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
              <button
                onClick={() => router.push('/signup')}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started Free
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/signin')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-purple-800 bg-white/70 backdrop-blur-sm border border-purple-200/60 hover:bg-white hover:border-purple-300 shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FiPlay className="w-4 h-4" />
                Sign In
              </button>
            </div>

            {/* Trusted by bar */}
            <div className="flex items-center gap-3 mt-10 text-purple-600/50 text-xs font-medium">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-purple-200 to-blue-200" />
                ))}
              </div>
              <span>Trusted by thousands of job seekers & employers</span>
            </div>
          </motion.div>

          {/* Right: Phone mockup with video */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            className="relative w-[280px] h-[570px] flex-shrink-0"
          >
            {/* Glow behind phone */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-blue-500/30 rounded-[3.5rem] blur-2xl" />
            {/* Phone frame */}
            <div className="relative w-full h-full bg-white rounded-[3.5rem] border-[4px] border-gray-200 shadow-2xl overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="relative h-7 flex items-center justify-center bg-white">
                <div className="w-24 h-1.5 bg-gray-300 rounded-full" />
              </div>
              {/* Video/screen content */}
              <div className="flex-1 relative bg-black">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  src="/Videos/staffbook.mp4"
                />
              </div>
              {/* Home indicator */}
              <div className="h-1.5 flex items-center justify-center bg-white">
                <div className="w-28 h-1 bg-gray-200 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 rounded-full border-2 border-purple-300/40 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
          />
        </div>
      </motion.div>
    </section>
  );
}

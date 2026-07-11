"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiArrowRight, FiPlay, FiUsers, FiMapPin, FiClock, FiVideo,
  FiMessageSquare, FiBriefcase, FiSearch, FiStar, FiShield,
  FiUser, FiDownload, FiTrendingUp, FiCheck, FiHeart,
  FiCompass, FiHeadphones, FiCamera,
} from "react-icons/fi";

const seekerSteps = [
  { icon: FiUser, label: "Build Your Profile", img: "/homePage/profile.png", desc: "Add your skills, experience, and preferences in minutes" },
  { icon: FiSearch, label: "Explore Opportunities", img: "/homePage/job.png", desc: "Browse curated jobs matching your unique profile" },
  { icon: FiMapPin, label: "Location-Aware Search", img: "/homePage/map.png", desc: "See jobs on an interactive map sorted by distance" },
  { icon: FiCamera, label: "Showcase with Reels", img: "/homePage/job-photo.png", desc: "Short videos that help you stand out to recruiters" },
  { icon: FiMessageSquare, label: "Direct Chat & Interview", img: "/homePage/chat1.png", desc: "Message recruiters and hop on video calls instantly" },
  { icon: FiDownload, label: "Manage & Succeed", img: "/homePage/ats.png", desc: "Track offers, download resumes, and get hired faster" },
];

const employerSteps = [
  { icon: FiBriefcase, label: "Post in Minutes", img: "/homePage/post-job-cover.png", desc: "Create and publish job listings with smart templates" },
  { icon: FiUsers, label: "Smart Candidate Discovery", img: "/homePage/profile.png", desc: "AI-powered matching finds the right talent for you" },
  { icon: FiMapPin, label: "Local Talent Pool", img: "/homePage/map.png", desc: "Zero in on candidates within a specific radius" },
  { icon: FiVideo, label: "Interview on Platform", img: "/homePage/chat1.png", desc: "Built-in video calls — no Zoom links or coordination hassles" },
  { icon: FiMessageSquare, label: "Instant Communication", img: "/homePage/chat2.png", desc: "Chat with applicants in real-time, answer questions fast" },
  { icon: FiDownload, label: "Bulk Operations", img: "/homePage/ats.png", desc: "Download resumes, export data, and manage hiring at scale" },
];

const stepVariantsL = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};
const stepVariantsR = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

export default function RootPage() {
  const router = useRouter();

  return (
    <div className="bg-[#0D001A]">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#ede9fe] via-[#ddd6fe] to-[#c4b5fd]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: "rgba(167, 139, 250, 0.25)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: "rgba(196, 181, 253, 0.2)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[250px] pointer-events-none" style={{ background: "rgba(221, 214, 254, 0.15)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-purple-200/50 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">India's First AI-Powered Job Portal</span>
              </div>
              <h1 className="font-['Inter_Tight',system-ui,sans-serif] font-bold leading-[0.95] tracking-[-0.03em] text-[#1a0033]">
                <span className="text-[clamp(1.8rem,5vw,3rem)] block">Jobs that match</span>
                <span className="text-[clamp(1.8rem,5vw,3rem)] bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-600 text-transparent bg-clip-text">your life</span>
                <span className="text-[clamp(1.8rem,5vw,3rem)] block text-[#2d0a4e]">not just your resume</span>
              </h1>
              <p className="text-base md:text-lg text-[#2d0a4e]/70 mt-5 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                StaffBook brings together nearby jobs, real-time recruiter access, and a professional community — purpose-built for the Indian workforce.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                <button onClick={() => router.push("/signup")} className="group w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 flex items-center justify-center gap-2">
                  Get Started Free <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={() => router.push("/signin")} className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-purple-800 bg-white/70 backdrop-blur-sm border border-purple-200/60 hover:bg-white hover:border-purple-300 shadow-sm transition-all duration-300 flex items-center justify-center gap-2">
                  <FiPlay className="w-4 h-4" /> Sign In
                </button>
              </div>
              <div className="flex items-center gap-3 mt-10 text-purple-600/50 text-xs font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-purple-200 to-blue-200" />
                  ))}
                </div>
                <span>Trusted by thousands of job seekers & employers</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }} className="relative w-[280px] h-[570px] flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-blue-500/30 rounded-[3.5rem] blur-2xl" />
              <div className="relative w-full h-full bg-white rounded-[3.5rem] border-[4px] border-gray-200 shadow-2xl overflow-hidden flex flex-col">
                <div className="relative h-7 flex items-center justify-center bg-white"><div className="w-24 h-1.5 bg-gray-300 rounded-full" /></div>
                <div className="flex-1 relative bg-black">
                  <video className="w-full h-full object-cover" autoPlay muted loop playsInline src="/Videos/staffbook.mp4" />
                </div>
                <div className="h-1.5 flex items-center justify-center bg-white"><div className="w-28 h-1 bg-gray-200 rounded-full" /></div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="w-6 h-10 rounded-full border-2 border-purple-300/40 flex items-start justify-center p-1">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          </div>
        </motion.div>
      </section>

      {/* ===== FOR JOB SEEKERS ===== */}
      <section className="w-full bg-gradient-to-br from-[#f8f6ff] to-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">For Job Seekers</span>
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022] leading-tight">
              Your career,{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">your rules</span>
            </h2>
            <p className="text-base text-gray-500 mt-3 max-w-xl mx-auto">From building your profile to landing the offer — we stay with you at every step.</p>
          </motion.div>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: "easeOut" }} className="relative w-[260px] h-[530px] flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-blue-500/20 rounded-[3rem] blur-xl" />
              <div className="relative w-full h-full bg-white rounded-[3rem] border-[3px] border-gray-200 shadow-2xl overflow-hidden flex flex-col">
                <div className="h-6 flex items-center justify-center"><div className="w-20 h-1.5 bg-gray-300 rounded-full" /></div>
                <div className="flex-1 relative"><Image src="/homePage/profile.png" alt="StaffBook App" fill className="object-cover" /></div>
                <div className="h-1.5 flex items-center justify-center"><div className="w-20 h-1 bg-gray-200 rounded-full" /></div>
              </div>
            </motion.div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {seekerSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={i} custom={i} variants={stepVariantsL} initial="hidden" whileInView="visible" viewport={{ once: true }} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-purple-50/50 transition-colors cursor-default">
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

      {/* ===== FOR EMPLOYERS ===== */}
      <section className="w-full bg-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">For Employers</span>
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022] leading-tight">
              Find the right fit,{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">fast</span>
            </h2>
            <p className="text-base text-gray-500 mt-3 max-w-xl mx-auto">Smart tools that help you attract, evaluate, and hire top talent without the usual friction.</p>
          </motion.div>
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: "easeOut" }} className="relative w-[260px] h-[530px] flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-xl" />
              <div className="relative w-full h-full bg-white rounded-[3rem] border-[3px] border-gray-200 shadow-2xl overflow-hidden flex flex-col">
                <div className="h-6 flex items-center justify-center"><div className="w-20 h-1.5 bg-gray-300 rounded-full" /></div>
                <div className="flex-1 relative"><Image src="/homePage/post-job-cover.png" alt="StaffBook Employer" fill className="object-cover" /></div>
                <div className="h-1.5 flex items-center justify-center"><div className="w-20 h-1 bg-gray-200 rounded-full" /></div>
              </div>
            </motion.div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employerSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={i} custom={i} variants={stepVariantsR} initial="hidden" whileInView="visible" viewport={{ once: true }} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-blue-50/50 transition-colors cursor-default">
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

      {/* ===== BOTTOM CATEGORIES ===== */}
      <section className="w-full bg-white overflow-hidden relative">
        <div className="absolute right-0 top-1/2 transform translate-x-[200px] -translate-y-1/2 w-[925px] h-[1029px] bg-gradient-to-br from-purple-500/30 to-blue-500/30 blur-[200px] rounded-full opacity-60 pointer-events-none z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center pt-20 pb-12">
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022] leading-tight">
              Explore{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">opportunities</span>
              {" "}across every field
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-5 pb-24 max-w-[1371px] mx-auto">
            {[
              { icon: FiBriefcase, title: "Engineering & Tech", jobs: "1,200+ openings" },
              { icon: FiHeadphones, title: "Customer Support", jobs: "680+ openings" },
              { icon: FiHeart, title: "Healthcare & Pharma", jobs: "540+ openings" },
              { icon: FiMapPin, title: "Remote & On-Site", jobs: "2,100+ openings" },
              { icon: FiStar, title: "Banking & Insurance", jobs: "620+ openings" },
              { icon: FiTrendingUp, title: "Consulting & Strategy", jobs: "490+ openings" },
              { icon: FiCompass, title: "Travel & Hospitality", jobs: "370+ openings" },
              { icon: FiClock, title: "Part-Time & Gig", jobs: "420+ openings" },
            ].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="h-[81px] bg-white rounded-lg px-4 md:px-6 py-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                  <div className="w-[42px] h-[42px] bg-[#F6F6FE] rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[16px] font-medium text-[#101022]">{cat.title}</h3>
                    <p className="text-[14px] text-[#D9D9E2]">{cat.jobs}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

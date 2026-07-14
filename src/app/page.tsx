"use client";

import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  FiArrowRight, FiPlay, FiSearch, FiMessageCircle, FiUsers,
  FiMapPin, FiCheck, FiShield, FiTrendingUp, FiStar, FiZap,
} from "react-icons/fi";

function CountUp({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let raf: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function RootPage() {
  const router = useRouter();

  return (
    <div className="bg-[#0D001A]">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#ede9fe] via-[#ddd6fe] to-[#c4b5fd]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px]" style={{ background: "rgba(167, 139, 250, 0.25)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: "rgba(196, 181, 253, 0.2)" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-purple-200/50 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">India's First AI-Powered Job Portal</span>
              </div>
              <h1 className="font-['Inter_Tight',system-ui,sans-serif] font-bold leading-[0.95] tracking-[-0.03em] text-[#1a0033]">
                <span className="text-[clamp(2rem,5vw,3.5rem)] block">Find the job that</span>
                <span className="text-[clamp(2rem,5vw,3.5rem)] bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-600 text-transparent bg-clip-text">fits your life</span>
              </h1>
              <p className="text-base md:text-lg text-[#2d0a4e]/70 mt-5 max-w-md mx-auto leading-relaxed">
                StaffBook connects job seekers and recruiters directly — no middlemen, no spam, just real opportunities near you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button onClick={() => router.push("/signup")} className="group px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 shadow-lg shadow-purple-300/40 hover:shadow-xl transition-all flex items-center gap-2">
                  Get Started Free <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={() => router.push("/signin")} className="px-8 py-3.5 rounded-full font-semibold text-sm text-purple-800 bg-white/70 backdrop-blur-sm border border-purple-200/60 hover:bg-white transition-all flex items-center gap-2">
                  <FiPlay className="w-4 h-4" /> Sign In
                </button>
              </div>
              <div className="flex items-center justify-center gap-3 mt-10 text-purple-600/50 text-xs font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-purple-200 to-blue-200" />
                  ))}
                </div>
                <span>Trusted by thousands of job seekers & employers</span>
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

      {/* ===== STATS BAR ===== */}
      <section className="w-full bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { end: 10, suffix: "K+", label: "Active Jobs" },
              { end: 50, suffix: "K+", label: "Professionals" },
              { end: 2, suffix: "K+", label: "Companies" },
              { end: 94, suffix: "%", label: "Satisfaction" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-purple-700/80">
                  <CountUp end={s.end} suffix={s.suffix} />
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="w-full bg-gradient-to-br from-[#f8f6ff] to-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">How It Works</span>
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022]">Three steps to your next opportunity</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              {
                num: "01", title: "Create Profile", desc: "Sign up free and build your profile with your skills, experience, and preferences in just 5 minutes.",
                color: "from-purple-500 to-blue-500",
              },
              {
                num: "02", title: "Discover & Connect", desc: "Browse nearby jobs, connect with recruiters via chat, and grow your professional network.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                num: "03", title: "Get Hired", desc: "Attend video interviews, negotiate offers, and land the role you deserve — all on StaffBook.",
                color: "from-purple-500 to-fuchsia-500",
              },
            ].map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-purple-200 mb-5`}>
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#101022] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY STAFFBOOK ===== */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022]">Why job seekers choose StaffBook</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: FiMapPin, title: "Local Jobs First", desc: "See opportunities within your commute radius. No more wasting time on jobs too far away.", gradient: "from-blue-500 to-cyan-500" },
              { icon: FiMessageCircle, title: "Talk Directly", desc: "Chat with recruiters in real-time. No applications getting lost — just real conversations.", gradient: "from-purple-500 to-fuchsia-500" },
              { icon: FiUsers, title: "Build Your Network", desc: "Connect with professionals, share updates, and grow your community within your industry.", gradient: "from-violet-500 to-purple-500" },
              { icon: FiZap, title: "AI-Powered Matching", desc: "Smart recommendations based on your skills, experience, and what you're looking for.", gradient: "from-amber-500 to-orange-500" },
              { icon: FiShield, title: "Verified & Safe", desc: "Every recruiter and company is manually verified. Zero fake listings, zero spam.", gradient: "from-emerald-500 to-teal-500" },
              { icon: FiTrendingUp, title: "Track Everything", desc: "One dashboard to manage applications, messages, interviews, and offers.", gradient: "from-indigo-500 to-purple-500" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#101022] mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="w-full bg-gradient-to-br from-[#0D001A] via-[#1a0533] to-[#0D001A] py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to take the next step?</h2>
            <p className="text-purple-200/60 mt-4 text-lg max-w-lg mx-auto">Join StaffBook today and find opportunities that match your skills, location, and ambitions.</p>
            <button onClick={() => router.push("/signup")} className="mt-8 px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all">
              Create Your Free Account
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

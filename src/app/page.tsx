"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiSearch, FiMessageCircle, FiUsers, FiBriefcase, FiMapPin, FiVideo, FiArrowRight, FiCheck, FiShield, FiTrendingUp, FiDownload } from "react-icons/fi";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function RootPage() {
  const router = useRouter();

  const features = [
    { icon: FiMapPin, title: 'Nearby Jobs', desc: 'Set your preferred distance and find opportunities near you.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: FiMessageCircle, title: 'Live Chat', desc: 'Chat directly with recruiters in real-time.', gradient: 'from-purple-500 to-fuchsia-500' },
    { icon: FiUsers, title: 'Networking', desc: 'Connect with professionals and grow your network.', gradient: 'from-violet-500 to-purple-500' },
    { icon: FiVideo, title: 'Video Calls', desc: 'Built-in video interviews — no third-party needed.', gradient: 'from-emerald-500 to-teal-500' },
    { icon: FiSearch, title: 'Smart Matching', desc: 'AI-powered job recommendations just for you.', gradient: 'from-amber-500 to-orange-500' },
    { icon: FiShield, title: 'Verified Platform', desc: 'Every recruiter is verified. No fake listings.', gradient: 'from-rose-500 to-pink-500' },
    { icon: FiTrendingUp, title: 'Career Growth', desc: 'Track applications, insights, and profile views.', gradient: 'from-indigo-500 to-purple-500' },
  ];

  const seekerSteps = [
    { icon: FiUser, label: 'Create Profile', img: '/homePage/profile.png', desc: 'Build your professional profile' },
    { icon: FiSearch, label: 'Find Jobs', img: '/homePage/job.png', desc: 'Browse matched opportunities' },
    { icon: FiMapPin, label: 'Nearby Search', img: '/homePage/map.png', desc: 'Discover jobs around you' },
    { icon: FiMessageCircle, label: 'Connect & Chat', img: '/homePage/chat1.png', desc: 'Message recruiters directly' },
    { icon: FiVideo, label: 'Video Interview', img: '/homePage/chat2.png', desc: 'Meet face-to-face online' },
    { icon: FiBriefcase, label: 'Get Hired', img: '/homePage/ats.png', desc: 'Land your dream job' },
  ];

  const employerSteps = [
    { icon: FiBriefcase, label: 'Post Jobs', img: '/homePage/post-job-cover.png', desc: 'Reach qualified candidates' },
    { icon: FiUsers, label: 'Find Talent', img: '/homePage/profile.png', desc: 'Advanced candidate search' },
    { icon: FiMapPin, label: 'Local Search', img: '/homePage/map.png', desc: 'Discover local talent' },
    { icon: FiVideo, label: 'Interview', img: '/homePage/chat1.png', desc: 'Built-in video interviews' },
    { icon: FiMessageCircle, label: 'Chat & Engage', img: '/homePage/chat2.png', desc: 'Instant messaging with applicants' },
    { icon: FiDownload, label: 'Manage Hiring', img: '/homePage/ats.png', desc: 'Bulk actions & insights' },
  ];

  const stats = [
    { value: '10K+', label: 'Active Jobs' },
    { value: '50K+', label: 'Professionals' },
    { value: '2K+', label: 'Companies' },
    { value: '94%', label: 'Hire Rate' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0D001A]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(167,139,250,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(139,92,246,0.1) 0%, transparent 50%)' }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[250px]" style={{ background: 'rgba(167, 139, 250, 0.12)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: 'rgba(196, 181, 253, 0.08)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">India's First AI-Powered Job Portal</span>
              </div>
              <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-[1.1] tracking-tight">
                Find Your{" "}
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-300 text-transparent bg-clip-text">Dream Job</span>
                <br />
                <span className="text-purple-200/80">Close to Home</span>
              </h1>
              <p className="text-base md:text-lg text-purple-200/60 mt-5 max-w-lg leading-relaxed">
                Nearby job listings, real-time recruiter chat, and professional networking — built for the Indian job market.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                <button onClick={() => router.push('/signup')} className="group w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  Get Started Free <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => router.push('/signin')} className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white/80 border border-white/20 hover:bg-white/10 transition-all">
                  Sign In
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-5 mt-10 text-sm text-purple-200/50">
                {stats.map(s => (
                  <span key={s.label} className="flex items-center gap-1.5"><FiCheck className="text-green-400" /> {s.value} {s.label}</span>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                  <div className="space-y-3">
                    {[
                      { role: "Software Engineer", company: "Tech Corp", dist: "2.5 km", tag: "New" },
                      { role: "Marketing Lead", company: "Brand Inc", dist: "1.8 km", tag: "Live Chat" },
                      { role: "Data Analyst", company: "DataViz", dist: "3.1 km", tag: "Urgent" },
                    ].map((job, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl p-3.5">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <FiBriefcase className="w-5 h-5 text-purple-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white">{job.role}</p>
                          <p className="text-xs text-purple-200/50">{job.company} · {job.dist}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-200">{job.tag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 text-center">
                    <p className="text-xs text-purple-200/40">Showing nearby jobs based on your location</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full bg-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">Platform Features</span>
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022]">Built for the way hiring works today</h2>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={cardVariants} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#101022] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Job Seekers */}
      <section className="w-full bg-gradient-to-br from-[#f8f6ff] to-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">For Job Seekers</span>
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022] leading-tight">From profile to paycheck — we've got you covered</h2>
          </motion.div>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative w-[260px] h-[530px] flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-blue-500/20 rounded-[3rem] blur-xl" />
              <div className="relative w-full h-full bg-white rounded-[3rem] border-[3px] border-gray-200 shadow-2xl overflow-hidden flex flex-col">
                <div className="h-6 flex items-center justify-center"><div className="w-20 h-1.5 bg-gray-300 rounded-full" /></div>
                <div className="flex-1 relative">
                  <Image src="/homePage/profile.png" alt="StaffBook App" fill className="object-cover" />
                </div>
                <div className="h-1.5 flex items-center justify-center"><div className="w-20 h-1 bg-gray-200 rounded-full" /></div>
              </div>
            </motion.div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {seekerSteps.map((step, i) => (
                <motion.div key={step.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, x: -30 }, visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.5 } }) }} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#101022]">{step.label}</p>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section className="w-full bg-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">For Employers</span>
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-medium text-[#101022] leading-tight">Hire smarter, not harder</h2>
          </motion.div>
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative w-[260px] h-[530px] flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-xl" />
              <div className="relative w-full h-full bg-white rounded-[3rem] border-[3px] border-gray-200 shadow-2xl overflow-hidden flex flex-col">
                <div className="h-6 flex items-center justify-center"><div className="w-20 h-1.5 bg-gray-300 rounded-full" /></div>
                <div className="flex-1 relative">
                  <Image src="/homePage/post-job-cover.png" alt="StaffBook Employer" fill className="object-cover" />
                </div>
                <div className="h-1.5 flex items-center justify-center"><div className="w-20 h-1 bg-gray-200 rounded-full" /></div>
              </div>
            </motion.div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employerSteps.map((step, i) => (
                <motion.div key={step.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, x: 30 }, visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.5 } }) }} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#101022]">{step.label}</p>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full bg-[#0D001A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-300 text-transparent bg-clip-text">{s.value}</p>
                <p className="text-sm text-purple-200/60 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101022]">Ready to find your next opportunity?</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-lg mx-auto">Join thousands of professionals already using StaffBook.</p>
            <button onClick={() => router.push('/signup')} className="mt-8 px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-800 hover:to-fuchsia-700 shadow-lg shadow-purple-300/40 hover:shadow-xl transition-all">
              Create Free Account
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

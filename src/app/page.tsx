"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiSearch, FiMessageCircle, FiUsers, FiBriefcase, FiMapPin, FiVideo, FiArrowRight, FiCheck, FiStar, FiShield } from "react-icons/fi";

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

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D001A]">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(167,139,250,0.25) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(139,92,246,0.15) 0%, transparent 50%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[250px] pointer-events-none" style={{ background: 'rgba(167, 139, 250, 0.15)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[200px] pointer-events-none" style={{ background: 'rgba(196, 181, 253, 0.1)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">India's First AI-Powered Job Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Your Next Job is{" "}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-300 text-transparent bg-clip-text">Closer</span>
              <br />
              <span className="text-purple-200/90">Than You Think</span>
            </h1>
            <p className="text-lg sm:text-xl text-purple-200/60 mt-5 max-w-2xl mx-auto leading-relaxed">
              StaffBook connects you with real recruiters, nearby opportunities, and a professional network — all at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <button
                onClick={() => router.push('/signup')}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Get Started Free <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/signin')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white/80 border border-white/20 hover:bg-white/10 hover:text-white transition-all"
              >
                Sign In
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-purple-200/50">
              <span className="flex items-center gap-2"><FiCheck className="text-green-400" /> 10K+ Active Jobs</span>
              <span className="flex items-center gap-2"><FiUsers className="text-purple-400" /> 50K+ Professionals</span>
              <span className="flex items-center gap-2"><FiStar className="text-yellow-400" /> 94% Hire Rate</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="w-full bg-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101022]">Built for the way hiring works today</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Modern tools for job seekers and employers alike</p>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FiMapPin, title: 'Location-Based Jobs', desc: 'Set your preferred distance — from 2 km to 50 km — and discover opportunities near you.', gradient: 'from-blue-500 to-cyan-500' },
              { icon: FiMessageCircle, title: 'Real-Time Chat', desc: 'Chat directly with recruiters. See when they are online and get instant responses.', gradient: 'from-purple-500 to-fuchsia-500' },
              { icon: FiUsers, title: 'Professional Network', desc: 'Share posts, updates, and reels. Build your professional brand within your community.', gradient: 'from-violet-500 to-purple-500' },
              { icon: FiVideo, title: 'Video Interviews', desc: 'Built-in video calls for interviews and meetings. No third-party tools required.', gradient: 'from-emerald-500 to-teal-500' },
              { icon: FiSearch, title: 'Smart Matching', desc: 'AI-powered recommendations that match your skills, experience, and preferences.', gradient: 'from-amber-500 to-orange-500' },
              { icon: FiShield, title: 'Verified Recruiters', desc: 'Every recruiter is verified. No spam, no fake listings — just genuine opportunities.', gradient: 'from-rose-500 to-pink-500' },
            ].map((f, i) => (
              <motion.div key={f.title} variants={cardVariants} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#101022] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full bg-gradient-to-br from-[#f8f6ff] to-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101022]">Get started in three simple steps</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up for free and build your professional profile with your skills, experience, and preferences.', color: 'from-purple-500 to-purple-600' },
              { step: '02', title: 'Discover & Connect', desc: 'Browse nearby jobs, connect with recruiters, and grow your network through posts and reels.', color: 'from-fuchsia-500 to-fuchsia-600' },
              { step: '03', title: 'Chat & Get Hired', desc: 'Message recruiters in real-time, attend video interviews, and land your next opportunity.', color: 'from-violet-500 to-violet-600' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-[#101022] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full bg-[#0D001A] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Active Jobs' },
              { value: '50K+', label: 'Professionals' },
              { value: '2K+', label: 'Companies' },
              { value: '94%', label: 'Satisfaction' },
            ].map((s) => (
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
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101022]">Ready to transform your career?</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-lg mx-auto">Join thousands of professionals who have found their next opportunity on StaffBook.</p>
            <button
              onClick={() => router.push('/signup')}
              className="mt-8 px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-800 hover:to-fuchsia-700 shadow-lg shadow-purple-300/40 hover:shadow-xl transition-all"
            >
              Create Your Free Account
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

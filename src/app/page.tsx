"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiSearch, FiMessageCircle, FiUsers, FiBriefcase, FiArrowRight, FiStar, FiTrendingUp } from "react-icons/fi";

export default function RootPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 text-transparent bg-clip-text">StaffBook</span>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/signin')} className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Sign In</button>
            <button onClick={() => router.push('/signup')} className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 shadow-lg shadow-purple-300/30 transition-all">Get Started</button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs font-semibold text-purple-700">India's First AI-Powered Job Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0D001A] leading-[1.1] tracking-tight">
              Find Jobs{" "}
              <span className="bg-gradient-to-r from-purple-700 to-fuchsia-600 text-transparent bg-clip-text">Near You</span>
              <br />
              <span className="text-gray-500">Chat. Connect. Get Hired.</span>
            </h1>
            <p className="text-lg text-gray-500 mt-5 max-w-lg leading-relaxed">
              India's first job portal with real-time recruiter chat, nearby job matching, and professional networking — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
              <button
                onClick={() => router.push('/signup')}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-800 hover:to-fuchsia-700 shadow-lg shadow-purple-300/40 hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Create Free Account <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/signin')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Sign In
              </button>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><FiStar className="text-yellow-400" /> 10K+ Jobs</span>
              <span className="flex items-center gap-1.5"><FiUsers className="text-purple-500" /> 50K+ Professionals</span>
              <span className="flex items-center gap-1.5"><FiTrendingUp className="text-green-500" /> Real-time Hiring</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-fuchsia-200/20 rounded-full blur-3xl" />
              <div className="relative bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-3xl p-8 shadow-xl">
                <div className="space-y-4">
                  {[
                    { icon: FiSearch, label: "Software Engineer", company: "Tech Corp", location: "2.5 km away", tag: "New" },
                    { icon: FiMessageCircle, label: "Marketing Manager", company: "Brand Inc", location: "1.8 km away", tag: "Live Chat" },
                    { icon: FiBriefcase, label: "Data Analyst", company: "DataViz", location: "3.1 km away", tag: "Urgent" },
                  ].map((job, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <job.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#0D001A]">{job.label}</p>
                        <p className="text-xs text-gray-400">{job.company} · {job.location}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">{job.tag}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400">Showing nearby jobs based on your location</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-gray-50/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0D001A]">Everything you need to land your next job</h2>
            <p className="text-gray-500 mt-3 text-lg">No more traditional portals — StaffBook is built different</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FiSearch, title: "Jobs Near You", desc: "Set your preferred distance — 2 km, 10 km, or 50 km. Find opportunities that fit your lifestyle.", color: "from-purple-500 to-purple-600" },
              { icon: FiMessageCircle, title: "Chat with Recruiters", desc: "See who's online and message them directly. No more waiting for callbacks.", color: "from-fuchsia-500 to-fuchsia-600" },
              { icon: FiUsers, title: "Professional Networking", desc: "Connect with peers, share updates, and grow your professional network in your area.", color: "from-violet-500 to-violet-600" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#0D001A] mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">For Employers</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0D001A] mt-3 leading-tight">Hire smarter with AI-powered matching</h2>
            <p className="text-gray-500 mt-4 leading-relaxed">Post jobs, get AI-matched candidates, chat before you interview, and hire faster than ever before.</p>
            <ul className="mt-6 space-y-3">
              {["Unlimited job postings", "AI-based candidate matching", "Bulk hiring tools", "Real-time recruiter analytics"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/signup')}
              className="mt-8 px-8 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-800 hover:to-fuchsia-700 shadow-lg shadow-purple-300/40 transition-all"
            >
              Start Hiring
            </button>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-3xl p-8 lg:p-12 border border-purple-100/50">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Active Jobs", value: "10K+" },
                { label: "Candidates", value: "50K+" },
                { label: "Companies", value: "2K+" },
                { label: "Hiring Rate", value: "94%" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-50">
                  <p className="text-2xl font-bold text-[#0D001A]">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#0D001A] via-[#1a0033] to-[#2d0a4e] rounded-3xl p-12 md:p-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Join StaffBook today</h2>
          <p className="text-purple-200/70 mt-4 text-lg max-w-lg mx-auto">It's free to create your profile and start connecting with recruiters near you.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => router.push('/signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-[#0D001A] bg-white hover:bg-gray-100 shadow-lg transition-all"
            >
              Create Free Account
            </button>
            <button
              onClick={() => router.push('/signin')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white/90 border border-white/20 hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

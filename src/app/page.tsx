"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiBriefcase, FiUsers, FiMessageCircle, FiSearch, FiArrowRight } from "react-icons/fi";

export default function RootPage() {
  const router = useRouter();

  const features = [
    { icon: FiSearch, title: "Nearby Jobs", desc: "Find jobs within 2-50 km of your home. No more long commutes." },
    { icon: FiMessageCircle, title: "Live Chat", desc: "Chat directly with recruiters in real-time. Get hired faster." },
    { icon: FiUsers, title: "Networking", desc: "Connect with professionals & recruiters in your area." },
    { icon: FiBriefcase, title: "Smart Hiring", desc: "AI-powered matching for employers to find the right candidate." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0D001A] via-[#1a0033] to-[#2d0a4e]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(167,139,250,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(139,92,246,0.2) 0%, transparent 50%)' }} />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">India's First AI-Powered Job Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl mx-auto">
              Nearby Jobs,{" "}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-300 text-transparent bg-clip-text">Live Chat</span>
              <br />
              <span className="text-purple-200/90">& Real Networking</span>
            </h1>
            <p className="text-lg sm:text-xl text-purple-200/70 mt-6 max-w-2xl mx-auto">
              Because 1 new employee and 1 right job can change everything.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <button
                onClick={() => router.push('/signup')}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started Free
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/signin')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white/90 border border-white/20 hover:bg-white/10 transition-all"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a0033]">Why StaffBook?</h2>
          <p className="text-gray-500 mt-3 text-lg">Built for the real Indian job market</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-purple-100 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a0033] mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0D001A] via-[#1a0033] to-[#2d0a4e]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to take the next step?</h2>
          <p className="text-purple-200/70 mt-4 text-lg">Join thousands of professionals and recruiters already on StaffBook.</p>
          <button
            onClick={() => router.push('/signup')}
            className="mt-8 px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
          >
            Create Your Account
          </button>
        </div>
      </section>
    </div>
  );
}

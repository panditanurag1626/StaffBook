'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  FiZap, FiArrowRight, FiTarget, FiEye, FiUsers,
  FiMessageCircle,
  FiCpu, FiHeart, FiStar, FiShield, FiTrendingUp,
  FiCheck, FiCompass, FiMapPin
} from 'react-icons/fi'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.unobserve(el) } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

function FadeUp({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function ValueCard({ icon: Icon, title, description, delay }: { icon: React.ElementType; title: string; description: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
        <div className="relative bg-white border border-purple-100/50 rounded-2xl p-5 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-3 shadow-md shadow-purple-500/20">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </FadeUp>
  )
}

export default function AboutPage() {
  const values = [
    { icon: FiZap, title: 'Innovation', description: 'We push boundaries with AI-driven recruitment technology, constantly evolving to make hiring smarter, faster, and more intuitive for everyone.' },
    { icon: FiShield, title: 'Trust', description: 'Trust is our foundation. We ensure transparent, secure interactions between job seekers and employers, building lasting professional relationships.' },
    { icon: FiEye, title: 'Transparency', description: 'Honest communication, clear processes, and no hidden agendas. We believe in open dialogue between candidates and recruiters.' },
    { icon: FiTrendingUp, title: 'Growth', description: 'We empower professionals to advance their careers and help businesses grow by connecting them with the right talent at the right time.' },
    { icon: FiHeart, title: 'Diversity', description: 'We champion inclusive hiring practices, creating equal opportunities for talents from all backgrounds, cultures, and experiences.' },
    { icon: FiStar, title: 'Excellence', description: 'We strive for excellence in every interaction, delivering premium experiences that exceed expectations for both employers and job seekers.' },
  ]

  const team = [
    { name: 'Amit Verma', role: 'Founder & CEO' },
    { name: 'Neha Gupta', role: 'Chief Technology Officer' },
    { name: 'Rohan Desai', role: 'VP of Product' },
    { name: 'Sneha Reddy', role: 'Head of Design' },
    { name: 'Arjun Nair', role: 'Chief Marketing Officer' },
    { name: 'Priya Mehta', role: 'Head of Operations' },
  ]

  return (
    <div className="min-h-screen bg-[#f3f2ed]">
      {/* ===== 1. Hero Section ===== */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-white" />
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/50 text-purple-700 text-xs font-medium mb-4 backdrop-blur-sm">
                <FiZap className="w-3 h-3" />
                India&apos;s First AI-Powered Recruitment Platform
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Revolutionizing the Way{' '}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  India Hires
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Staff Book is a premium AI-powered recruitment, hiring, professional networking, and career platform
                that connects employers, recruiters, and job seekers through innovative technology and real-time communication.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ===== 2. Our Mission ===== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <FadeUp>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                  <FiTarget className="w-2.5 h-2.5" />
                  Our Mission
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  Empowering Every Professional to{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Find Their Purpose
                  </span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                  At Staff Book, we are on a mission to democratize access to career opportunities and
                  transform how people connect with their dream jobs. We believe that finding the right
                  job should not be a challenge — it should be a journey of discovery powered by
                  intelligence, empathy, and innovation.
                </p>
                <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                  We leverage cutting-edge AI technology to bridge the gap between talented professionals
                  and forward-thinking employers, creating a seamless ecosystem where careers flourish
                  and businesses thrive.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <FiUsers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">500K+ Professionals</p>
                      <p className="text-xs text-gray-500">Connected and growing daily</p>
                    </div>
                  </div>
          <div className="space-y-2">
                    {[
                      'AI-powered job matching for precision results',
                      'Real-time chat with recruiters for faster hiring',
                      'Hyperlocal job discovery for nearby opportunities',
                      'ATS-friendly resume builder for career growth',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FiCheck className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ===== 3. Our Vision ===== */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <FadeUp>
              <div className="relative order-2 md:order-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FiCompass className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base font-bold text-gray-900">Our North Star</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    &ldquo;To become the world&apos;s most trusted AI-powered career ecosystem, where every
                    professional finds their true potential and every organization discovers their
                    perfect talent match.&rdquo;
                  </p>
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={200}>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
                  <FiEye className="w-2.5 h-2.5" />
                  Our Vision
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  Shaping the Future of{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Work and Connection
                  </span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                  We envision a world where geographical boundaries and traditional hiring barriers no longer
                  limit professional growth. A future where AI empowers every individual to find work that
                  aligns with their skills, passions, and lifestyle.
                </p>
                <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                  Our vision extends beyond job matching — we are building a comprehensive professional
                  ecosystem that nurtures careers from the first resume to executive leadership,
                  fostering lifelong learning, networking, and growth.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ===== 5. Why Choose Staff Book ===== */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FiStar className="w-2.5 h-2.5" />
                Why Choose Staff Book
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Built Different. Built Better.</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                We are not just another job portal. Here is what makes us the preferred choice for millions.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FiCpu, title: 'AI-First Approach', description: 'Our intelligent algorithms learn from every interaction, delivering increasingly accurate matches over time.' },
              { icon: FiMessageCircle, title: 'Real-Time Communication', description: 'Chat directly with recruiters and candidates instantly. No more waiting for email responses.' },
              { icon: FiMapPin, title: 'Hyperlocal Discovery', description: 'Find jobs and candidates near you with our location-based search and mapping technology.' },
              { icon: FiShield, title: 'Verified Profiles', description: 'Every profile is verified to ensure authentic interactions and build trust in the community.' },
              { icon: FiTrendingUp, title: 'Data-Driven Insights', description: 'Get powerful analytics on your profile performance, application status, and market trends.' },
              { icon: FiHeart, title: 'Community Focused', description: 'We are building more than a platform — we are fostering a community of growth and opportunity.' },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="bg-white border border-purple-100/50 rounded-xl p-4 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-0.5 h-full">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-2">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. Core Values ===== */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FiHeart className="w-2.5 h-2.5" />
                Core Values
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What We Stand For</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                Our values guide every decision, feature, and interaction on our platform.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((v, i) => (
              <ValueCard key={i} {...v} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 10. Team Section ===== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FiUsers className="w-2.5 h-2.5" />
                Leadership Team
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Meet the People Behind Staff Book</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                A passionate team dedicated to transforming India&apos;s recruitment landscape.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="group bg-white border border-purple-100/50 rounded-xl p-4 text-center hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-base font-bold text-purple-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 13. CTA ===== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 sm:p-10 lg:p-12 text-center">
              <div className="absolute top-0 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                  Ready to Transform Your Career?
                </h2>
                <p className="mt-3 text-sm text-purple-200 max-w-2xl mx-auto">
                  Join millions of professionals and thousands of employers who trust Staff Book for their hiring and career needs.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-purple-700 bg-white hover:bg-purple-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/premium-services"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  )
}

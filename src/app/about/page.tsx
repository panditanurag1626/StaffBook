'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiZap, FiArrowRight, FiTarget, FiEye, FiUsers, FiBriefcase,
  FiSearch, FiMessageCircle, FiFileText, FiGlobe, FiLayers,
  FiCpu, FiHeart, FiStar, FiShield, FiTrendingUp, FiAward,
  FiCheck, FiChevronRight, FiPlay, FiUserCheck, FiSend,
  FiBookOpen, FiCompass, FiCode, FiHelpCircle, FiMapPin
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

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  const [ref, inView] = useInView()
  const [count, setCount] = useState(0)
  const numValue = parseInt(value.replace(/[^0-9]/g, ''))
  const suffix = value.replace(/[0-9]/g, '')

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = Math.ceil(numValue / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= numValue) { setCount(numValue); clearInterval(timer) }
      else setCount(start)
    }, duration / 60)
    return () => clearInterval(timer)
  }, [inView, numValue])

  return (
    <div ref={ref} className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
      <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-1">{count}{suffix}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  )
}

function ValueCard({ icon: Icon, title, description, delay }: { icon: React.ElementType; title: string; description: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
        <div className="relative bg-white border border-purple-100/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </FadeUp>
  )
}

function TimelineItem({ year, title, description, index }: { year: string; title: string; description: string; index: number }) {
  return (
    <FadeUp delay={index * 100}>
      <div className="relative pl-10 pb-12 last:pb-0 group">
        <div className="absolute left-[15px] top-2 bottom-0 w-px bg-gradient-to-b from-purple-300 to-transparent group-last:hidden" />
        <div className="absolute left-0 top-2 w-[30px] h-[30px] rounded-full bg-white border-2 border-purple-300 flex items-center justify-center group-hover:border-purple-500 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
        </div>
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">{year}</span>
        <h3 className="text-lg font-bold text-gray-900 mt-1">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </FadeUp>
  )
}

function TestimonialCard({ quote, name, role, delay }: { quote: string; name: string; role: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <div className="bg-white border border-purple-100/50 rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 h-full flex flex-col">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed italic flex-1">&ldquo;{quote}&rdquo;</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </FadeUp>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-purple-100/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-purple-50/30 transition-colors"
      >
        <span className="text-sm sm:text-base font-semibold text-gray-900 pr-4">{question}</span>
        <FiChevronRight className={`w-5 h-5 text-purple-500 transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-90' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-gray-500 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const stats = [
    { value: '500K+', label: 'Active Users', icon: FiUsers },
    { value: '50K+', label: 'Employers', icon: FiBriefcase },
    { value: '1M+', label: 'Jobs Posted', icon: FiSend },
    { value: '100K+', label: 'Recruiters', icon: FiUserCheck },
  ]

  const values = [
    { icon: FiZap, title: 'Innovation', description: 'We push boundaries with AI-driven recruitment technology, constantly evolving to make hiring smarter, faster, and more intuitive for everyone.' },
    { icon: FiShield, title: 'Trust', description: 'Trust is our foundation. We ensure transparent, secure interactions between job seekers and employers, building lasting professional relationships.' },
    { icon: FiEye, title: 'Transparency', description: 'Honest communication, clear processes, and no hidden agendas. We believe in open dialogue between candidates and recruiters.' },
    { icon: FiTrendingUp, title: 'Growth', description: 'We empower professionals to advance their careers and help businesses grow by connecting them with the right talent at the right time.' },
    { icon: FiHeart, title: 'Diversity', description: 'We champion inclusive hiring practices, creating equal opportunities for talents from all backgrounds, cultures, and experiences.' },
    { icon: FiStar, title: 'Excellence', description: 'We strive for excellence in every interaction, delivering premium experiences that exceed expectations for both employers and job seekers.' },
  ]

  const features = [
    { icon: FiCpu, title: 'AI-Powered Matching', description: 'Our intelligent algorithms analyze skills, experience, and preferences to deliver the most relevant job matches and candidate recommendations.' },
    { icon: FiMessageCircle, title: 'Live Chat with Recruiters', description: 'Connect instantly with recruiters through real-time messaging, making the hiring process faster and more personal.' },
    { icon: FiSearch, title: 'Nearby Job Discovery', description: 'Find opportunities near you with our location-based job search. Discover hidden gems in your local job market.' },
    { icon: FiFileText, title: 'ATS-Friendly Resume Builder', description: 'Create professional, ATS-optimized resumes that pass through applicant tracking systems and catch recruiters\' attention.' },
    { icon: FiGlobe, title: 'Professional Networking', description: 'Build meaningful professional connections, share insights, and grow your network with industry peers and leaders.' },
    { icon: FiLayers, title: 'Comprehensive Dashboard', description: 'Track applications, manage interviews, and monitor your job search progress with powerful analytics and insights.' },
  ]

  const steps = [
    { icon: FiUserCheck, title: 'Create Your Profile', description: 'Sign up and build a comprehensive profile showcasing your skills, experience, and career aspirations.' },
    { icon: FiSearch, title: 'Discover Opportunities', description: 'Browse thousands of job listings, get AI-powered recommendations, and receive personalized job alerts.' },
    { icon: FiMessageCircle, title: 'Connect & Apply', description: 'Apply with one click, chat directly with recruiters, and schedule interviews seamlessly.' },
    { icon: FiBriefcase, title: 'Grow Your Career', description: 'Accept offers, build your professional network, and continue advancing with new opportunities.' },
  ]

  const testimonials = [
    { quote: 'Staff Book completely transformed my job search. The AI matching found roles I would have never discovered on my own. I landed my dream job within two weeks!', name: 'Priya Sharma', role: 'Software Engineer at Google' },
    { quote: 'As a recruiter, Staff Book has been a game-changer. The quality of candidates and the ease of communication through live chat has reduced our hiring time by 60%.', name: 'Rajesh Kumar', role: 'HR Director at TCS' },
    { quote: 'The resume builder alone is worth it. My ATS-friendly resume got me 5x more interview calls. The networking features are incredible too!', name: 'Ananya Patel', role: 'Product Manager at Amazon' },
    { quote: 'We found our best hires through Staff Book. The nearby job discovery feature helped us connect with local talent we were missing on other platforms.', name: 'Vikram Singh', role: 'CEO at InnovateTech' },
  ]

  const faqs = [
    { question: 'What is Staff Book?', answer: 'Staff Book is India\'s first AI-powered recruitment, hiring, professional networking, and career platform that connects employers, recruiters, and job seekers through innovative technology and real-time communication.' },
    { question: 'Is Staff Book free to use?', answer: 'Yes! Staff Book offers a free starter plan for both job seekers and employers. Premium plans with additional features like enhanced visibility, unlimited contacts, and advanced analytics are available for those looking to accelerate their hiring or job search.' },
    { question: 'How does the AI job matching work?', answer: 'Our AI analyzes your profile, skills, experience, preferences, and behavior patterns to match you with the most relevant job opportunities. The more you use Staff Book, the smarter and more personalized your recommendations become.' },
    { question: 'Can I chat with recruiters directly?', answer: 'Absolutely! Staff Book\'s built-in live chat feature allows job seekers to connect directly with recruiters in real-time, making the hiring process faster, more transparent, and more personal.' },
    { question: 'What makes Staff Book different from other job portals?', answer: 'Staff Book combines AI-powered job matching, live chat with recruiters, nearby job discovery, ATS-friendly resume building, and professional networking — all in one seamless platform. Our hyperlocal approach and real-time communication features set us apart.' },
    { question: 'How do I create an ATS-friendly resume?', answer: 'Staff Book\'s built-in resume builder is designed to create resumes that pass through Applicant Tracking Systems (ATS). Simply fill in your details, choose a professional template, and download your optimized resume instantly.' },
  ]

  const whyCompanies = [
    { icon: FiTarget, title: 'Access Premium Talent', description: 'Reach highly qualified candidates who are actively looking and those who are open to the right opportunity.' },
    { icon: FiZap, title: 'AI-Powered Screening', description: 'Save time with intelligent candidate screening that shortlists the most relevant applicants based on your requirements.' },
    { icon: FiMessageCircle, title: 'Direct Communication', description: 'Chat with candidates in real-time, schedule interviews instantly, and make hiring decisions faster.' },
  ]

  const whyJobSeekers = [
    { icon: FiStar, title: 'Personalized Job Alerts', description: 'Receive job recommendations tailored to your skills, experience, and career goals — no more irrelevant listings.' },
    { icon: FiSend, title: 'One-Click Apply', description: 'Apply to jobs with a single click. Your profile is your resume, making the application process effortless.' },
    { icon: FiUsers, title: 'Build Your Network', description: 'Connect with industry professionals, join discussions, and grow your career through meaningful relationships.' },
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
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-white" />
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/80 border border-purple-200/50 text-purple-700 text-sm font-medium mb-6 backdrop-blur-sm">
                <FiZap className="w-4 h-4" />
                India&apos;s First AI-Powered Recruitment Platform
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Revolutionizing the Way{' '}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  India Hires
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Staff Book is a premium AI-powered recruitment, hiring, professional networking, and career platform
                that connects employers, recruiters, and job seekers through innovative technology and real-time communication.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-gray-700 bg-white border border-gray-200 hover:border-purple-200 hover:shadow-lg hover:text-purple-700 transition-all duration-300"
                >
                  <FiPlay className="w-4 h-4" />
                  See How It Works
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ===== 2. Our Mission ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                  <FiTarget className="w-3 h-3" />
                  Our Mission
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  Empowering Every Professional to{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Find Their Purpose
                  </span>
                </h2>
                <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed">
                  At Staff Book, we are on a mission to democratize access to career opportunities and
                  transform how people connect with their dream jobs. We believe that finding the right
                  job should not be a challenge — it should be a journey of discovery powered by
                  intelligence, empathy, and innovation.
                </p>
                <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed">
                  We leverage cutting-edge AI technology to bridge the gap between talented professionals
                  and forward-thinking employers, creating a seamless ecosystem where careers flourish
                  and businesses thrive.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <FiUsers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">500K+ Professionals</p>
                      <p className="text-xs text-gray-500">Connected and growing daily</p>
                    </div>
                  </div>
                  <div className="space-y-4">
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
      <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="relative order-2 md:order-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <FiCompass className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Our North Star</h3>
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed italic">
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
                  <FiEye className="w-3 h-3" />
                  Our Vision
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  Shaping the Future of{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Work and Connection
                  </span>
                </h2>
                <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed">
                  We envision a world where geographical boundaries and traditional hiring barriers no longer
                  limit professional growth. A future where AI empowers every individual to find work that
                  aligns with their skills, passions, and lifestyle.
                </p>
                <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed">
                  Our vision extends beyond job matching — we are building a comprehensive professional
                  ecosystem that nurtures careers from the first resume to executive leadership,
                  fostering lifelong learning, networking, and growth.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ===== 4. Our Story ===== */}
      <section id="our-story" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiBookOpen className="w-3 h-3" />
                Our Story
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">The Journey So Far</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                From a bold idea to a platform transforming India&apos;s recruitment landscape — our story is one of passion, persistence, and purpose.
              </p>
            </div>
          </FadeUp>
          <div className="max-w-3xl mx-auto">
            <TimelineItem
              year="2020"
              title="The Beginning"
              description="Staff Book was founded with a vision to revolutionize India's recruitment industry. Our founders recognized the gap between traditional hiring methods and the needs of a digital-first workforce."
              index={0}
            />
            <TimelineItem
              year="2021"
              title="Platform Launch"
              description="We launched our beta platform with AI-powered job matching and real-time chat capabilities, quickly gaining traction among early adopters and forward-thinking companies."
              index={1}
            />
            <TimelineItem
              year="2022"
              title="Rapid Growth"
              description="Staff Book crossed 100,000 users and 10,000 employers. We introduced our ATS-friendly resume builder, networking features, and hyperlocal job discovery."
              index={2}
            />
            <TimelineItem
              year="2023"
              title="Market Leadership"
              description="With 500K+ users and 50K+ employers, Staff Book became India's fastest-growing recruitment platform. We expanded our AI capabilities and launched premium features."
              index={3}
            />
            <TimelineItem
              year="2024"
              title="Continued Innovation"
              description="We introduced advanced analytics, meeting scheduling, and enhanced networking. Our platform now supports millions of job applications and connections every month."
              index={4}
            />
          </div>
        </div>
      </section>

      {/* ===== 5. Why Choose Staff Book ===== */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiStar className="w-3 h-3" />
                Why Choose Staff Book
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Built Different. Built Better.</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                We are not just another job portal. Here is what makes us the preferred choice for millions.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FiCpu, title: 'AI-First Approach', description: 'Our intelligent algorithms learn from every interaction, delivering increasingly accurate matches over time.' },
              { icon: FiMessageCircle, title: 'Real-Time Communication', description: 'Chat directly with recruiters and candidates instantly. No more waiting for email responses.' },
              { icon: FiMapPin, title: 'Hyperlocal Discovery', description: 'Find jobs and candidates near you with our location-based search and mapping technology.' },
              { icon: FiShield, title: 'Verified Profiles', description: 'Every profile is verified to ensure authentic interactions and build trust in the community.' },
              { icon: FiTrendingUp, title: 'Data-Driven Insights', description: 'Get powerful analytics on your profile performance, application status, and market trends.' },
              { icon: FiHeart, title: 'Community Focused', description: 'We are building more than a platform — we are fostering a community of growth and opportunity.' },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="bg-white border border-purple-100/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. Platform Statistics ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiAward className="w-3 h-3" />
                Platform Statistics
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Impact in Numbers</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                We are proud of the trust millions of users and businesses have placed in us.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. Core Values ===== */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiHeart className="w-3 h-3" />
                Core Values
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What We Stand For</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                Our values guide every decision, feature, and interaction on our platform.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <ValueCard key={i} {...v} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. Platform Features ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiLayers className="w-3 h-3" />
                Platform Features
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need to Succeed</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                Powerful tools and features designed to make hiring and job searching effortless.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="group relative bg-white border border-purple-100/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 9. How It Works ===== */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiCode className="w-3 h-3" />
                How Staff Book Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Your Journey to Success</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                Get started in minutes and take control of your career journey.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <FadeUp key={i} delay={i * 150}>
                <div className="relative text-center group">
                  <div className="absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-purple-300 to-transparent hidden lg:block group-last:hidden" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center mx-auto mb-4 -mt-2">
                    <span className="text-xs font-bold text-purple-700">{i + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 10. Team Section ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiUsers className="w-3 h-3" />
                Leadership Team
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Meet the People Behind Staff Book</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                A passionate team dedicated to transforming India&apos;s recruitment landscape.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="group bg-white border border-purple-100/50 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-purple-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{member.role}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 11. Testimonials ===== */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiStar className="w-3 h-3" />
                Testimonials
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trusted by Thousands</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                Hear from our community of professionals and businesses.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 12. FAQ ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiHelpCircle className="w-3 h-3" />
                FAQs
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                Everything you need to know about Staff Book.
              </p>
            </div>
          </FadeUp>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeUp key={i} delay={i * 50}>
                <FAQItem {...faq} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 13. CTA ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-8 sm:p-12 lg:p-16 text-center">
              <div className="absolute top-0 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Ready to Transform Your Career?
                </h2>
                <p className="mt-4 text-lg text-purple-200 max-w-2xl mx-auto">
                  Join millions of professionals and thousands of employers who trust Staff Book for their hiring and career needs.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-purple-700 bg-white hover:bg-purple-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/premium-services"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ===== 14. Premium Footer ===== */}
     
    </div>
  )
}

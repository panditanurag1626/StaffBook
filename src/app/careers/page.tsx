'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  FiMapPin, FiClock, FiBriefcase, FiDollarSign, FiHeart,
  FiArrowRight, FiCheck, FiStar, FiUsers, FiZap, FiTarget,
  FiGift, FiTrendingUp, FiSmile, FiCoffee, FiBook, FiAward,
  FiPlay, FiSend, FiGlobe, FiLayers
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

const openPositions = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    experience: '3-5 years',
    type: 'Full-time',
    location: 'Bangalore, IN',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    experience: '2-4 years',
    type: 'Full-time',
    location: 'Mumbai, IN',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
  },
  {
    title: 'Backend Engineer',
    department: 'Engineering',
    experience: '3-5 years',
    type: 'Full-time',
    location: 'Hyderabad, IN',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
  },
]

const benefits = [
  { icon: FiDollarSign, title: 'Competitive Salary', description: 'Top-of-market compensation with regular reviews and performance bonuses.' },
  { icon: FiHeart, title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage for you and your family.' },
  { icon: FiTrendingUp, title: 'Career Growth', description: 'Dedicated learning budget, conferences, and career development programs.' },
  { icon: FiCoffee, title: 'Flexible Work', description: 'Remote-first culture with flexible hours. Work from anywhere in India.' },
  { icon: FiGift, title: 'Stock Options', description: 'Be an owner. Every full-time employee receives equity in the company.' },
  { icon: FiSmile, title: 'Wellness Programs', description: 'Mental health support, gym memberships, and wellness allowances.' },
  { icon: FiBook, title: 'Learning & Development', description: 'Annual learning budget, mentorship programs, and internal workshops.' },
  { icon: FiZap, title: 'Latest Tools', description: 'Access to cutting-edge tools and technologies to do your best work.' },
  { icon: FiUsers, title: 'Team Events', description: 'Regular team offsites, hackathons, and social events to bond and celebrate.' },
]

const hiringSteps = [
  { step: '01', title: 'Apply', description: 'Submit your application through our careers page with your resume and portfolio.' },
  { step: '02', title: 'Resume Review', description: 'Our team reviews your profile and shortlists candidates who match our requirements.' },
  { step: '03', title: 'Interview', description: 'A conversational interview to understand your experience, skills, and aspirations.' },
  { step: '04', title: 'Technical Round', description: 'A deep dive into your technical skills through a practical assessment or discussion.' },
  { step: '05', title: 'Final Offer', description: 'Selected candidates receive a detailed offer letter with compensation and benefits.' },
  { step: '06', title: 'Welcome Aboard', description: 'Join the Staff Book team and start your journey with a structured onboarding plan.' },
]

const testimonials = [
  { quote: 'Working at Staff Book has been the most fulfilling experience of my career. The culture of innovation and mutual respect is unmatched.', name: 'Arun Kumar', role: 'Senior Frontend Developer' },
  { quote: 'The learning opportunities here are incredible. I have grown more in one year at Staff Book than in five years at my previous job.', name: 'Priya Sharma', role: 'Product Manager' },
  { quote: 'What I love most is the autonomy. Staff Book trusts you to do your best work, and the support system is amazing.', name: 'Rahul Verma', role: 'Backend Developer' },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#f3f2ed]">
      {/* 1. Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-white" />
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/50 text-purple-700 text-xs font-medium mb-4 backdrop-blur-sm">
                <FiZap className="w-3 h-3" />
                Join the Team That&apos;s Transforming Hiring
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Build the Future of{' '}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Hiring with Us
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
                At Staff Book, we are building India&apos;s most advanced AI-powered recruitment platform.
                Join a team of passionate innovators working to transform how millions of people find their dream careers.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link
                  href="#open-positions"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  View Open Positions
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="#life-at-staffbook"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-purple-200 hover:shadow-md hover:text-purple-700 transition-all duration-300"
                >
                  <FiPlay className="w-3.5 h-3.5" />
                  Life at Staff Book
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 2. Why Work at Staff Book */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FiStar className="w-2.5 h-2.5" />
                Why Work at Staff Book
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Build Products That Matter</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                Join a high-impact team working on technology that directly improves the lives of millions of professionals across India.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FiTarget, title: 'High Impact', description: 'Work on products used by millions. Every feature you build touches real lives and careers.' },
              { icon: FiZap, title: 'Cutting-Edge Tech', description: 'Work with modern AI/ML stacks, real-time systems, and cloud-native architectures.' },
              { icon: FiUsers, title: 'Great Team', description: 'Collaborate with talented, passionate colleagues who push each other to grow.' },
              { icon: FiTrendingUp, title: 'Rapid Growth', description: 'Scale with a fast-growing startup. Your responsibilities and impact grow with the company.' },
              { icon: FiGlobe, title: 'Remote-First', description: 'Work from wherever you are most productive. Flexible hours and async communication.' },
              { icon: FiAward, title: 'Ownership & Autonomy', description: 'Own your projects end-to-end. We trust you to make decisions and drive results.' },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div className="bg-white border border-purple-100/50 rounded-xl p-4 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-0.5 h-full">
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

      {/* 3. Our Culture */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <FadeUp>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <FiHeart className="w-2.5 h-2.5" />
                  Our Culture
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  A Culture of{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Innovation and Belonging
                  </span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                  We believe great products come from great teams. Our culture is built on trust, autonomy, and a shared mission to transform how India hires.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    'Remote-first with flexible working hours',
                    'Flat hierarchy — your ideas matter regardless of title',
                    'Regular team offsites and hackathons',
                    'Diverse and inclusive workplace',
                    'Open communication and radical transparency',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FiCheck className="w-2.5 h-2.5 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={150}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">Our Core Principles</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'User Obsession', value: 'Every decision starts with our users' },
                      { label: 'Move Fast', value: 'Iterate quickly, learn from every experiment' },
                      { label: 'Own It', value: 'Take ownership and drive impact end-to-end' },
                      { label: 'Stay Curious', value: 'Never stop learning and improving' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-purple-50">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <FiCheck className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{p.label}</p>
                          <p className="text-[10px] text-gray-500">{p.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 4. Benefits */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FiGift className="w-2.5 h-2.5" />
                Employee Benefits
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">We Take Care of Our People</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                We invest in our team because happy, supported people do their best work.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b, i) => (
              <FadeUp key={i} delay={i * 60}>
                <div className="bg-white border border-purple-100/50 rounded-xl p-4 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-2">
                    <b.icon className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Open Positions */}
      <section id="open-positions" className="py-12 sm:py-16 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FiBriefcase className="w-2.5 h-2.5" />
                Open Positions
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Join Our Team</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                We are looking for talented individuals who want to make a difference. If you are passionate about building great products, we want to hear from you.
              </p>
            </div>
          </FadeUp>
          <div className="space-y-3">
            {openPositions.map((role, i) => (
              <FadeUp key={i} delay={i * 50}>
                <div className="group bg-white border border-purple-100/50 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-1.5 py-0.5 rounded-full">
                          {role.department}
                        </span>
                        <span className="text-[10px] text-gray-400">|</span>
                        <span className="text-[10px] text-gray-500">{role.type}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{role.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {role.skills.map((skill, j) => (
                          <span key={j} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{skill}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><FiMapPin className="w-2.5 h-2.5" /> {role.location}</span>
                        <span className="flex items-center gap-1"><FiClock className="w-2.5 h-2.5" /> {role.experience}</span>
                      </div>
                    </div>
                    <Link
                      href="mailto:info@staffbook.in?subject=Application for role"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-md hover:shadow-purple-500/25 transition-all duration-300 flex-shrink-0 self-start sm:self-center"
                    >
                      Apply Now
                      <FiSend className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp>
            <div className="mt-6 text-center">
              <div className="bg-white border border-purple-100/50 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Don&apos;t See Your Role?</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                  We are always looking for great talent. Send us your resume and we will reach out when a suitable position opens.
                </p>
                <Link
                  href="mailto:info@staffbook.in?subject=General Application"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 transition-all duration-300"
                >
                  Send General Application
                  <FiSend className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 6. Hiring Process */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FiLayers className="w-2.5 h-2.5" />
                Hiring Process
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How We Hire</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                A transparent, structured process designed to find the best match for both you and us.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hiringSteps.map((step, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div className="relative bg-white border border-purple-100/50 rounded-xl p-4 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      {step.step}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed pl-11">{step.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Life at Staff Book */}
      <section id="life-at-staffbook" className="py-12 sm:py-16 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <FadeUp>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <FiHeart className="w-2.5 h-2.5" />
                  Life at Staff Book
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  More Than a Job —{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    A Place to Grow
                  </span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                  At Staff Book, work is more than just writing code or building products. It is about being part of a community that supports your personal and professional growth every day.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { icon: FiCoffee, label: 'Snacks & Coffee' },
                    { icon: FiBook, label: 'Learning Library' },
                    { icon: FiUsers, label: 'Team Offsites' },
                    { icon: FiSmile, label: 'Fun Events' },
                    { icon: FiZap, label: 'Hackathons' },
                    { icon: FiAward, label: 'Recognition' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-purple-50">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <item.icon className="w-3 h-3 text-purple-600" />
                      </div>
                      <span className="text-[10px] font-medium text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={150}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">Perks at a Glance</h3>
                  <div className="space-y-2.5">
                    {[
                      { icon: FiDollarSign, label: 'Competitive Compensation' },
                      { icon: FiHeart, label: 'Health & Wellness' },
                      { icon: FiGift, label: 'Equity for Everyone' },
                      { icon: FiTrendingUp, label: 'Growth Budget' },
                      { icon: FiCoffee, label: 'Flexible PTO' },
                      { icon: FiGlobe, label: 'Remote First' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-purple-50">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <p.icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FiStar className="w-2.5 h-2.5" />
                Employee Testimonials
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Hear from Our Team</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                Real words from the people who make Staff Book what it is.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="bg-white border border-purple-100/50 rounded-xl p-4 sm:p-5 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed italic flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-900">{t.name}</p>
                    <p className="text-[10px] text-gray-500">{t.role}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 sm:p-10 lg:p-12 text-center">
              <div className="absolute top-0 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                  Ready to Shape the Future of Hiring?
                </h2>
                <p className="mt-3 text-sm text-purple-200 max-w-2xl mx-auto">
                  Join Staff Book and be part of a team that is transforming how millions of people find their dream careers.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 justify-center">
                  <Link
                    href="#open-positions"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-purple-700 bg-white hover:bg-purple-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    View Open Positions
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Learn About Us
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

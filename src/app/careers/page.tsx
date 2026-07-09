'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiMapPin, FiClock, FiBriefcase, FiDollarSign, FiHeart,
  FiArrowRight, FiCheck, FiStar, FiUsers, FiZap, FiTarget,
  FiGift, FiTrendingUp, FiSmile, FiCoffee, FiBook, FiAward,
  FiChevronRight, FiPlay, FiSend
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

const openRoles = [
  {
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '3-5 years',
    description: 'Build scalable systems that power our AI-driven recruitment platform. Work with cutting-edge technologies and shape the future of hiring.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '2-4 years',
    description: 'Design intuitive, beautiful experiences for millions of users. Own the end-to-end design process from research to pixel-perfect delivery.',
  },
  {
    title: 'AI/ML Engineer',
    department: 'Engineering',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '3-6 years',
    description: 'Develop and optimize machine learning models that power our job matching, recommendations, and intelligent search features.',
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '4-6 years',
    description: 'Define product strategy and roadmap for our core platform features. Work closely with engineering, design, and business teams.',
  },
  {
    title: 'Marketing Lead',
    department: 'Marketing',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '3-5 years',
    description: 'Drive growth and brand awareness through innovative marketing campaigns. Own our content strategy and community engagement.',
  },
  {
    title: 'Customer Success Manager',
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    experience: '2-4 years',
    description: 'Ensure our users get maximum value from Staff Book. Guide employers and job seekers through their journey on the platform.',
  },
]

const benefits = [
  { icon: FiDollarSign, title: 'Competitive Salary', description: 'Top-of-market compensation with regular reviews and performance bonuses.' },
  { icon: FiHeart, title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage for you and your family.' },
  { icon: FiTrendingUp, title: 'Growth Opportunities', description: 'Dedicated learning budget, conferences, and career development programs.' },
  { icon: FiCoffee, title: 'Flexible Work', description: 'Remote-first culture with flexible hours. Work from anywhere in India.' },
  { icon: FiGift, title: 'Stock Options', description: 'Be an owner. Every full-time employee receives equity in the company.' },
  { icon: FiSmile, title: 'Wellness Programs', description: 'Mental health support, gym memberships, and wellness allowances.' },
  { icon: FiBook, title: 'Learning & Development', description: 'Annual learning budget, mentorship programs, and internal workshops.' },
  { icon: FiZap, title: 'Latest Tools', description: 'Access to cutting-edge tools and technologies to do your best work.' },
]

const values = [
  { icon: FiUsers, title: 'User First', description: 'Every decision starts with what is best for our users.' },
  { icon: FiStar, title: 'Quality Matters', description: 'We take pride in delivering exceptional experiences.' },
  { icon: FiZap, title: 'Move Fast', description: 'We iterate quickly and learn from every experiment.' },
  { icon: FiTarget, title: 'Own It', description: 'We take ownership and drive impact end-to-end.' },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#f3f2ed]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-white" />
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/80 border border-purple-200/50 text-purple-700 text-sm font-medium mb-6 backdrop-blur-sm">
                <FiUsers className="w-4 h-4" />
                Join the Team That&apos;s Transforming Recruitment
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Shape the Future of{' '}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Work with Us
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                At Staff Book, we are building the future of recruitment and professional networking.
                Join a team of passionate innovators dedicated to making a real impact in millions of careers.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link
                  href="#open-roles"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  View Open Roles
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#life-at-staffbook"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-gray-700 bg-white border border-gray-200 hover:border-purple-200 hover:shadow-lg hover:text-purple-700 transition-all duration-300"
                >
                  <FiPlay className="w-4 h-4" />
                  Life at Staff Book
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Join Staff Book?</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                We are building something special — and we want you to be part of it.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="bg-white border border-purple-100/50 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                    <v.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500">{v.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Life at Staff Book */}
      <section id="life-at-staffbook" className="py-16 sm:py-24 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                  <FiHeart className="w-3 h-3" />
                  Life at Staff Book
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  A Culture of{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Innovation, Growth, and Belonging
                  </span>
                </h2>
                <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed">
                  We believe that great products come from great teams. Our culture is built on trust, 
                  autonomy, and a shared passion for transforming how India hires.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    'Remote-first with flexible working hours',
                    'Flat hierarchy — your ideas matter, regardless of title',
                    'Regular team offsites and hackathons',
                    'Diverse and inclusive workplace',
                    'Open communication and radical transparency',
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
            </FadeUp>
            <FadeUp delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Perks &amp; Benefits</h3>
                  <div className="space-y-5">
                    {benefits.slice(0, 4).map((b, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                          <b.icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{b.title}</h4>
                          <p className="text-xs text-gray-500">{b.description}</p>
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

      {/* Benefits Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">All Benefits</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                We invest in our team because we know that happy, supported people do their best work.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div className="bg-white border border-purple-100/50 rounded-2xl p-5 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-3">
                    <b.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="py-16 sm:py-24 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiBriefcase className="w-3 h-3" />
                Open Roles
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Join Our Team</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                We are looking for talented individuals who want to make a difference. If you are passionate about building great products, we want to hear from you.
              </p>
            </div>
          </FadeUp>
          <div className="space-y-4">
            {openRoles.map((role, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div className="group bg-white border border-purple-100/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full">
                          {role.department}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 mb-3">{role.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" /> {role.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" /> {role.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiBriefcase className="w-3 h-3" /> {role.experience}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="mailto:info@staffbook.in?subject=Application for role"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-sm whitespace-nowrap flex-shrink-0"
                    >
                      Apply Now
                      <FiSend className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp>
            <div className="mt-12 text-center">
              <div className="bg-white border border-purple-100/50 rounded-2xl p-8">
                <FiStar className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Don&apos;t See Your Role?</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  We are always looking for great talent. Send us your resume and we will reach out when a suitable position opens up.
                </p>
                <Link
                  href="mailto:info@staffbook.in?subject=General Application"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 transition-all duration-300"
                >
                  Send General Application
                  <FiSend className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-8 sm:p-12 lg:p-16 text-center">
              <div className="absolute top-0 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <FiAward className="w-12 h-12 text-white/80 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Ready to Make an Impact?
                </h2>
                <p className="mt-4 text-lg text-purple-200 max-w-2xl mx-auto">
                  Join us in building the future of recruitment technology. Your dream role is waiting.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <Link
                    href="#open-roles"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-purple-700 bg-white hover:bg-purple-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    View Open Roles
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Learn About Us
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="w-[140px] mb-4">
                <Image src="/logo2.png" alt="Staff Book" width={180} height={60} className="object-contain brightness-0 invert opacity-90" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                India&apos;s First AI-Powered Recruitment Platform. Nearby Jobs, Live Chat with Recruiters &amp; Professional Networking.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: '/socials/facebook.svg', href: 'https://www.facebook.com/STAFFB00k.in', label: 'Facebook' },
                  { icon: '/socials/instagram.svg', href: 'https://www.instagram.com/staffbook.in/', label: 'Instagram' },
                  { icon: '/socials/linkedin.svg', href: 'https://www.linkedin.com/company/staffbook-dot-in/', label: 'LinkedIn' },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Image src={s.icon} alt={s.label} width={18} height={18} className="opacity-70" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Careers', href: '/careers' },
                  { label: 'Services', href: '/premium-services' },
                  { label: 'FAQs', href: '/faqs' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Policies</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Terms & Conditions', href: '/terms' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Branding Policy', href: '/branding-policy' },
                  { label: 'Fraud Alert', href: '/fraud-alert' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Email</span>
                  <a href="mailto:info@staffbook.in" className="text-sm text-gray-400 hover:text-white transition-colors">info@staffbook.in</a>
                </li>
                <li>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Phone</span>
                  <a href="tel:+919009222192" className="text-sm text-gray-400 hover:text-white transition-colors">+91 9009222192</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Staff Book. All Rights Reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-xs text-gray-500 hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-white transition-colors">Privacy</Link>
              <Link href="/location-policy" className="text-xs text-gray-500 hover:text-white transition-colors">Locations</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

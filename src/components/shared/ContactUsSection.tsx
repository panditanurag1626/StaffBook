'use client';

import Image from 'next/image';
import { SITE_CONFIG } from '../../constants/siteconfig';
import { THEME } from '@/styles/theme';
import Card from './Card';

export default function ContactUsSection() {
  const { contactUs } = SITE_CONFIG.services;
  
  return (
    <div className={`w-full ${THEME.colors.background.card} py-12 md:py-16`}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative w-full max-w-lg aspect-[4/3]">
              <Image
                src={contactUs.image}
                alt="Contact Us"
                fill
                className="rounded-2xl shadow-xl object-cover"
              />
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-[${THEME.colors.primaryLight}] rounded-full blur-3xl opacity-60 -z-10`} />
            </div>
          </div>
          
          {/* Right Form */}
          <div className="space-y-8 order-1 lg:order-2">
            <div>
              <h2 className={`${THEME.components.typography.sectionTitle} text-3xl mb-2`}>
                {contactUs.title}
              </h2>
              <p className={THEME.components.typography.body}>
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
            
            <Card className="p-6 md:p-8 shadow-lg border-gray-100">
              <form className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {contactUs.form.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={THEME.components.input.default}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {contactUs.form.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={THEME.components.input.default}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {contactUs.form.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className={THEME.components.input.default}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {contactUs.form.query}
                  </label>
                  <textarea
                    id="query"
                    rows={4}
                    className={THEME.components.input.default}
                    placeholder="Tell us about your query"
                  />
                </div>
                
                <button
                  type="submit"
                  className={`w-full ${THEME.components.button.primary} py-3.5 text-base font-semibold shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5`}
                >
                  {contactUs.form.button}
                </button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
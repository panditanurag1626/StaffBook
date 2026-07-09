'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import { THEME } from '@/styles/theme';
import Card from './Card';

export default function ResumeWritingSection() {
  const { resumeWriting } = SITE_CONFIG.services;
  
  return (
    <div className={`w-full ${THEME.colors.background.card} py-12 md:py-16`}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <Card className="bg-gradient-to-r from-[#f7f7fa] to-[#f0f0ff] border-none overflow-hidden" noPadding>
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div>
                  <h2 className={`${THEME.components.typography.sectionTitle} text-3xl mb-3`}>
                    {resumeWriting.title}
                  </h2>
                  <p className={`${THEME.components.typography.subheading} text-lg leading-relaxed`}>
                    {resumeWriting.subtitle}
                  </p>
                </div>
                
                {/* Features */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">What you'll get:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resumeWriting.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white/50 p-2 rounded-lg">
                        <div className={`p-1 rounded-full bg-green-100 text-green-600`}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-gray-700 text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price */}
                <div className="pt-2 flex items-center gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Starting at</p>
                    <p className={`text-3xl font-bold text-[${THEME.colors.primary}]`}>
                      {resumeWriting.price}
                    </p>
                  </div>
                  <button className={`${THEME.components.button.primary} px-8 py-3 shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-0.5`}>
                    Get Started
                  </button>
                </div>
              </div>
              
              {/* Right Image */}
              <div className="flex justify-center lg:justify-end relative">
                <div className="relative w-full max-w-md aspect-[4/3]">
                  <Image
                    src={resumeWriting.image}
                    alt="Resume Writing Service"
                    fill
                    className="rounded-2xl shadow-2xl object-cover"
                  />
                  {/* Decorative elements */}
                  <div className={`absolute -bottom-6 -left-6 w-24 h-24 bg-[${THEME.colors.primaryLight}] rounded-full blur-2xl opacity-50 -z-10`} />
                  <div className={`absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50 -z-10`} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
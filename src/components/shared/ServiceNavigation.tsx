'use client';

import { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../../constants/siteconfig';

interface ServiceNavigationProps {
  onSectionChange: (section: string) => void;
}

export default function ServiceNavigation({ onSectionChange }: ServiceNavigationProps) {
  const [activeSection, setActiveSection] = useState('recruiters');

  const sections = [
    { id: 'recruiters', label: 'Plans for Recruiters' },
    { id: 'jobseekers', label: 'Plans for Job Seekers' },
    { id: 'resume', label: 'Resume Writing' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    onSectionChange(sectionId);
    console.log(sectionId,"SectionId");
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Intersection Observer to update active section based on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-100px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          console.log(sectionId,"SectionId");
          setActiveSection(sectionId);
        }
      });
    }, observerOptions);

    // Observe all sections
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed mt-16 z-10 w-full bg-gray-50">
      <div className="w-full max-w-7xl  mx-auto px-4 md:px-6">
        <div className="flex gap-2 md:gap-4 py-3  items-center justify-center md:py-4 overflow-x-auto hide-scrollbar">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={`
                flex-shrink-0 px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-semibold transition-all duration-200 whitespace-nowrap
                ${activeSection === section.id
                  ? 'bg-gradient-to-r from-primary to-gradient-end text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {section.label}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
} 
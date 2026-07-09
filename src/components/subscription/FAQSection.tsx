'use client';

import React, { memo, useState, useCallback } from 'react';
import { FiChevronRight, FiChevronDown, FiHelpCircle } from 'react-icons/fi';
import type { FAQItem } from '@/types/subscription';
import Card from '../shared/Card';
import { THEME } from '@/styles/theme';

interface FAQSectionProps {
  faqs: readonly FAQItem[];
  subheading?: string;
}

interface FAQAccordionItemProps {
  faq: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

const FAQAccordionItem = memo<FAQAccordionItemProps>(({ faq, index, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => onToggle(index)}
        className={`w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl p-4 transition-colors duration-200 ${isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
          }`}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className={`${THEME.components.typography.subheading} text-base font-semibold text-gray-900`}>
            {faq.question}
          </h3>
          <div className={`flex-shrink-0 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <FiChevronDown size={20} aria-hidden="true" />
          </div>
        </div>
      </button>

      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed text-justify">
            {faq.answer}
          </div>
        </div>
      </div>
    </div>
  );
});

FAQAccordionItem.displayName = 'FAQAccordionItem';

export const FAQSection = memo<FAQSectionProps>(({ faqs, subheading = "Everything you need to know about our premium plans" }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  }, []);

  return (
    <Card
      className="mb-16"
      aria-labelledby="faq-title"
    >
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 ${THEME.components.icon.primary} mb-4`}>
          <FiHelpCircle size={24} />
        </div>
        <h2
          id="faq-title"
          className={`${THEME.components.typography.sectionTitle} text-2xl`}
        >
          Frequently Asked Questions
        </h2>
        <p className={`${THEME.components.typography.body} mt-2`}>
          {subheading}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <FAQAccordionItem
            key={`faq-${index}`}
            faq={faq}
            index={index}
            isOpen={openIndex === index}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </Card>
  );
});

FAQSection.displayName = 'FAQSection';

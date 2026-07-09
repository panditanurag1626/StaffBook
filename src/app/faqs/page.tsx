'use client';

import React, { useEffect, useState } from 'react';
import { FAQSection } from '@/components/subscription/FAQSection';
import { FAQItem } from '@/types/subscription';

import { commonService } from '@/lib/api/services';
import toast from 'react-hot-toast';

const FAQsPage = () => {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setIsLoading(true);
                const response = await commonService.getFaqs();
                if (response?.data?.faq?.items) {
                    setFaqs(response.data.faq.items);
                } else if (Array.isArray(response?.data)) {
                    setFaqs(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch FAQs:', error);
                toast.error('Failed to load FAQs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 py-20">
            <FAQSection faqs={faqs} subheading="Everything you need to know about Staffbook" />
        </div>
    );
};

export default FAQsPage;
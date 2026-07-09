import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { THEME } from '@/styles/theme';
import { useAuth } from '@/context/AuthContext';

interface SlimBannerProps {
    className?: string;
}

const SlimBanner: React.FC<SlimBannerProps> = ({ className = '' }) => {
    const { isEmployer } = useAuth();

    return (
        <div className={`w-full mt-10 mb-8 ${className}`}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 md:px-10 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-white text-xl md:text-2xl font-black tracking-tight mb-1">
                        {!isEmployer ? "Unlock better opportunities with Premium" : "Grow your team faster with the Enterprise Plan"}
                    </h3>
                    <p className="text-white/80 text-sm font-medium">
                        {!isEmployer ? "Unlock advanced filter, increase profile visibility, and direct messaging with employers" : "Unlock advanced filters, unlimited resume downloads, and direct messaging to top candidates."}
                    </p>
                </div>

                <Link href="/premium-services" className="relative z-10 flex-shrink-0 bg-white text-purple-600 font-black px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 group">
                    Get Started
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default SlimBanner;

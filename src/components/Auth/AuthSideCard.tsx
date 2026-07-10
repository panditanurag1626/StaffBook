'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { THEME } from '../../styles/theme';

interface AuthSideCardProps {
    topButtonText?: string;
    topButtonLink?: string;
}

const testimonials = [
    {
        name: "Priyanka Sharma",
        role: "Senior Accountant",
        type: "Job Seeker",
        text: "I found several relevant jobs within 2 km of my home. StaffBook helped me choose a role without compromising on work-life balance.",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop"
    },
    {
        name: "Rohit Verma",
        role: "Frontend Developer",
        type: "Job Seeker",
        text: "Direct recruiter connectivity and online status visibility made job searching faster and more transparent.",
        image: "https://images.unsplash.com/photo-1605553100650-a88941763131?q=80&w=1000&auto=format&fit=crop"
    },
    {
        name: "Rajeev Mehta",
        role: "HR Head, Visom6 Technology Pvt Ltd",
        type: "Employer",
        text: "Bulk hiring, smart shortlisting, and instant interview scheduling helped us fill positions significantly faster.",
        image: "https://images.unsplash.com/photo-1579564177264-a6a3b6807ebc?q=80&w=1000&auto=format&fit=crop"
    },
    {
        name: "Ankit Jain",
        role: "Founder, Code Krafters",
        type: "Employer",
        text: "Candidate reels, stories, and professional activity gave us deeper insights than a traditional resume ever could.",
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1000&auto=format&fit=crop"
    },
    {
        name: "Vikram Agrawal",
        role: "Director – Strategy & Growth",
        type: "Employer",
        text: "For CXO hiring, StaffBook's professional history and behavioral visibility helped us make more informed leadership decisions.",
        image: "https://images.unsplash.com/photo-1566492031516-f3e43276d126?q=80&w=1000&auto=format&fit=crop"
    }
];

const AuthSideCard: React.FC<AuthSideCardProps> = ({ topButtonText, topButtonLink }) => {
    const showTopButton = topButtonText && topButtonLink;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-slider effect
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isPaused]);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div
            className={`relative w-full h-full min-h-[560px] rounded-[40px] p-10 text-white flex flex-col overflow-hidden group/card`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 z-0">
                {testimonials.map((item, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-gradient-end/90 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-gradient-end/80" />
                    </div>
                ))}
            </div>

            {/* Top Button */}
            {showTopButton && (
                <div className="absolute top-8 right-8 z-10">
                    <Link href={topButtonLink!} className="bg-white text-primary px-6 py-2 rounded-full font-semibold text-base hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 shadow-sm">
                        {topButtonText}
                    </Link>
                </div>
            )}

            {/* Content */}
            <div className="mt-0 max-w-lg relative z-10">
                <h2 className="text-2xl font-bold mb-4 leading-tight drop-shadow-md">What Our Users Said.</h2>
                <div className="relative mb-3 min-h-[80px]">
                    <span className="absolute -left-5 -top-2 text-3xl opacity-50">❝</span>
                    <p className="text-base opacity-95 leading-relaxed transition-opacity duration-300 drop-shadow-sm font-medium">
                        {testimonials[currentIndex].text}
                    </p>
                </div>

                <div className="mb-3">
                    <p className="font-bold text-xl drop-shadow-sm">{testimonials[currentIndex].name}</p>
                    <p className="opacity-90 text-base font-medium drop-shadow-sm">{testimonials[currentIndex].role}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {testimonials[currentIndex].type}
                    </span>
                </div>

                <div className="flex gap-3 items-center">
                    <button
                        onClick={prevTestimonial}
                        className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white hover:text-primary transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        onClick={nextTestimonial}
                        className="w-10 h-10 flex items-center justify-center bg-[#333333] text-white rounded-xl hover:bg-black transition-colors shadow-lg"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* Bottom Floating Card */}
            <div className={`absolute bottom-4 right-8 bg-white text-black p-5 ${THEME.components.card.radius} max-w-xs shadow-xl z-20 group`}>
                {/* Star Icon Badge */}
                <div className="absolute -top-6 right-6 bg-white p-1.5 rounded-full shadow-sm">
                    <div className="bg-black text-white p-2 rounded-full">
                        <Star size={16} fill="white" />
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-2 leading-tight">Join thousands finding their right opportunity</h3>
                <p className="text-xs text-gray-500 mb-3">
                    StaffBook connects job seekers and recruiters through AI-powered matching and real-time chat.
                </p>
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden transition-transform duration-300 hover:scale-150 hover:z-10 cursor-pointer">
                            <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center border-2 border-white transition-transform duration-300 hover:scale-150 hover:z-10 cursor-pointer">
                        +2
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthSideCard;

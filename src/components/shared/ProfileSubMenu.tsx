"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  key: string;
}

interface ProfileSubMenuProps {
  menuItems: MenuItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  queryParam?: string;
  variant?: 'primary' | 'secondary';
}

import { THEME } from "@/styles/theme";

export default function ProfileSubMenu({
  menuItems,
  activeTab,
  onTabChange,
  queryParam = 'tab',
  variant = 'primary',
}: ProfileSubMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const handleTabChange = (key: string) => {
    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set(queryParam, key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Also call the original onTabChange callback
    onTabChange(key);
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 10);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [menuItems]);

  const containerClasses = variant === 'primary' 
    ? `w-full bg-transparent py-0 md:py-2 relative mb-6 mt-0 md:mt-10 sticky top-[55px] md:top-[70px] z-40 transition-all duration-300`
    : `w-full bg-transparent py-0 md:py-1 relative mb-4 mt-0 md:mt-4 z-30 transition-all duration-300`; // Secondary: less margin, not sticky

  return (
    <section
      className={containerClasses}
    >
      <div className="w-full md:max-w-[95%] mx-auto relative px-0">
        {/* Left Scroll Button */}
        {showLeftButton && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all md:hidden"
          >
            <FiChevronLeft size={20} />
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightButton && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all md:hidden"
          >
            <FiChevronRight size={20} />
          </button>
        )}

        {/* Floating Menu */}
        <div 
          ref={scrollContainerRef}
          className={`
          relative md:absolute md:top-[-46px] md:left-1/2 md:-translate-x-1/2 
          w-full md:w-fit md:max-w-[95%] mx-auto
          h-auto py-2 md:py-0 md:h-[80px] 
          ${THEME.components.glass}
          border border-gray-100 md:border-none
          rounded-2xl md:rounded-full shadow-lg md:shadow-2xl md:ring-1 md:ring-black/5
          flex items-center justify-start md:justify-around 
          px-2 md:px-8 z-10 
          overflow-x-auto scrollbar-hide snap-x snap-mandatory
          gap-1 md:gap-0 
          transition-all duration-300
          [-webkit-overflow-scrolling:touch]
          [scroll-behavior:smooth]
        `}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <div
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`
                  group flex md:flex-col flex-row items-center justify-center gap-2 md:gap-0
                  text-xs md:text-sm font-medium
                  min-w-fit md:min-w-[80px] 
                  px-3 py-2 md:px-4 md:py-0
                  h-auto md:h-[60px] 
                  cursor-pointer transition-all duration-300 
                  rounded-full md:rounded-2xl 
                  snap-center
                  flex-shrink-0
                  ${
                  isActive
                    ? "text-[#18192B] shadow-sm md:shadow-md md:scale-105"
                    : "text-gray-500 hover:text-primary hover:bg-gray-50"
                }
                `}
                style={isActive ? { background: `linear-gradient(to right, ${THEME.colors.gradient.start}, ${THEME.colors.gradient.end})` } : {}}
              >
                <span
                  className={`block w-4 h-4 md:w-5 md:h-5 md:mb-1 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-[#18192B]" : "text-gray-400 group-hover:text-primary"
                  }`}
                >
                  {item.icon}
                </span>     
                <span
                  className={`whitespace-nowrap font-medium transition-all duration-300 ${
                    isActive ? "text-[#18192B]" : "group-hover:text-primary"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

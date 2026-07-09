import React, { useRef, useState, useEffect } from 'react';
import { FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ReelCard from './ReelCard';
import { Reel } from '../../../data/networking';
import { SITE_CONFIG } from '../../../constants/siteconfig';

const ReelsWidget: React.FC<{ reels: Reel[] }> = ({ reels }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // buffer of 10px
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [reels]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900">{SITE_CONFIG.networking.reels.title}</h3>
        <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-300 transition-colors">
          <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">{SITE_CONFIG.networking.reels.refresh}</span>
        </button>
      </div>
      
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-600 cursor-pointer" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <FiChevronRight className="w-5 h-5 text-gray-600 cursor-pointer" />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide [mask-image:linear-gradient(to_right,transparent,black_10px,black_calc(100%_-_10px),transparent)] px-1"
        >
          {reels.map((reel) => (
            <div key={reel.id} className="flex-shrink-0">
              <ReelCard reel={reel} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReelsWidget;

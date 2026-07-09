'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { bannerService, Banner } from '@/lib/api/services/bannerService';


export default function SponsoredBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await bannerService.getBanners();

        // Handle various response structures for robust data extraction
        let bannerItems: Banner[] = [];

        if (response && response.data) {
          // Structure 1: response.data.banners.items (as per recent change)
          if (response.data.banners && Array.isArray(response.data.banners)) {
            bannerItems = response.data.banners;
          }
          // Structure 2: response.data.items (standard pattern)
          else if (Array.isArray((response.data as any))) {
            bannerItems = (response.data as any);
          }
        }

        // Filter for active banners (status 10)
        const activeBanners = bannerItems.filter(b => b.status === 10);
        setBanners(activeBanners);
      } catch (err) {
        console.error('Failed to fetch banners for networking feed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (isLoading || banners.length === 0) return null;

  return (
    <div className="my-6 py-6 px-2 md:px-4 bg-gradient-to-b from-indigo-50/50 to-purple-50/30 rounded-3xl border border-indigo-100/50 shadow-sm">
      <div className="flex flex-col gap-8 relative">
        <div className="w-full text-left py-4 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 leading-tight">
            Premium Employers
          </h4>
        </div>

        <div className="w-full relative flex flex-col gap-10 px-2 md:px-4 pb-20">
          {banners.map((banner, bIdx) => (
            <div 
              key={`${banner.id}-${bIdx}`}
              className="sticky w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 bg-black group transition-all duration-500 ease-out hover:shadow-purple-500/20"
              style={{ 
                top: `calc(160px + ${bIdx * 24}px)`,
                zIndex: bIdx + 10,
                height: '350px' 
              }}
            >
              <Link
                href={banner.target_url || '#'}
                className="block w-full h-full relative"
                target="_blank"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-10">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 mb-2 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-purple-200 bg-purple-900/60 backdrop-blur-md rounded-full border border-purple-500/30">
                      Premium Employers
                    </span>
                    <h5 className="text-white font-semibold text-base drop-shadow-md">{banner.title}</h5>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

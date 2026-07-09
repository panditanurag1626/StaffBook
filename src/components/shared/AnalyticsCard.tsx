'use client';

import React from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  hasNewData?: boolean;
  onClick?: () => void;
}

export default function AnalyticsCard({ title, value, icon, hasNewData, onClick }: AnalyticsCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 flex flex-col gap-2.5 hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer group h-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 transition-colors group-hover:bg-purple-100 [&>svg]:w-4 [&>svg]:h-4">
              {icon}
            </div>
          )}
          <span className="text-gray-700 font-semibold text-[13px] leading-snug line-clamp-2">
            {title}
          </span>
        </div>
        {hasNewData && (
          <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full shrink-0 ml-1">
            New
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-extrabold text-purple-600 leading-none">
          {value ?? 0}
        </span>
      </div>
    </div>
  );
}

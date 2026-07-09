import React from 'react';

import { THEME } from '@/styles/theme';

const ChevronRightGradient = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="chevron-gradient" x1="0" y1="24" x2="48" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor={THEME.colors.gradient.start} />
        <stop offset="1" stopColor={THEME.colors.gradient.end} />
      </linearGradient>
    </defs>
    <path d="M16 12L32 24L16 36" stroke="url(#chevron-gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ChevronRightGradient; 
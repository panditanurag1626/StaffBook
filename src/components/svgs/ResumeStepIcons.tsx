import React from 'react';

import { THEME } from '@/styles/theme';

export const TemplateIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="40" height="40" rx="8" fill="#fff" stroke="url(#paint0_linear)" strokeWidth="3"/>
    <rect x="16" y="16" width="8" height="8" rx="2" fill={THEME.colors.gradient.start}/>
    <rect x="32" y="16" width="8" height="8" rx="2" fill={THEME.colors.gradient.start}/>
    <rect x="16" y="32" width="8" height="8" rx="2" fill={THEME.colors.gradient.start}/>
    <rect x="32" y="32" width="8" height="8" rx="2" fill={THEME.colors.gradient.start}/>
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor={THEME.colors.gradient.start}/>
        <stop offset="1" stopColor={THEME.colors.gradient.end}/>
      </linearGradient>
    </defs>
  </svg>
);

export const InfoIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="40" height="40" rx="8" fill="#fff" stroke="url(#paint1_linear)" strokeWidth="3"/>
    <circle cx="28" cy="24" r="6" fill={THEME.colors.gradient.start}/>
    <rect x="18" y="34" width="20" height="6" rx="3" fill={THEME.colors.gradient.start}/>
    <defs>
      <linearGradient id="paint1_linear" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor={THEME.colors.gradient.start}/>
        <stop offset="1" stopColor={THEME.colors.gradient.end}/>
      </linearGradient>
    </defs>
  </svg>
);

export const SuggestionIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="40" height="40" rx="8" fill="#fff" stroke="url(#paint2_linear)" strokeWidth="3"/>
    <path d="M28 18v12" stroke={THEME.colors.gradient.start} strokeWidth="3" strokeLinecap="round"/>
    <circle cx="28" cy="36" r="3" fill={THEME.colors.gradient.start}/>
    <defs>
      <linearGradient id="paint2_linear" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor={THEME.colors.gradient.start}/>
        <stop offset="1" stopColor={THEME.colors.gradient.end}/>
      </linearGradient>
    </defs>
  </svg>
);

export const DownloadIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="40" height="40" rx="8" fill="#fff" stroke="url(#paint3_linear)" strokeWidth="3"/>
    <path d="M28 18v14M28 32l-4-4m4 4l4-4" stroke={THEME.colors.gradient.start} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="paint3_linear" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor={THEME.colors.gradient.start}/>
        <stop offset="1" stopColor={THEME.colors.gradient.end}/>
      </linearGradient>
    </defs>
  </svg>
); 
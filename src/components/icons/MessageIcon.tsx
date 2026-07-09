import React from 'react';

interface MessageIconProps {
  size?: number;
  className?: string;
}

export default function MessageIcon({ size = 24, className = '' }: MessageIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M24.0013 11.9993H26.668C27.3752 11.9993 28.0535 12.2803 28.5536 12.7804C29.0537 13.2805 29.3346 13.9588 29.3346 14.666V29.3327L24.0013 23.9993H16.0013C15.2941 23.9993 14.6158 23.7184 14.1157 23.2183C13.6156 22.7182 13.3346 22.0399 13.3346 21.3327V19.9993M18.668 11.9993C18.668 12.7066 18.387 13.3849 17.8869 13.885C17.3868 14.3851 16.7085 14.666 16.0013 14.666H8.0013L2.66797 19.9993V5.33268C2.66797 4.62544 2.94892 3.94716 3.44902 3.44706C3.94911 2.94697 4.62739 2.66602 5.33464 2.66602H16.0013C16.7085 2.66602 17.3868 2.94697 17.8869 3.44706C18.387 3.94716 18.668 4.62544 18.668 5.33268V11.9993Z" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

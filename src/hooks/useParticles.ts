'use client';

import { useEffect } from 'react';

export function useParticles() {
  useEffect(() => {
    // Optional: Add dynamic particle creation
    const container = document.querySelector('.particles-bg');
    if (!container) return;

    // You can add more particles dynamically here if needed
    
  }, []);
}

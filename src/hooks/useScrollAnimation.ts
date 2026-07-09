'use client';

import { useEffect, RefObject } from 'react';

export function useScrollAnimation(refs: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    refs.forEach((ref) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [refs]);
}

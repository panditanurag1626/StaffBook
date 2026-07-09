'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// List of protected route prefixes
const PROTECTED_ROUTES = [
  '/networking',
  '/profile',      // Covers /profile/jobs, /profile/insights, etc.
  '/job-market',   // Some job market routes might be protected
  '/connections',
  '/myconnection',
  '/services',
  '/service'
];

export default function RouteGuard() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth verification to complete
    if (!isInitialized) return;

    // If no user is logged in
    if (!user) {
      // Check if current path starts with any protected route
      const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

      if (isProtected) {
        router.push('/');
      }
    }
  }, [user, isInitialized, pathname, router]);

  // This component doesn't render anything visible
  return null;
}

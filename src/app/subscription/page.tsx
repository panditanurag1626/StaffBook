'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SubscriptionRedirect() {
  const router = useRouter();
  const { isEmployer } = useAuth();

  useEffect(() => {
    const tab = isEmployer ? 'recruiters' : 'jobseekers';
    router.replace(`/premium-services?tab=${tab}`);
  }, [router, isEmployer]);

  return null;
}

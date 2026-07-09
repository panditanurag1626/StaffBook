import React, { Suspense } from 'react';
import ProfileLayout from '@/components/shared/ProfileLayout';
import ConnectionsLayout from '@/components/Connections/ConnectionsLayout';

export default function ConnectionsPage() {
  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <Suspense fallback={<div className="p-10 text-center">Loading connections...</div>}>
        <ConnectionsLayout />
      </Suspense>
    </ProfileLayout>
  );
}

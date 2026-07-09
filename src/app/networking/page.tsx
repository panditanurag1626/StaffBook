import React from 'react';
import ProfileLayout from '../../components/shared/ProfileLayout';
import NetworkingLayout from '../../components/Networking/NetworkingLayout';

export default function Page() {
  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <NetworkingLayout />
    </ProfileLayout>
  );
}


import React from 'react';
import ProfileLayout from '../../components/shared/ProfileLayout';
import SavedJobs from '../../components/SavedJobs/SavedJobs';

export default function Page() {
  return (
    <ProfileLayout showSidebar={true} showStories={true}>
      <SavedJobs />
    </ProfileLayout>
  );
}


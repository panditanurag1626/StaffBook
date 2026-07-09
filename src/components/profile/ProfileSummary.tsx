'use client'
import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import ProfileSummaryModal from './ProfileSummaryModal';
import { THEME } from '../../styles/theme';
import Button from '../shared/Button';
import type { UserProfile } from '@/lib/api/types';

interface ProfileSummaryProps {
  profileData?: UserProfile | null;
  readOnly?: boolean;
}

export default function ProfileSummary({ profileData, readOnly = false }: ProfileSummaryProps) {
  const [summary, setSummary] = useState(profileData?.bio);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (profileData?.bio !== undefined) {
      setSummary(profileData.bio);
    }
  }, [profileData?.bio]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { sectionId } = (e as CustomEvent).detail;
      if (sectionId === 'professional-summary') {
        setIsModalOpen(true);
      }
    };
    window.addEventListener('profile:open-modal', handler);
    return () => window.removeEventListener('profile:open-modal', handler);
  }, []);

  const handleEdit = () => setIsModalOpen(true);

  return (
    <div id="professional-summary" className={`${THEME.components.card.default} flex flex-col gap-4 relative`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className={THEME.components.typography.sectionTitle}>{SITE_CONFIG.profileSummary.section}</h2>
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
            onClick={handleEdit}
            aria-label="Edit Profile Summary"
          >
            <Edit2 size={16} />
          </Button>
        )}
      </div>
      <p className={`${THEME.components.typography.body} leading-relaxed`}>
        {summary?.length ? summary : "Summary Not Added"}
      </p>
      <ProfileSummaryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={summary ?? ""}
      />
    </div>
  );
}
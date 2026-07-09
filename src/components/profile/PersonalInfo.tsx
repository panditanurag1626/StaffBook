'use client';
import React from 'react';
import { Edit2 } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import { THEME } from '../../styles/theme';
import Button from '../shared/Button';
import type { UserProfile } from '@/lib/api/types';

interface PersonalInfoProps {
  profileData?: UserProfile | null;
}

export default function PersonalInfo({ profileData }: PersonalInfoProps) {
  // Helper to format values
  const getValue = (val: any) => {
    if (val === null || val === undefined || val === '') return "Not available";
    return val;
  };

  const displayInfo = {
    gender: getValue(profileData?.sex),
    maritalStatus: getValue((profileData as any)?.marital_status),
    dob: getValue(profileData?.dob),
    category: getValue((profileData as any)?.category),
    workPermit: getValue((profileData as any)?.work_permit),
    languages: (profileData as any)?.languages
      ? (Array.isArray((profileData as any).languages)
        ? (profileData as any).languages.join(', ')
        : (profileData as any).languages)
      : "Not available",
    address: getValue(profileData?.location || [profileData?.city, profileData?.state, profileData?.country].filter(Boolean).join(', '))
  };

  return (
    <div className={`${THEME.components.card.default} flex flex-col gap-4 relative`}>
      <h2 className={`${THEME.components.typography.sectionTitle} mb-4`}>{SITE_CONFIG.personalInfo.section}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className={`${THEME.components.typography.meta} font-medium mb-1`}>{SITE_CONFIG.personalInfo.gender}</div>
          <div className={`${THEME.components.typography.cardTitle} text-sm mb-2`}>{displayInfo.gender}</div>
        </div>

        <div>
          <div className={`${THEME.components.typography.meta} font-medium mb-1`}>{SITE_CONFIG.personalInfo.dob}</div>
          <div className={`${THEME.components.typography.cardTitle} text-sm mb-2`}>{displayInfo.dob}</div>
        </div>
        <div>
          <div className={`${THEME.components.typography.meta} font-medium mb-1`}>{SITE_CONFIG.personalInfo.category}</div>
          <div className={`${THEME.components.typography.cardTitle} text-sm mb-2`}>{displayInfo.category}</div>
        </div>
        <div>
          <div className={`${THEME.components.typography.meta} font-medium mb-1`}>{SITE_CONFIG.personalInfo.workPermit}</div>
          <div className={`${THEME.components.typography.cardTitle} text-sm mb-2`}>{displayInfo.workPermit}</div>
        </div>
        <div>
          <div className={`${THEME.components.typography.meta} font-medium mb-1`}>{SITE_CONFIG.personalInfo.languages}</div>
          <div className={`${THEME.components.typography.cardTitle} text-sm mb-2`}>{displayInfo.languages}</div>
        </div>
        <div className="md:col-span-2">
          <div className={`${THEME.components.typography.meta} font-medium mb-1`}>{SITE_CONFIG.personalInfo.address}</div>
          <div className={`${THEME.components.typography.cardTitle} text-sm mb-2`}>{displayInfo.address}</div>
        </div>
      </div>
      {/* <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          className="px-6 text-xs !text-purple-700 !border-purple-200 hover:!bg-purple-50 rounded-full"
        >
          {SITE_CONFIG.personalInfo.addMore}
        </Button>
      </div> */}
    </div>
  );
} 
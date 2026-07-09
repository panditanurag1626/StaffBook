import React, { useEffect, useState } from 'react';
import { FiXCircle, FiArrowRight } from 'react-icons/fi';
import { userService } from '../../lib/api/services/userService';
import { THEME } from '../../styles/theme';

const FIELD_MAP: Record<string, { id: string; label: string }> = {
  work_experience: { id: 'work-experience', label: 'Work Experience' },
  experience: { id: 'work-experience', label: 'Work Experience' },
  education: { id: 'education', label: 'Academic Background' },
  academic_background: { id: 'education', label: 'Academic Background' },
  projects: { id: 'projects', label: 'Projects' },
  certifications: { id: 'certifications', label: 'Certifications' },
  resume: { id: 'resume', label: 'Resume' },
  portfolio: { id: 'portfolio', label: 'Portfolio' },
  media: { id: 'portfolio', label: 'Portfolio' },
  professional_summary: { id: 'professional-summary', label: 'Professional Summary' },
  summary: { id: 'professional-summary', label: 'Professional Summary' },
  bio: { id: 'professional-summary', label: 'Professional Summary' },
  personal_information: { id: 'personal-information', label: 'Personal Information' },
  personal_info: { id: 'personal-information', label: 'Personal Information' },
  basic_details: { id: 'personal-information', label: 'Personal Information' },
  career_preferences: { id: 'career-preferences', label: 'Career Preferences' },
  skills: { id: 'skills', label: 'Skills' },
};

const ProfilePerformance: React.FC = () => {
  const [data, setData] = useState<{
    percentage: number;
    missingFields: string[];
  } | null>(null);

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const response = await userService.getProfileCompletionSuggestions();
        const resData = response.data?.data || response.data;
        if (resData) {
          setData({
            percentage: resData.completion_percentage || 0,
            missingFields: resData.missing_fields || []
          });
        }
      } catch (error) {
        console.error('Error fetching profile completion:', error);
      }
    };
    fetchCompletion();
  }, []);

  const openSectionModal = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('profile:open-modal', { detail: { sectionId: id } }));
      }, 400);
    }
  };

  if (!data) return (
    <div className={`${THEME.components.card.default} flex flex-col gap-2 animate-pulse`}>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="flex justify-between mb-2">
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-10"></div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );

  const missingCount = data.missingFields.length;

  return (
    <div className={`${THEME.components.card.default} flex flex-col gap-2`}>
      <div className={`${THEME.components.typography.cardTitle} mb-1`}>Profile Strength</div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-base font-bold text-gray-900">{data.percentage}% Complete</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
        <div
          className="h-2 bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${data.percentage}%` }}
        />
      </div>
      {data.percentage < 100 && (
        <div className={`${THEME.components.typography.meta} mt-1`}>
          Complete {missingCount} more field{missingCount > 1 ? 's' : ''} to reach 100%
        </div>
      )}
      {data.percentage === 100 && (
        <div className={`${THEME.components.typography.meta} mt-1`}>
          Your profile is fully complete!
        </div>
      )}
      {missingCount > 0 && (
        <div className="flex flex-col gap-1.5 mt-2">
          {data.missingFields.map((field, idx) => {
            const mapped = FIELD_MAP[field.toLowerCase()] || null;
            return (
              <button
                key={idx}
                onClick={() => mapped && openSectionModal(mapped.id)}
                disabled={!mapped}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  mapped
                    ? 'bg-red-50 hover:bg-red-100 cursor-pointer text-gray-700 hover:text-gray-900'
                    : 'bg-gray-50 text-gray-400 cursor-default'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiXCircle className={mapped ? 'text-red-400 shrink-0' : 'text-gray-300 shrink-0'} size={16} />
                  <span className="text-left capitalize">{mapped ? mapped.label : field.replace(/_/g, ' ')}</span>
                </span>
                {mapped && (
                  <span className="flex items-center gap-1 text-purple-600 font-medium text-xs group">
                    Add now
                    <FiArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfilePerformance;

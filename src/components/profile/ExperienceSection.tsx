'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Calendar, MapPin, Building2, Trash2 } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import type { Experience } from '../../types/profile';
import type { Experience as APIExperience } from '@/lib/api/types';
import ExperienceModal from './ExperienceModal';
import { THEME } from '../../styles/theme';
import Button from '../shared/Button';
import { experienceService } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '../shared/ConfirmModal';

const defaultExperience: Experience = {
  companyLogo: '',
  role: '',
  company: '',
  location: '',
  employmentType: '',
  isCurrent: false,
  joiningYear: '',
  joiningMonth: '',
  leavingYear: '',
  leavingMonth: '',
  description: '',
  achievements: [''],
  skills: [],
};

interface ExperienceSectionProps {
  readOnly?: boolean;
  experiences?: APIExperience[];
}

export default function ExperienceSection({ readOnly = false, experiences: apiExperiences = [] }: ExperienceSectionProps) {
  // Convert API experiences to local format
  const convertedExperiences: Experience[] = apiExperiences.map(exp => ({
    companyLogo: exp.company_logo_url || exp.company_logo || '',
    role: exp.title,
    company: exp.company_name,
    location: exp.location,
    employmentType: exp.employment_type,
    isCurrent: exp.current_working === 1,
    joiningYear: exp.start_date,
    joiningMonth: '',
    leavingYear: exp.end_date || '',
    leavingMonth: '',
    description: exp.description,
    achievements: exp.achievements ? (typeof exp.achievements === 'string' ? JSON.parse(exp.achievements) : exp.achievements).map((a: any) => typeof a === 'object' && a !== null ? a.achievement || '' : a) : [],
    skills: exp.skills ? (typeof exp.skills === 'string' ? JSON.parse(exp.skills) : exp.skills).map((s: any) => typeof s === 'object' && s !== null ? s.skill_name || s.name || '' : s) : [],
  }));

  const [experiences, setExperiences] = useState<Experience[]>(convertedExperiences);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handler = (e: Event) => {
      const { sectionId } = (e as CustomEvent).detail;
      if (sectionId === 'work-experience') {
        setEditingIndex(null);
        setModalOpen(true);
      }
    };
    window.addEventListener('profile:open-modal', handler);
    return () => window.removeEventListener('profile:open-modal', handler);
  }, []);

  React.useEffect(() => {
    setExperiences(apiExperiences.map(exp => ({
      companyLogo: exp.company_logo_url || exp.company_logo || '',
      role: exp.title,
      company: exp.company_name,
      location: exp.location,
      employmentType: exp.employment_type,
      isCurrent: exp.current_working === 1,
      joiningYear: exp.start_date,
      joiningMonth: '',
      leavingYear: exp.end_date || '',
      leavingMonth: '',
      description: exp.description,
      achievements: exp.achievements ? (typeof exp.achievements === 'string' ? JSON.parse(exp.achievements) : exp.achievements).map((a: any) => typeof a === 'object' && a !== null ? a.achievement || '' : a) : [],
      skills: exp.skills ? (typeof exp.skills === 'string' ? JSON.parse(exp.skills) : exp.skills).map((s: any) => typeof s === 'object' && s !== null ? s.skill_name || s.name || '' : s) : [],
    })));
  }, [apiExperiences]);

  const handleAdd = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setModalOpen(true);
  };

  const handleSave = async (exp: Experience) => {
    try {
      if (editingIndex === null) {
        // Add new experience
        const apiData = {
          title: exp.role,
          employment_type: exp.employmentType,
          company_name: exp.company,
          location: exp.location,
          location_type: 'On-site', // Default
          start_date: exp.joiningYear, // Assuming format YYYY-MM-DD or similar
          end_date: exp.isCurrent ? null : (exp.leavingYear || null),
          industry: 'Technology', // Default
          description: exp.description,
          profile_headline: exp.role, // Default
          current_working: exp.isCurrent ? 1 : 0,
          skills: exp.skills,
          achievements: exp.achievements,
          company_logo: exp.companyLogoFile
        };

        await experienceService.addExperience(apiData);
        // Ideally we should reload profile or append returned data. 
        // For now, updating local state to reflect change immediately (optimistic or simple)
        setExperiences([...experiences, exp]);
      } else {
        // Update experience
        // We need the ID. The mapped experiences lost the ID in the initial map.
        // We must preserve ID in convertedExperiences.
        const originalExp = apiExperiences[editingIndex];
        if (!originalExp) return;

        const apiData = {
          id: originalExp.id,
          title: exp.role,
          employment_type: exp.employmentType,
          company_name: exp.company,
          location: exp.location,
          location_type: originalExp.location_type || 'On-site',
          start_date: exp.joiningYear,
          end_date: exp.isCurrent ? null : (exp.leavingYear || null),
          industry: originalExp.industry || 'Technology',
          description: exp.description,
          profile_headline: originalExp.profile_headline || exp.role,
          current_working: exp.isCurrent ? 1 : 0,
          skills: exp.skills,
          achievements: exp.achievements,
          company_logo: exp.companyLogoFile
        };

        await experienceService.updateExperience(apiData);
        setExperiences(experiences.map((e, i) => (i === editingIndex ? exp : e)));
      }
      await refreshUser(); // Fetch updated profile data
      setModalOpen(false); // Close Modal on success
      toast.success('Experience saved successfully!');
    } catch (error) {
      console.error('Failed to save experience:', error);
      toast.error('Failed to save experience. Please try again.');
      throw error; // This prevents the modal from closing!
    }
  };

  const handleDeleteClick = (index?: number) => {
    const targetIndex = index !== undefined ? index : editingIndex;
    if (targetIndex !== null && targetIndex !== undefined) {
      setDeleteConfirmIndex(targetIndex);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmIndex !== null) {
      const originalExp = apiExperiences[deleteConfirmIndex];
      if (originalExp) {
        setIsDeleting(true);
        try {
          await experienceService.deleteExperience(originalExp.id);
          await refreshUser(); // Resync profile data globally
          setModalOpen(false);
          setDeleteConfirmIndex(null);
          toast.success('Experience deleted successfully!');
        } catch (error) {
          console.error('Failed to delete experience:', error);
          toast.error('Failed to delete experience.');
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  return (
    <div id="work-experience" className={`${THEME.components.card.default} flex flex-col gap-4 relative`} >
      <div className="flex items-center justify-between mb-4">
        <h2 className={THEME.components.typography.sectionTitle}>{SITE_CONFIG.experienceSection.section}</h2>
        {!readOnly && (
          <div className="flex gap-2 absolute top-4 right-4">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-9 h-9"
              onClick={handleAdd}
              aria-label="Add Experience"
            >
              <Plus size={20} className={`text-[${THEME.colors.primary}]`} />
            </Button>
          </div>
        )}
      </div>
      {
        experiences.map((exp: Experience, idx: number) => (
          <div key={exp.role + exp.company + idx} className={`${THEME.colors.background.input} rounded-xl p-4 flex flex-col gap-2 relative`}>
            {!readOnly && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-8 h-8"
                  onClick={() => handleEdit(idx)}
                  aria-label="Edit Experience"
                >
                  <Edit2 size={16} className={`text-[${THEME.colors.primary}]`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-8 h-8 hover:bg-red-50"
                  onClick={() => handleDeleteClick(idx)}
                  aria-label="Delete Experience"
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3 mb-1">
              {exp.companyLogo && (
                <img src={exp.companyLogo} alt={exp.company} className="w-15 h-15 rounded object-contain bg-white border border-gray-200" />
              )}
              <div className="flex flex-col gap-1">
                <span className={THEME.components.typography.cardTitle}>{exp.role}</span>
                <div className={`flex items-center gap-2 ${THEME.components.typography.body} mb-1`}>
                  <Building2 size={14} className="inline-block" />
                  <span className="font-medium">{exp.company}</span>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${THEME.components.typography.body} mb-1`}>
              <MapPin size={14} className="inline-block" />
              <span>{exp.location?.substring(0, 20)}</span>
              <span className="mx-1">•</span>
              <span>{exp.employmentType}</span>
              <span className="mx-1">•</span>
              <Calendar size={14} className="inline-block" />
              <span>
                {exp.joiningYear ? `${exp.joiningYear}` : ''}
                {exp.isCurrent
                  ? ' – Present'
                  : exp.leavingYear
                    ? ` – ${exp.leavingYear}`
                    : ''}
              </span>
            </div>
            <div 
              className={`${THEME.components.typography.body} mt-2 mb-2`}
              dangerouslySetInnerHTML={{ __html: exp.description || '' }}
            />
            <div className={`${THEME.components.typography.cardTitle} text-sm mb-1`}>Key Responsibilities & Achievements</div>
            <ul className={`list-disc ml-6 ${THEME.components.typography.body} mb-2`}>
              {exp.achievements.map((ach, i) => (
                <li key={ach + i}>{ach}</li>
              ))}
            </ul>
            <div className={`${THEME.components.typography.cardTitle} text-sm mb-1`}>Skills & Tools Used</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {exp.skills.map((skill) => (
                <span key={skill} className={THEME.components.badge.skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))
      }
      <ExperienceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingIndex === null ? defaultExperience : experiences[editingIndex]}
        onSave={handleSave}
        onDelete={editingIndex !== null ? () => handleDeleteClick() : undefined}
      />
      <ConfirmModal
        open={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        onConfirm={confirmDelete}
        title="Delete Experience"
        message="Are you sure you want to delete this experience? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div >
  );
}
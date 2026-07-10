'use client'
import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap, Calendar, MapPin, Edit2, Trash2 } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import type { Education as EducationType } from '../../types/profile';
import type { Education as APIEducation } from '@/lib/api/types';
import EducationModal from './EducationModal';
import { THEME } from '../../styles/theme';
import Button from '../shared/Button';
import { educationService } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '../shared/ConfirmModal';

const defaultEducation: EducationType = {
  institution: '',
  course: '',
  specialization: '',
  courseType: '',
  startYear: '',
  endYear: '',
  is_pursuing: 0,
  grade: '',
  degree: '',
  location: '',
  duration: '',
  description: '',
  achievements: [''],
  skills: [],
};

interface EducationSectionProps {
  readOnly?: boolean;
  educations?: APIEducation[];
}

export default function EducationSection({ readOnly = false, educations: apiEducations = [] }: EducationSectionProps) {
  // Convert API educations to local format
  const convertedEducations: EducationType[] = apiEducations.map(edu => ({
    institution: edu.university_institute,
    course: edu.course,
    specialization: edu.specialization,
    courseType: edu.course_type,
    startYear: edu.start_year,
    endYear: edu.end_year,
    is_pursuing: edu.is_pursuing || 0,
    grade: edu.grade_cgpa,
    degree: edu.course,
    location: '',
    duration: `${edu.start_year} - ${edu.end_year}`,
    description: edu.description,
    achievements: [],
    skills: [],
  }));

  const [education, setEducation] = useState<EducationType[]>(convertedEducations);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handler = (e: Event) => {
      const { sectionId } = (e as CustomEvent).detail;
      if (sectionId === 'education') {
        setEditingIndex(null);
        setModalOpen(true);
      }
    };
    window.addEventListener('profile:open-modal', handler);
    return () => window.removeEventListener('profile:open-modal', handler);
  }, []);

  React.useEffect(() => {
    setEducation(apiEducations.map(edu => ({
      institution: edu.university_institute,
      course: edu.course,
      specialization: edu.specialization,
      courseType: edu.course_type,
      startYear: edu.start_year,
      endYear: edu.end_year,
      is_pursuing: edu.is_pursuing || 0,
      grade: edu.grade_cgpa,
      degree: edu.course,
      location: '',
      duration: `${edu.start_year} - ${edu.end_year}`,
      description: edu.description,
      achievements: [],
      skills: [],
    })));
  }, [apiEducations]);

  const handleAdd = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setModalOpen(true);
  };

  const handleSave = async (edu: EducationType) => {
    try {
      if (editingIndex === null) {
        // Add
        const apiData = {
          university_institute: edu.institution,
          course: edu.course || edu.degree,
          specialization: edu.specialization,
          course_type: edu.courseType || 'Full Time',
          start_year: edu.startYear,
          end_year: edu.is_pursuing ? "" : edu.endYear,
          is_pursuing: edu.is_pursuing ? 1 : 0,
          grade_cgpa: edu.grade,
          description: edu.description,
        };
        await educationService.addEducation(apiData);
        setEducation([...education, edu]);
      } else {
        // Update
        const originalEdu = apiEducations[editingIndex];
        if (!originalEdu) return;

        const apiData = {
          id: originalEdu.id,
          university_institute: edu.institution,
          course: edu.course || edu.degree,
          specialization: edu.specialization,
          course_type: edu.courseType || originalEdu.course_type || 'Full Time',
          start_year: edu.startYear,
          end_year: edu.is_pursuing ? "" : edu.endYear,
          is_pursuing: edu.is_pursuing ? 1 : 0,
          grade_cgpa: edu.grade,
          description: edu.description,
        };
        await educationService.updateEducation(apiData);
        setEducation(education.map((e, i) => (i === editingIndex ? edu : e)));
      }
      await refreshUser();
      setModalOpen(false);
      toast.success('Education saved successfully!');
    } catch (error: any) {
      console.error('Failed to save education:', error);
      // Suppress generic toast if there's a specific validation structured error going up to Modal
      if (!error?.response?.data?.data?.errors) {
        toast.error('Failed to save education.');
      }
      throw error;
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
      const originalEdu = apiEducations[deleteConfirmIndex];
      if (originalEdu) {
        setIsDeleting(true);
        try {
          await educationService.deleteEducation(originalEdu.id);
          await refreshUser();
          setModalOpen(false);
          setDeleteConfirmIndex(null);
          toast.success('Education deleted successfully!');
        } catch (error) {
          console.error('Failed to delete education:', error);
          toast.error('Failed to delete education.');
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  return (
    <div id="education" className={`${THEME.components.card.default} flex flex-col gap-4 relative`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={THEME.components.typography.sectionTitle}>{SITE_CONFIG.educationSection.section}</h2>
        {!readOnly && (
          <div className="flex gap-2 absolute top-4 right-4">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-9 h-9"
              onClick={handleAdd}
              aria-label="Add Education"
            >
              <Plus size={20} className={`text-[${THEME.colors.primary}]`} />
            </Button>
          </div>
        )}
      </div>
      {education.map((edu: EducationType, idx: number) => {
        const renderDuration = () => {
          if (edu.is_pursuing) {
            return edu.startYear && edu.startYear !== 'null' ? `${edu.startYear} - Present` : 'Present';
          }
          if (edu.startYear && edu.startYear !== 'null' && edu.endYear && edu.endYear !== 'null') {
            return `${edu.startYear} - ${edu.endYear}`;
          }
          if (edu.startYear && edu.startYear !== 'null') return edu.startYear;
          if (edu.endYear && edu.endYear !== 'null') return edu.endYear;
          return '';
        };

        const durationText = renderDuration();

        return (
          <div key={edu.degree + idx} className="bg-white border-b border-gray-200 last:border-b-0 rounded-none p-0 pb-6 mb-6 flex flex-col gap-2 relative group">
            <div className="flex items-start justify-between pr-16">
              <div>
                <div className={`${THEME.components.typography.cardTitle} leading-tight`}>{edu.degree}</div>
                {edu.specialization && String(edu.specialization) !== 'null' && (
                  <div className={`${THEME.components.typography.meta} font-medium mb-1`}>{edu.specialization}</div>
                )}
              </div>
              {!readOnly && (
                <div className="absolute top-0 right-0 flex gap-1 opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(idx)}
                    className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
                    title="Edit Education"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(idx)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Education"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className={`flex flex-wrap items-center gap-2 ${THEME.components.typography.body} mb-1 mt-1`}>
              {edu.institution && String(edu.institution) !== 'null' && (
                <>
                  <GraduationCap size={16} className="inline-block text-gray-500" />
                  <span className="font-medium">{edu.institution}</span>
                </>
              )}
            </div>
            
            {edu.grade && String(edu.grade) !== 'null' && (
              <div className="flex items-center gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-lg shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Grade:</span>
                  <span className="text-sm font-black text-amber-800">{edu.grade}</span>
                </div>
              </div>
            )}
            
            {(durationText || (edu.courseType && String(edu.courseType) !== 'null')) && (
              <div className={`flex flex-wrap items-center gap-2 ${THEME.components.typography.meta} mb-2`}>
                {durationText && (
                  <>
                    <Calendar size={14} className="inline-block text-gray-400" />
                    <span>{durationText}</span>
                  </>
                )}
                {edu.courseType && String(edu.courseType) !== 'null' && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                    {edu.courseType}
                  </span>
                )}
              </div>
            )}
            
            {edu.description && String(edu.description) !== 'null' && (
              <div 
                className={`${THEME.components.typography.body} mt-2 mb-2 text-gray-600`}
                dangerouslySetInnerHTML={{ __html: edu.description }}
              />
            )}
          </div>
        );
      })}
      <EducationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingIndex === null ? defaultEducation : education[editingIndex]}
        onSave={handleSave}
        onDelete={editingIndex !== null ? () => handleDeleteClick() : undefined}
      />
      <ConfirmModal
        open={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        onConfirm={confirmDelete}
        title="Delete Education"
        message="Are you sure you want to delete this education entry? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
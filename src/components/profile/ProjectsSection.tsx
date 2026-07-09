'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Calendar, Link as LinkIcon, Trash2 } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import type { Project } from '../../types/profile';
import ProjectModal from './ProjectModal';
import { THEME } from '../../styles/theme';
import Card from '../shared/Card';
import Button from '../shared/Button';
import ConfirmModal from '../shared/ConfirmModal';
import { projectService } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import type { APIProject } from '@/lib/api/types';

const defaultProject: Project = {
  title: '',
  role: '',
  startYear: '',
  startMonth: '',
  endYear: '',
  endMonth: '',
  isOngoing: false,
  description: '',
  achievements: [''],
  skills: [],
  softwares: [],
  link: '',
};

interface ProjectsSectionProps {
  projects?: APIProject[];
  readOnly?: boolean;
}

export default function ProjectsSection({ projects: apiProjects = [], readOnly = false }: ProjectsSectionProps) {
  const convertedProjects: Project[] = apiProjects.map(p => {
    let startYear = '', startMonth = '';
    if (p.start_date) {
      const parts = p.start_date.split('-');
      if (parts.length >= 2) {
        startYear = parts[0];
        // simple map: 01=Jan, etc. or just keep it simple if months are complicated, better: use Date obj
        const date = new Date(p.start_date);
        startMonth = date.toLocaleString('default', { month: 'short' });
      }
    }

    let endYear = '', endMonth = '';
    if (p.end_date) {
      const date = new Date(p.end_date);
      endYear = date.getFullYear().toString();
      endMonth = date.toLocaleString('default', { month: 'short' });
    }

    const techs = p.technologies ? p.technologies.split(',').map(s => s.trim()).filter(Boolean) : [];

    return {
      id: p.id,
      title: p.title,
      role: '', // not in API
      startYear,
      startMonth,
      endYear,
      endMonth,
      isOngoing: !p.end_date,
      description: p.description || '',
      achievements: [],
      skills: techs,
      softwares: [],
      link: p.project_url || '',
      githubLink: p.github_url || ''
    };
  });

  const [projects, setProjects] = useState<Project[]>(convertedProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handler = (e: Event) => {
      const { sectionId } = (e as CustomEvent).detail;
      if (sectionId === 'projects') {
        setEditingIndex(null);
        setModalOpen(true);
      }
    };
    window.addEventListener('profile:open-modal', handler);
    return () => window.removeEventListener('profile:open-modal', handler);
  }, []);

  React.useEffect(() => {
    // Sync when api projects change
    const reconverted = apiProjects.map(p => {
      let startYear = '', startMonth = '';
      if (p.start_date) {
        const date = new Date(p.start_date);
        startYear = date.getFullYear().toString();
        startMonth = date.toLocaleString('default', { month: 'short' });
      }
      let endYear = '', endMonth = '';
      if (p.end_date) {
        const date = new Date(p.end_date);
        endYear = date.getFullYear().toString();
        endMonth = date.toLocaleString('default', { month: 'short' });
      }
      const techs = p.technologies ? p.technologies.split(',').map(s => s.trim()).filter(Boolean) : [];
      return {
        id: p.id,
        title: p.title,
        role: '',
        startYear,
        startMonth,
        endYear,
        endMonth,
        isOngoing: !p.end_date,
        description: p.description || '',
        achievements: [],
        skills: techs,
        softwares: [],
        link: p.project_url || '',
        githubLink: p.github_url || ''
      };
    });
    setProjects(reconverted);
  }, [apiProjects]);

  const handleAdd = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setModalOpen(true);
  };

  const handleSave = async (proj: Project) => {
    const monthMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    let start_date = '';
    if (proj.startYear && proj.startMonth) {
      const mm = monthMap[proj.startMonth] || '01';
      start_date = `${proj.startYear}-${mm}-01`;
    }

    let end_date = '';
    if (!proj.isOngoing && proj.endYear && proj.endMonth) {
      const mm = monthMap[proj.endMonth] || '01';
      end_date = `${proj.endYear}-${mm}-01`;
    }

    const technologies = [...(proj.skills || []), ...(proj.softwares || [])].join(',');

    try {
      if (editingIndex === null) {
        // Add
        await projectService.addProject({
          title: proj.title,
          description: proj.description,
          project_url: proj.link,
          github_url: proj.githubLink || '',
          start_date,
          end_date,
          technologies
        });
      } else {
        // Update
        const originalProj = apiProjects[editingIndex];
        if (!originalProj) return;

        await projectService.updateProject({
          id: originalProj.id,
          title: proj.title,
          description: proj.description,
          project_url: proj.link,
          github_url: proj.githubLink || '',
          start_date,
          end_date,
          technologies
        });
      }
      await refreshUser();
      setModalOpen(false);
      toast.success('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project. Please try again.');
      throw error;
    }
  };

  const handleDeleteClick = (idx: number) => {
    setDeleteConfirmIndex(idx);
  };

  const confirmDelete = async () => {
    if (deleteConfirmIndex !== null) {
      const originalProj = apiProjects[deleteConfirmIndex];
      if (originalProj) {
        setIsDeleting(true);
        try {
          await projectService.deleteProject(originalProj.id);
          await refreshUser();
          setModalOpen(false);
          setDeleteConfirmIndex(null);
          toast.success('Project deleted successfully!');
        } catch (error) {
          console.error('Failed to delete project:', error);
          toast.error('Failed to delete project.');
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  return (
    <Card id="projects" className="flex flex-col gap-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className={THEME.components.typography.sectionTitle}>{SITE_CONFIG.projectsSection.section}</h2>
        {!readOnly && (
          <div className="flex gap-2 absolute top-4 right-4">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-9 h-9 hover:bg-purple-100 transition-colors"
              onClick={handleAdd}
              aria-label="Add Project"
            >
              <Plus size={20} className={`text-[${THEME.colors.primary}]`} />
            </Button>
          </div>
        )}
      </div>
      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm font-medium">No projects added yet.</p>
        </div>
      ) : projects.map((proj: Project, idx: number) => (
        <Card key={proj.title + idx} hoverEffect className="rounded-xl p-4 flex flex-col gap-2 relative">
          {!readOnly && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full w-8 h-8"
                onClick={() => handleEdit(idx)}
                aria-label="Edit Project"
              >
                <Edit2 size={16} className={`text-[${THEME.colors.primary}]`} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full w-8 h-8"
                onClick={() => handleDeleteClick(idx)}
                aria-label="Delete Experience"
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          )}

          <div>
            <div className={`${THEME.components.typography.cardTitle} text-lg mb-1`}>{proj.title}</div>
            <div className={`flex items-center gap-2 ${THEME.components.typography.subheading}`}>
              <span className="font-medium">{proj.role}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span className={THEME.components.typography.meta}>
                  {proj.startMonth} {proj.startYear} - {proj.isOngoing ? 'Present' : `${proj.endMonth} ${proj.endYear}`}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`${THEME.components.typography.body} leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: proj.description || '' }}
          />

          {proj.achievements && proj.achievements.length > 0 && proj.achievements[0] !== '' && (
            <div>
              <div className={`${THEME.components.typography.subheading} font-semibold mb-2`}>Key Achievements</div>
              <ul className="list-disc ml-5 space-y-1">
                {proj.achievements.map((ach, i) => (
                  <li key={ach + i} className={THEME.components.typography.body}>{ach}</li>
                ))}
              </ul>
            </div>
          )}

          {proj.skills && proj.skills.length > 0 && (
            <div>
              <div className={`${THEME.components.typography.subheading} font-semibold mb-2`}>Skills Used</div>
              <div className="flex flex-wrap gap-2">
                {proj.skills.map((skill) => (
                  <span key={skill} className={THEME.components.badge.skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {proj.softwares && proj.softwares.length > 0 && (
            <div>
              <div className={`${THEME.components.typography.subheading} font-semibold mb-2`}>Softwares Used</div>
              <div className="flex flex-wrap gap-2">
                {proj.softwares.map((software) => (
                  <span key={software} className={`${THEME.components.badge.skill} bg-gray-100 text-gray-700`}>
                    {software}
                  </span>
                ))}
              </div>
            </div>
          )}

          {proj.link && (
            <div className="pt-2 border-t border-gray-100 mt-1 flex gap-4">
              <a href={proj.link} target="_blank" rel="noopener noreferrer" className={`${THEME.components.typography.link} flex items-center gap-1.5 font-medium`}>
                <LinkIcon size={14} />
                View Project
              </a>
              {proj.githubLink && (
                <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className={`${THEME.components.typography.link} flex items-center gap-1.5 font-medium text-gray-700 hover:text-gray-900`}>
                  <LinkIcon size={14} />
                  GitHub URL
                </a>
              )}
            </div>
          )}
          {!proj.link && proj.githubLink && (
            <div className="pt-2 border-t border-gray-100 mt-1 flex gap-4">
              <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className={`${THEME.components.typography.link} flex items-center gap-1.5 font-medium text-gray-700 hover:text-gray-900`}>
                <LinkIcon size={14} />
                GitHub URL
              </a>
            </div>
          )}
        </Card>
      ))}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingIndex === null ? defaultProject : projects[editingIndex]}
        onSave={handleSave}
        onDelete={editingIndex !== null ? () => handleDeleteClick(editingIndex) : undefined}
      />
      <ConfirmModal
        open={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        isLoading={isDeleting}
      />
    </Card>
  );
} 
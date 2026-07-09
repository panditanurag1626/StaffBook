import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import TextInput from '../shared/TextInput';
import SelectInput from '../shared/SelectInput';
import type { Project } from '../../types/profile';

const YEARS = Array.from({ length: 30 }, (_, i) => `${2024 - i}`);
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  initialData: Project;
  onSave: (data: Project) => Promise<void> | void;
  onDelete?: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ open, onClose, initialData, onSave, onDelete }) => {
  const [form, setForm] = useState<Project>(initialData);
  const [skills, setSkills] = useState<string[]>(form.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [softwares, setSoftwares] = useState<string[]>(form.softwares || []);
  const [softwareInput, setSoftwareInput] = useState('');
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  React.useEffect(() => {
    if (open) {
      const initialDescription = initialData.description ? initialData.description.replace(/<br\s*\/?>/gi, '\n') : '';
      setForm({ ...initialData, description: initialDescription });
      setSkills(initialData.skills || []);
      setSoftwares(initialData.softwares || []);
      setApiErrors({});
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name || e.target.id]: e.target.value });
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
      e.preventDefault();
    }
  };
  const handleSkillRemove = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSoftwareAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && softwareInput.trim()) {
      setSoftwares([...softwares, softwareInput.trim()]);
      setSoftwareInput('');
      e.preventDefault();
    }
  };
  const handleSoftwareRemove = (software: string) => {
    setSoftwares(softwares.filter(s => s !== software));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});

    // Client-side validation
    const errors: Record<string, string[]> = {};
    if (!form.title.trim()) errors.title = ['Project title is required'];
    // if (!form.role.trim()) errors.role = ['Role is required'];
    if (!form.startMonth || !form.startYear) errors.start_date = ['Start date is required'];
    if (!form.endMonth || !form.endYear) errors.end_date = ['End date is required'];

    if (Object.keys(errors).length > 0) {
      setApiErrors(errors);
      return;
    }

    try {
      const formattedDescription = form.description ? form.description.replace(/\n/g, '<br />') : '';
      await onSave({ ...form, description: formattedDescription, skills, softwares });
    } catch (err: any) {
      console.error(err);
      const responseData = err.response?.data?.data || err.response?.data;
      if (responseData?.errors) {
        setApiErrors(responseData.errors);
      } else if (responseData?.message) {
        setApiErrors({ general: [responseData.message] });
      } else {
        setApiErrors({ general: ["An unexpected error occurred. Please try again."] });
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-2xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">Projects</div>
          {onDelete && (
            <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 font-medium transition-colors hover:bg-red-50" onClick={onDelete}>Delete Project</Button>
          )}
        </div>

        {apiErrors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {apiErrors.general[0]}
          </div>
        )}

        <div className="mb-4">
          <TextInput id="title" label="Project Title *" value={form.title} onChange={handleChange} />
          {apiErrors.title && <p className="text-red-500 text-xs mt-1">{apiErrors.title[0]}</p>}
        </div>
        {/* <div className="mb-4">
          <TextInput id="role" label="Your Role *" value={form.role} onChange={handleChange} />
          {apiErrors.role && <p className="text-red-500 text-xs mt-1">{apiErrors.role[0]}</p>}
        </div> */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">Start Date *</label>
            <div className="flex gap-2">
              <SelectInput
                id="startMonth"
                label=""
                options={MONTHS}
                value={form.startMonth || ''}
                onChange={e => setForm({ ...form, startMonth: e.target.value })}
                placeholder="Month"
              />
              <SelectInput
                id="startYear"
                label=""
                options={YEARS}
                value={form.startYear || ''}
                onChange={e => setForm({ ...form, startYear: e.target.value })}
                placeholder="Year"
              />
            </div>
            {apiErrors.start_date && <p className="text-red-500 text-xs mt-1">{apiErrors.start_date[0]}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">End Date *</label>
            <div className="flex gap-2">
              <SelectInput
                id="endMonth"
                label=""
                options={MONTHS}
                value={form.endMonth || ''}
                onChange={e => setForm({ ...form, endMonth: e.target.value })}
                placeholder="Month"
              />
              <SelectInput
                id="endYear"
                label=""
                options={YEARS}
                value={form.endYear || ''}
                onChange={e => setForm({ ...form, endYear: e.target.value })}
                placeholder="Year"
              />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1.5">Project Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={4000}
            rows={4}
            className="w-full text-black rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            placeholder="Describe your project, your role, and the technologies used..."
          />
          <div className="flex justify-between items-start mt-1">
            <div className="text-red-500 text-xs">
              {apiErrors.description && apiErrors.description[0]}
            </div>
            <div className="text-right text-xs text-gray-400 shrink-0">4000 Characters</div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1.5">Softwares Used</label>
          <input
            type="text"
            value={softwareInput}
            onChange={e => setSoftwareInput(e.target.value)}
            onKeyDown={handleSoftwareAdd}
            placeholder="Type and press Enter or Comma"
            className="w-full rounded-xl text-gray-900 border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {softwares.map(software => (
              <span key={software} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm border border-gray-200">
                {software}
                <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => handleSoftwareRemove(software)}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1.5">Skills Used</label>
          <input
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={handleSkillAdd}
            placeholder="Type and press Enter or Comma"
            className="w-full rounded-xl text-gray-900 border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm border border-purple-100">
                {skill}
                <button type="button" className="ml-1 text-purple-400 hover:text-purple-700" onClick={() => handleSkillRemove(skill)}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TextInput id="link" label="Project URL" value={form.link || ''} onChange={handleChange} placeholder="https://..." />
            {apiErrors.project_url && <p className="text-red-500 text-xs mt-1">{apiErrors.project_url[0]}</p>}
          </div>
          <div>
            <TextInput id="githubLink" label="GitHub URL" value={form.githubLink || ''} onChange={handleChange} placeholder="https://github.com/..." />
            {apiErrors.github_url && <p className="text-red-500 text-xs mt-1">{apiErrors.github_url[0]}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            className="px-6 py-2.5 rounded-full font-medium text-gray-600 hover:bg-gray-100 transition-colors h-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="px-6 py-2.5 rounded-full font-medium text-white shadow-md h-auto"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal; 
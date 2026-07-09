'use client'
import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import TextInput from '../shared/TextInput';
import SelectInput from '../shared/SelectInput';
import type { Experience } from '../../types/profile';

const EMPLOYMENT_TYPES = [
  'Full Time',
  'Part Time',
  'Internship',
  'Contract',
  'Freelance',
];
const YEARS = Array.from({ length: 30 }, (_, i) => `${2026 - i}`);
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface ExperienceModalProps {
  open: boolean;
  onClose: () => void;
  initialData: Experience;
  onSave: (data: Experience) => Promise<void> | void;
  onDelete?: () => void;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ open, onClose, initialData, onSave, onDelete }) => {
  const [form, setForm] = useState<Experience>(initialData);
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [achievements, setAchievements] = useState<string[]>(initialData?.achievements || ['']);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  // Sync state when initialData changes
  React.useEffect(() => {
    if (open) {
      const initialDescription = initialData.description ? initialData.description.replace(/<br\s*\/?>/gi, '\n') : '';
      setForm({ ...initialData, description: initialDescription });
      setSkills(initialData.skills || []);
      setAchievements(initialData.achievements || ['']);
      setApiErrors({});
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, id, value } = e.target;
    const fieldName = name || id;
    if (fieldName) {
      setForm(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleEmploymentType = (type: string) => {
    setForm({ ...form, employmentType: type });
  };

  const handleCurrentEmployment = (isCurrent: boolean) => {
    setForm({ ...form, isCurrent });
    if (isCurrent) {
      setForm(f => ({ ...f, leavingYear: '', leavingMonth: '' }));
    }
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

  const handleAchievementChange = (idx: number, value: string) => {
    const updated = [...achievements];
    updated[idx] = value;
    setAchievements(updated);
  };
  const handleAddAchievement = () => {
    setAchievements([...achievements, '']);
  };

  const handleRemoveAchievement = (idx: number) => {
    setAchievements(achievements.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});
    try {
      const formattedDescription = form.description ? form.description.replace(/\n/g, '<br />') : '';
      await onSave({ ...form, description: formattedDescription, skills, achievements });
      // Modal closes successfully from parent state change
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
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">Experience</div>
          {onDelete && (
            <Button type="button" variant="ghost" className="text-purple-500 font-semibold hover:bg-purple-50" onClick={onDelete}>Delete</Button>
          )}
        </div>

        {apiErrors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {apiErrors.general[0]}
          </div>
        )}

        <div className="mb-3">
          <div className="font-medium text-gray-500 mb-2">Is this your current employment?</div>
          <div className="flex gap-6 text-black">
            <label className="flex text-black items-center gap-2 cursor-pointer">
              <input type="radio" checked={form.isCurrent} onChange={() => handleCurrentEmployment(true)} className="accent-purple-500" />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!form.isCurrent} onChange={() => handleCurrentEmployment(false)} className="accent-purple-500" />
              <span>No</span>
            </label>
          </div>
        </div>
        <div className="mb-3">
          <div className="font-medium text-gray-500 mb-2">Employment Type</div>
          <div className="flex flex-wrap gap-4">
            {EMPLOYMENT_TYPES.map(type => (
              <Button
                key={type}
                type="button"
                variant={form.employmentType === type ? 'primary' : 'outline'}
                className={`px-4 py-1.5 rounded-full text-sm border ${form.employmentType === type ? 'border-transparent' : 'bg-white text-gray-700 border-gray-300'} font-medium transition h-auto`}
                onClick={() => handleEmploymentType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          {apiErrors.employment_type && <p className="text-red-500 text-xs mt-1">{apiErrors.employment_type[0]}</p>}
        </div>
        <div className="mb-3">
          <label className="block text-gray-500 font-medium mb-1 text-sm">Company Logo <span className="font-normal text-xs text-gray-400">(optional)</span></label>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
              {form.companyLogo ? (
                <img src={form.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <FiUpload className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                id="companyLogo"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm({ ...form, companyLogo: reader.result as string, companyLogoFile: file });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100
                "
              />
              <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3">
          <div>
            <TextInput id="company" label="Company Name" value={form.company} onChange={handleChange} inputClassName="!py-2 !px-4 text-sm text-gray-900 placeholder:text-gray-400" />
            {apiErrors.company_name && <p className="text-red-500 text-xs mt-1">{apiErrors.company_name[0]}</p>}
          </div>
          <div>
            <TextInput id="role" label="Job Title" value={form.role} onChange={handleChange} inputClassName="!py-2 !px-4 text-sm text-gray-900 placeholder:text-gray-400" />
            {(apiErrors.title || apiErrors.profile_headline) && (
              <p className="text-red-500 text-xs mt-1">{apiErrors.title?.[0] || apiErrors.profile_headline?.[0]}</p>
            )}
          </div>
        </div>
        <div className="mb-3">
          <TextInput id="location" label="Location" value={form.location} onChange={handleChange} inputClassName="!py-2 !px-4 text-sm text-gray-900 placeholder:text-gray-400" placeholder="e.g. New Delhi, India" maxLength={20} />
          {apiErrors.location && <p className="text-red-500 text-xs mt-1">{apiErrors.location[0]}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3">
          <div>
            <label className="block text-gray-500 font-medium mb-1 text-sm">Joining Date</label>
            <div className="flex gap-2">
              <SelectInput
                id="joiningYear"
                label=""
                options={YEARS}
                value={form.joiningYear || ''}
                onChange={e => setForm({ ...form, joiningYear: e.target.value })}
                placeholder="-"
                selectClassName="!py-2 !px-4 text-sm text-gray-900"
              />
              <SelectInput
                id="joiningMonth"
                label=""
                options={MONTHS}
                value={form.joiningMonth || ''}
                onChange={e => setForm({ ...form, joiningMonth: e.target.value })}
                placeholder="-"
                selectClassName="!py-2 !px-4 text-sm text-gray-900"
              />
            </div>
            {apiErrors.start_date && <p className="text-red-500 text-xs mt-1">{apiErrors.start_date[0]}</p>}
          </div>
          <div>
            <label className="block text-gray-500 font-medium mb-1 text-sm">Leaving Date</label>
            <div className="flex gap-2">
              <SelectInput
                id="leavingYear"
                label=""
                options={YEARS}
                value={form.leavingYear || ''}
                onChange={e => setForm({ ...form, leavingYear: e.target.value })}
                placeholder="-"
                disabled={form.isCurrent}
                selectClassName="!py-2 !px-4 text-sm text-gray-900"
              />
              <SelectInput
                id="leavingMonth"
                label=""
                options={MONTHS}
                value={form.leavingMonth || ''}
                onChange={e => setForm({ ...form, leavingMonth: e.target.value })}
                placeholder="-"
                disabled={form.isCurrent}
                selectClassName="!py-2 !px-4 text-sm text-gray-900"
              />
            </div>
            {apiErrors.end_date && <p className="text-red-500 text-xs mt-1">{apiErrors.end_date[0]}</p>}
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-gray-500 font-medium mb-1 text-sm">Job Profile</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={4000}
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-400"
          />
          <div className="flex justify-between items-start mt-1">
            <div className="text-red-500 text-xs">
              {apiErrors.description && apiErrors.description[0]}
            </div>
            <div className="text-right text-xs text-gray-400 shrink-0">{(form.description || '').length}/4000 Characters</div>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-gray-500 font-medium mb-1 text-sm">Skills Used</label>
          <input
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={handleSkillAdd}
            placeholder="Add a skill and press Enter or Comma"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none mb-2 text-gray-900 placeholder:text-gray-400"
          />
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                {skill}
                <button type="button" className="ml-1 text-purple-400 hover:text-purple-700" onClick={() => handleSkillRemove(skill)}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-gray-500 font-medium mb-1 text-sm">Key Achievements</label>
          {achievements.map((ach, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={ach}
                onChange={e => handleAchievementChange(idx, e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-400"
                placeholder="Achievement"
              />
              {achievements.length > 1 && (
                <button type="button" className="text-red-400 hover:text-red-600 text-lg" onClick={() => handleRemoveAchievement(idx)}>&times;</button>
              )}
            </div>
          ))}
          <Button type="button" variant="ghost" className="text-purple-500 text-sm font-medium mt-1 hover:bg-purple-50" onClick={handleAddAchievement}>Add More</Button>
        </div>
        <div className="flex justify-between mt-6 gap-4">
          <Button type="button" variant="outline" className="bg-gray-100 text-purple-700 border border-gray-200 hover:bg-gray-200" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExperienceModal; 
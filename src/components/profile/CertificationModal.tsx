import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import TextInput from '../shared/TextInput';
import SelectInput from '../shared/SelectInput';
import type { Certification } from '../../types/profile';

const YEARS = Array.from({ length: 30 }, (_, i) => `${2030 - i}`);
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface CertificationModalProps {
  open: boolean;
  onClose: () => void;
  initialData: Certification;
  onSave: (data: Certification) => Promise<void> | void;
  onDelete?: () => void;
}

const CertificationModal: React.FC<CertificationModalProps> = ({ open, onClose, initialData, onSave, onDelete }) => {
  const [form, setForm] = useState<Certification>(initialData);
  // const [skills, setSkills] = useState<string[]>(form.skills || []);
  // const [skillInput, setSkillInput] = useState('');
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  React.useEffect(() => {
    if (open) {
      const initialDescription = initialData.description ? initialData.description.replace(/<br\s*\/?>/gi, '\n') : '';
      setForm({ ...initialData, description: initialDescription });
      // setSkills(initialData.skills || []);
      setApiErrors({});
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name || e.target.id]: e.target.value });
  };

  // const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
  //     setSkills([...skills, skillInput.trim()]);
  //     setSkillInput('');
  //     e.preventDefault();
  //   }
  // };
  // const handleSkillRemove = (skill: string) => {
  //   setSkills(skills.filter(s => s !== skill));
  // };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});
    try {
      const formattedDescription = form.description ? form.description.replace(/\n/g, '<br />') : '';
      await onSave({ ...form, description: formattedDescription });
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        setApiErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setApiErrors({ general: [err.response.data.message] });
      } else {
        setApiErrors({ general: ["An unexpected error occurred. Please try again."] });
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-2xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">Certification</div>
          {onDelete && (
            <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 font-medium transition-colors hover:bg-red-50" onClick={onDelete}>Delete</Button>
          )}
        </div>

        {apiErrors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {apiErrors.general[0]}
          </div>
        )}

        <div className="mb-4">
          <TextInput id="name" label="Certification Name" value={form.name} onChange={handleChange} />
          {apiErrors.name && <p className="text-red-500 text-xs mt-1">{apiErrors.name[0]}</p>}
        </div>
        <div className="mb-4">
          <TextInput id="institution" label="Issuing Organization" value={form.institution || form.role || ''} onChange={handleChange} />
          {apiErrors.issuing_organization && <p className="text-red-500 text-xs mt-1">{apiErrors.issuing_organization[0]}</p>}
        </div>
        <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 items-end">
          <div className="col-span-2">
            <label className="block text-gray-500 font-medium mb-1">Duration</label>
            <div className="flex gap-2">
              <SelectInput
                id="startYear"
                label=""
                options={YEARS}
                value={form.startYear || ''}
                onChange={e => setForm({ ...form, startYear: e.target.value })}
                placeholder="-"
              />
              <SelectInput
                id="startMonth"
                label=""
                options={MONTHS}
                value={form.startMonth || ''}
                onChange={e => setForm({ ...form, startMonth: e.target.value })}
                placeholder="-"
              />
            </div>
            {apiErrors.issue_date && <p className="text-red-500 text-xs mt-1">{apiErrors.issue_date[0]}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-gray-500 font-medium mb-1">Expiration Date (Optional)</label>
            <div className="flex gap-2">
              <SelectInput
                id="endYear"
                label=""
                options={YEARS}
                value={form.endYear || ''}
                onChange={e => setForm({ ...form, endYear: e.target.value })}
                placeholder="-"
              />
              <SelectInput
                id="endMonth"
                label=""
                options={MONTHS}
                value={form.endMonth || ''}
                onChange={e => setForm({ ...form, endMonth: e.target.value })}
                placeholder="-"
              />
            </div>
            {apiErrors.expiration_date && <p className="text-red-500 text-xs mt-1">{apiErrors.expiration_date[0]}</p>}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-500 font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={4000}
            rows={3}
            className="w-full text-black rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none"
          />
          <div className="flex justify-between items-start mt-1">
            <div className="text-red-500 text-xs">
              {apiErrors.description && apiErrors.description[0]}
            </div>
            <div className="text-right text-xs text-gray-400 shrink-0">4000 Characters</div>
          </div>
        </div>
        {/* <div className="mb-4">
          <label className="block text-gray-500 font-medium mb-1">Skills Acquired</label>
          <input
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={handleSkillAdd}
            placeholder="Add a skill and press Enter or Comma"
            className="w-full text-black placeholder:text-gray-500 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                {skill}
                <button type="button" className="ml-1 text-purple-400 hover:text-purple-700" onClick={() => handleSkillRemove(skill)}>&times;</button>
              </span>
            ))}
          </div>
        </div> */}
        <div className="mb-4">
          <TextInput id="credentialId" label="Credential ID" value={form.credentialId} onChange={handleChange} />
          {apiErrors.credential_id && <p className="text-red-500 text-xs mt-1">{apiErrors.credential_id[0]}</p>}
        </div>
        <div className="mb-4">
          <TextInput id="url" label="Credential URL" value={form.url} onChange={handleChange} placeholder="https://..." />
          {apiErrors.credential_url && <p className="text-red-500 text-xs mt-1">{apiErrors.credential_url[0]}</p>}
        </div>
        <div className="flex justify-between mt-6 gap-4">
          <Button type="button" variant="outline" className="bg-gray-100 text-purple-700 border border-gray-200 hover:bg-gray-200" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CertificationModal; 
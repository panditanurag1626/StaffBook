import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import TextInput from '../shared/TextInput';
import SelectInput from '../shared/SelectInput';
import type { Education } from '../../types/profile';

const YEARS = Array.from({ length: 30 }, (_, i) => `${2026 - i}`);
const ENDYEARS = Array.from({ length: 30 }, (_, i) => `${2030 - i}`);
const COURSE_TYPES = [
  'Full Time',
  'Part Time',
  'Correspondence/ Distance Learning',
];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface EducationModalProps {
  open: boolean;
  onClose: () => void;
  initialData: Education;
  onSave: (data: Education) => Promise<void> | void;
  onDelete?: () => void;
}

const EducationModal: React.FC<EducationModalProps> = ({ open, onClose, initialData, onSave, onDelete }) => {
  const [form, setForm] = useState<Education>(initialData);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prefill data when modal opens or initialData changes
  React.useEffect(() => {
    if (open) {
      const initialDescription = initialData.description ? initialData.description.replace(/<br\s*\/?>/gi, '\n') : '';
      setForm({ ...initialData, description: initialDescription });
      setErrorMsg(null);
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleCourseType = (type: string) => {
    setForm({ ...form, courseType: type });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const formattedDescription = form.description ? form.description.replace(/\n/g, '<br />') : '';
      await onSave({ ...form, description: formattedDescription });
    } catch (err: any) {
      console.error(err);
      const errors = err?.response?.data?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        if (firstKey && errors[firstKey].length > 0) {
          setErrorMsg(errors[firstKey][0]);
          return;
        }
      }
      if (err?.response?.data?.message) {
        setErrorMsg(err.response.data.message);
        return;
      }
      setErrorMsg('Failed to save education details.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-2xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">Education</div>
          {onDelete && (
            <Button type="button" variant="ghost" className="text-purple-500 font-semibold hover:bg-purple-50" onClick={onDelete}>Delete</Button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="mb-4">
          <TextInput
            id="institution"
            label="University/ Institute"
            value={form.institution || ''}
            onChange={(e) => handleChange(e)}
            placeholder="Enter Institution Name"
          />
        </div>
        <div className="mb-4">
          <TextInput
            id="course"
            label="Course"
            value={form.course || ''}
            onChange={(e) => handleChange(e)}
            placeholder="Enter Course Name"
          />
        </div>
        <div className="mb-4">
          <TextInput
            id="specialization"
            label="Specialization"
            value={form.specialization || ''}
            onChange={(e) => handleChange(e)}
            placeholder="Enter Specialization"
          />
        </div>
        <div className="mb-4">
          <div className="font-medium text-gray-500 mb-2 font-Montserrat text-sm uppercase tracking-wider">Course Type</div>
          <div className="flex flex-wrap gap-4">
            {COURSE_TYPES.map(type => (
              <Button
                key={type}
                type="button"
                variant={form.courseType === type ? 'primary' : 'outline'}
                className={`px-4 py-1 rounded-full border ${form.courseType === type ? 'border-transparent' : 'bg-white text-gray-700 border-gray-300'} font-medium transition h-auto`}
                onClick={() => handleCourseType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
        <div className="mb-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer w-fit pl-1">
            <input
              type="checkbox"
              id="is_pursuing"
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              checked={!!form.is_pursuing}
              onChange={(e) => setForm(prev => ({ ...prev, is_pursuing: e.target.checked ? 1 : 0, endYear: e.target.checked ? '' : prev.endYear }))}
            />
            <span className="font-semibold text-sm text-[#18192B]">Currently pursuing</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4">
          <div>
            <SelectInput
              id="startYear"
              label="Course Duration (Start Year)"
              options={YEARS}
              value={form.startYear || ''}
              onChange={(e) => handleChange(e)}
              placeholder="Start Year"
            />
          </div>
          <div>
            <SelectInput
              id="endYear"
              label="Course Duration (End Year)"
              options={ENDYEARS}
              value={form.is_pursuing ? '' : (form.endYear || '')}
              onChange={(e) => handleChange(e)}
              placeholder="End Year"
              disabled={!!form.is_pursuing}
            />
          </div>
        </div>
        <div className="mb-4">
          <TextInput
            id="grade"
            label="CGPA / PERCENTAGE"
            value={form.grade || ''}
            onChange={(e) => handleChange(e)}
            placeholder="e.g. 8.5 or 85%"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            value={form.description || ''}
            onChange={handleChange}
            placeholder="Describe your education, activities, etc."
          />
        </div>
        <div className="flex justify-between mt-6 gap-4">
          <Button type="button" variant="outline" className="bg-gray-100 text-purple-700 border border-gray-200 hover:bg-gray-200" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EducationModal; 
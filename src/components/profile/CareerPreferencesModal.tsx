import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import TextInput from '../shared/TextInput';
import Button from '../shared/Button';
import CityMultiSelect from '../shared/CityMultiSelect';
import { userService } from '@/lib/api/services/userService';
import { useAuth } from '@/context/AuthContext';
import {
  currencies,
  workStatusOptions,
  jobTypeOptions,
  shiftOptions,
} from '@/lib/data/locationData';
import toast from 'react-hot-toast';

interface CareerPreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

const CareerPreferencesModal: React.FC<CareerPreferencesModalProps> = ({ open, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    preferred_role: '',
    preferred_location: '',
    preferred_salary: '',
    expected_salary: '',
    expected_salary_currency: 'INR',
    preferred_shift: '',
    job_type: '',
    work_status: '',
  });

  useEffect(() => {
    if (open && user) {
      setForm({
        preferred_role: (user as any).preferred_role || '',
        preferred_location: Array.isArray((user as any).preferred_location) 
          ? (user as any).preferred_location.join(',') 
          : ((user as any).preferred_location || ''),
        preferred_salary: (user as any).preferred_salary ? (user as any).preferred_salary.toString() : '',
        expected_salary: (user as any).expected_salary ? (user as any).expected_salary.toString() : '',
        expected_salary_currency: (user as any).expected_salary_currency || 'INR',
        preferred_shift: (user as any).preferred_shift || '',
        job_type: (user as any).job_type || '',
        work_status: (user as any).work_status || '',
      });
    }
  }, [open, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userService.editProfile(form);
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshUser();
      toast.success('Career Preferences updated successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to update career preferences:', error);
      let errorMessage = 'Failed to update preferences';
      const responseData = error?.response?.data?.data;
      if (responseData?.errors) {
        const firstKey = Object.keys(responseData.errors)[0];
        if (firstKey && Array.isArray(responseData.errors[firstKey]) && responseData.errors[firstKey].length > 0) {
          errorMessage = responseData.errors[firstKey][0];
        }
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Edit Career Preferences</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <TextInput id="preferred_role" label="Preferred Role" value={form.preferred_role} onChange={handleChange} inputClassName="text-black" />
          <CityMultiSelect 
            selectedCities={form.preferred_location ? form.preferred_location.split(',').filter(Boolean) : []}
            onChange={(cities) => setForm({ ...form, preferred_location: cities.join(',') })}
            label="Preferred Work Location"
            placeholder="Search and select cities..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div>
            <label htmlFor="preferred_shift" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Shift <span className="text-red-500">*</span>
            </label>
            <select
              id="preferred_shift"
              required
              value={form.preferred_shift}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Shift</option>
              {shiftOptions.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              id="job_type"
              required
              value={form.job_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Job Type</option>
              {jobTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="work_status" className="block text-sm font-medium text-gray-700 mb-1">Work Status</label>
            <select
              id="work_status"
              value={form.work_status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Status</option>
              {workStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <TextInput id="expected_salary" label="Expected Salary" value={form.expected_salary} onChange={handleChange} type="number" inputClassName="text-gray-900" />
            </div>
            <div className="col-span-1">
              <label htmlFor="expected_salary_currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                id="expected_salary_currency"
                value={form.expected_salary_currency}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CareerPreferencesModal;

'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { saveCompanyProfile } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface CompanyDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

const companySizeOptions = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5001-10000 employees',
  '10000+ employees',
];

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ open, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    company_name: '',
    about_company: '',
    company_website: '',
    founded: '',
    headquarter: '',
    industry: '',
    company_size: '',
  });

  // Populate form from current user data when modal opens
  useEffect(() => {
    if (open && user) {
      const d = (user as any)?.employerDetails;
      setForm({
        company_name: d?.company_name || '',
        about_company: d?.about_company || '',
        company_website: d?.company_website || '',
        founded: d?.founded || '',
        headquarter: d?.headquarter || '',
        industry: d?.industry || '',
        company_size: d?.company_size || '',
      });
    }
  }, [open, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveCompanyProfile(form);
      await refreshUser();
      toast.success('Company details updated successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to update company details:', error);
      const responseData = error?.response?.data?.data;
      let errorMessage = 'Failed to update company details';
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

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <Modal open={open} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col"
      >
        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
          Edit Company Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Company Name */}
          <div>
            <label htmlFor="company_name" className={labelClass}>
              Company Name
            </label>
            <input
              id="company_name"
              type="text"
              value={form.company_name}
              onChange={handleChange}
              placeholder="e.g. Curioso Technologies"
              className={inputClass}
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="company_website" className={labelClass}>
              Website
            </label>
            <input
              id="company_website"
              type="text"
              value={form.company_website}
              onChange={handleChange}
              placeholder="e.g. https://example.com"
              className={inputClass}
            />
          </div>

          {/* Founded */}
          <div>
            <label htmlFor="founded" className={labelClass}>
              Founded Year
            </label>
            <input
              id="founded"
              type="text"
              value={form.founded}
              onChange={handleChange}
              placeholder="e.g. 2021"
              className={inputClass}
            />
          </div>

          {/* Headquarter */}
          <div>
            <label htmlFor="headquarter" className={labelClass}>
              Headquarter
            </label>
            <input
              id="headquarter"
              type="text"
              value={form.headquarter}
              onChange={handleChange}
              placeholder="e.g. Pune, India"
              className={inputClass}
            />
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className={labelClass}>
              Industry
            </label>
            <input
              id="industry"
              type="text"
              value={form.industry}
              onChange={handleChange}
              placeholder="e.g. Recruitment Technology"
              className={inputClass}
            />
          </div>

          {/* Company Size */}
          <div>
            <label htmlFor="company_size" className={labelClass}>
              Company Size
            </label>
            <select
              id="company_size"
              value={form.company_size}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Company Size</option>
              {companySizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* About Company — full width */}
        <div className="mb-6">
          <label htmlFor="about_company" className={labelClass}>
            About Company
          </label>
          <textarea
            id="about_company"
            value={form.about_company}
            onChange={handleChange}
            rows={4}
            placeholder="Briefly describe your company, its mission, and what makes it unique..."
            className={`${inputClass} resize-none`}
          />
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

export default CompanyDetailsModal;

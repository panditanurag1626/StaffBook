'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUserMode, type EmployerDetails } from '@/context/UserModeContext';
import toast from 'react-hot-toast';

interface EmployerVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EmployerVerificationModal({
    isOpen,
    onClose,
}: EmployerVerificationModalProps) {
    const { verifyEmployer, isLoading } = useUserMode();
    const [formData, setFormData] = useState<EmployerDetails>({
        gst_number: '',
        corporate_id: '',
        professional_email: '',
        company_name: '',
        company_address: '',
        company_website: '',
    });
    const [errors, setErrors] = useState<Partial<EmployerDetails>>({});

    if (!isOpen) return null;

    const validateForm = (): boolean => {
        const newErrors: Partial<EmployerDetails> = {};

        if (!formData.gst_number.trim()) {
            newErrors.gst_number = 'GST Number is required';
        }
        if (!formData.corporate_id.trim()) {
            newErrors.corporate_id = 'Corporate ID is required';
        }
        if (!formData.professional_email.trim()) {
            newErrors.professional_email = 'Professional Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.professional_email)) {
            newErrors.professional_email = 'Invalid email format';
        }
        if (!formData.company_name.trim()) {
            newErrors.company_name = 'Company Name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await verifyEmployer(formData);
            onClose();
            toast.success('Successfully submitted verification request.');
        } catch (error) {
            console.error('Verification failed:', error);
            toast.error('Failed to verify employer details. Please try again.');
        }
    };

    const handleChange = (field: keyof EmployerDetails, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Employer Verification</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Please provide your company details to switch to employer mode
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={isLoading}
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* GST Number */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            GST Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.gst_number}
                            onChange={(e) => handleChange('gst_number', e.target.value)}
                            placeholder="Enter GST Number"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${errors.gst_number ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isLoading}
                        />
                        {errors.gst_number && (
                            <p className="text-red-500 text-sm mt-1">{errors.gst_number}</p>
                        )}
                    </div>

                    {/* Corporate ID */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Corporate ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.corporate_id}
                            onChange={(e) => handleChange('corporate_id', e.target.value)}
                            placeholder="Enter Corporate ID"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${errors.corporate_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isLoading}
                        />
                        {errors.corporate_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.corporate_id}</p>
                        )}
                    </div>

                    {/* Professional Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Professional Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.professional_email}
                            onChange={(e) => handleChange('professional_email', e.target.value)}
                            placeholder="company@example.com"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${errors.professional_email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isLoading}
                        />
                        {errors.professional_email && (
                            <p className="text-red-500 text-sm mt-1">{errors.professional_email}</p>
                        )}
                    </div>

                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => handleChange('company_name', e.target.value)}
                            placeholder="Enter Company Name"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all ${errors.company_name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isLoading}
                        />
                        {errors.company_name && (
                            <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
                        )}
                    </div>

                    {/* Company Address (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company Address
                        </label>
                        <textarea
                            value={formData.company_address}
                            onChange={(e) => handleChange('company_address', e.target.value)}
                            placeholder="Enter Company Address"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Company Website (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company Website
                        </label>
                        <input
                            type="url"
                            value={formData.company_website}
                            onChange={(e) => handleChange('company_website', e.target.value)}
                            placeholder="https://www.company.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-900">
                            <strong>Note:</strong> Your employer details will be verified by our team.
                            Once verified, you'll be able to post jobs and manage applications.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Switch Mode'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

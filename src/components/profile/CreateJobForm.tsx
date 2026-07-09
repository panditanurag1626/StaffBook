'use client';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { THEME } from '@/styles/theme';
import { FiUpload, FiVideo, FiPlus, FiX, FiCheck, FiChevronDown, FiAlertCircle } from 'react-icons/fi';
import Button from '@/components/shared/Button';
import JobPreviewModal from '@/components/profile/JobPreviewModal';
import TextInput from '@/components/shared/TextInput';
import LocationPicker from '@/components/shared/LocationPicker';
import { countries, getStatesForCountry, getCitiesForState } from '@/lib/data/locationData';
import { findCMSBySlug, CMSContent } from '@/lib/api/services/cmsService';
import toast from 'react-hot-toast';

interface CreateJobFormProps {
    onCancel?: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
}


// Helper function to parse screening questions
const parseScreeningQuestions = (data: any): string[] => {
    if (!data) return [''];
    if (Array.isArray(data) && data.length > 0) return data;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : [''];
        } catch (e) {
            return [''];
        }
    }
    return [''];
};

export default function CreateJobForm({ onCancel, onSubmit, initialData }: CreateJobFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        companyName: initialData?.companyName || '',
        employmentType: initialData?.employmentType || 'Permanent',
        description: initialData?.description || '',
        keySkills: initialData?.keySkills || '',
        department: initialData?.department || '',
        workExperienceMin: initialData?.workExperienceMin || '',
        workExperienceMax: initialData?.workExperienceMax || '',
        workMode: initialData?.workMode || 'Work from office',
        locationPreference: initialData?.locationPreference || '',
        noticePeriod: initialData?.noticePeriod || 'Immediate Joiner',
        salaryMin: initialData?.salaryMin || '',
        salaryMax: initialData?.salaryMax || '',
        screeningQuestions: parseScreeningQuestions(initialData?.screeningQuestions) as string[],
        enableGoogleMap: initialData?.enableGoogleMap || false,
        fullAddress: initialData?.fullAddress || '',
        street: initialData?.street || '',
        city: initialData?.city || '',
        pinCode: initialData?.pinCode || '',
        state: initialData?.state || '',
        country: initialData?.country || '',
        latitude: initialData?.latitude || '',
        longitude: initialData?.longitude || '',
        receiveApplicationsVia: initialData?.receiveApplicationsVia || 'E-Mail/Staff Book portal',
        companyLogo: initialData?.companyLogo || null,
        companyLogoFile: null as File | null,
        vacancyReel: null as File | null,
        reelUrl: initialData?.reelUrl || null,
        removeLogo: false,
        removeReel: false,
    });

    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [selectedCountryCode, setSelectedCountryCode] = useState(() => {
        const country = countries.find(c => c.name === initialData?.country);
        return country ? country.code : '';
    });
    const [availableStates, setAvailableStates] = useState<{ code: string; name: string }[]>(() => {
        const country = countries.find(c => c.name === initialData?.country);
        return country ? getStatesForCountry(country.code) : [];
    });
    const [selectedStateCode, setSelectedStateCode] = useState(() => {
        const country = countries.find(c => c.name === initialData?.country);
        if (!country) return '';
        const states = getStatesForCountry(country.code);
        const state = states.find(s => s.name === initialData?.state);
        return state ? state.code : '';
    });
    const [availableCities, setAvailableCities] = useState<string[]>(() => {
        const country = countries.find(c => c.name === initialData?.country);
        if (!country) return [];
        const states = getStatesForCountry(country.code);
        const state = states.find(s => s.name === initialData?.state);
        if (!state) return [];
        return getCitiesForState(country.code, state.code);
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [cmsContent, setCmsContent] = useState<CMSContent | null>(null);
    const [isLoadingTerms, setIsLoadingTerms] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const reelInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, companyLogoFile: file, removeLogo: false }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, companyLogo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, vacancyReel: file, removeReel: false }));
        }
    };

    const handleQuestionChange = (index: number, value: string) => {
        const newQuestions = [...formData.screeningQuestions];
        newQuestions[index] = value;
        setFormData({ ...formData, screeningQuestions: newQuestions });
    };

    const addQuestion = () => {
        if (formData.screeningQuestions.length >= 3) {
            toast.error('Maximum of 3 screening questions allowed');
            return;
        }
        setFormData({ ...formData, screeningQuestions: [...formData.screeningQuestions, ''] });
    };

    const removeQuestion = (index: number) => {
        const newQuestions = formData.screeningQuestions.filter((_: string, i: number) => i !== index);
        setFormData({ ...formData, screeningQuestions: newQuestions });
    };

    const handleLocationSelect = (data: { latitude: string; longitude: string; location: string }) => {
        setFormData({
            ...formData,
            latitude: data.latitude,
            longitude: data.longitude,
            fullAddress: data.location,
        });
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        const country = countries.find(c => c.code === countryCode);

        setSelectedCountryCode(countryCode);
        setFormData({ ...formData, country: country?.name || '', state: '', city: '' });

        if (countryCode) {
            const states = getStatesForCountry(countryCode);
            setAvailableStates(states);
        } else {
            setAvailableStates([]);
        }
        setSelectedStateCode('');
        setAvailableCities([]);
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateCode = e.target.value;
        const state = availableStates.find(s => s.code === stateCode);

        setSelectedStateCode(stateCode);
        setFormData({ ...formData, state: state?.name || '', city: '' });

        if (stateCode) {
            const cities = getCitiesForState(selectedCountryCode, stateCode);
            setAvailableCities(cities);
        } else {
            setAvailableCities([]);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, city: e.target.value });
    };

    const fetchTermsContent = async () => {
        if (cmsContent) {
            setShowTermsModal(true);
            return;
        }

        try {
            setIsLoadingTerms(true);
            const response = await findCMSBySlug('job-posting-terms-conditions');
            if (response && response.status === 200 && response.data) {
                // Handle nested structure: response.data is { success: true, data: CMSContent }
                const content = (response.data as any).data || response.data;
                setCmsContent(content);
                setShowTermsModal(true);
            }
        } catch (error) {
            console.error('Error fetching terms:', error);
        } finally {
            setIsLoadingTerms(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validQuestions = formData.screeningQuestions.filter((q: string) => q.trim() !== '');

        if (!acceptTerms) {
            setErrors({ terms: ['You must accept the Job Posting Terms & Conditions to proceed'] });
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            // Strip out empty questions before pushing up
            await onSubmit({ ...formData, screeningQuestions: validQuestions });
            // Only clear form on success
            setFormData({
                title: '',
                companyName: '',
                employmentType: 'Permanent',
                description: '',
                keySkills: '',
                department: '',
                workExperienceMin: '',
                workExperienceMax: '',
                workMode: 'Work from office',
                locationPreference: '',
                noticePeriod: 'Immediate Joiner',
                salaryMin: '',
                salaryMax: '',
                screeningQuestions: [''],
                enableGoogleMap: false,
                fullAddress: '',
                street: '',
                city: '',
                pinCode: '',
                state: '',
                country: '',
                latitude: '',
                longitude: '',
                receiveApplicationsVia: 'E-Mail/Staff Book portal',
                companyLogo: null,
                companyLogoFile: null as File | null,
                vacancyReel: null as File | null,
                reelUrl: null,
                removeLogo: false,
                removeReel: false,
            });
        } catch (error: any) {
            console.error('Job submission error:', error);
            // Handle validation errors from backend
            if (error?.response?.data?.data?.errors) {
                setErrors(error.response.data.data.errors);
            } else if (error?.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error?.response?.data?.message) {
                setErrors({ error: [error.response.data.message] });
            } else if (error?.message) {
                setErrors({ error: [error.message] });
            } else if (error?.errors) {
                setErrors(error.errors);
            } else {
                setErrors({ error: ['An unexpected error occurred while posting the job.'] });
            }

            // Scroll to top to show error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const employmentTypes = ['Full-time', 'Part-time', 'Permanent', 'Temporary', 'Contract', 'Internship', 'Freelance'];
    const workModes = ['Work from office', 'Remote', 'Hybrid', 'Flexible'];
    const noticePeriods = ['Immediate Joiner', '15 days', '30 days', '45 days', '60 days', '90 days', 'Negotiable', 'Serving Notice Period'];
    const receiveViaOptions = ['E-Mail/Staff Book portal'];

    return (
        <form onSubmit={handleSubmit} className="w-full bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                        <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-red-800 mb-2">Please fix the following errors:</h3>
                            <ul className="space-y-1">
                                {Object.entries(errors).map(([field, messages]) => (
                                    <li key={field} className="text-sm text-red-700">
                                        <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>{' '}
                                        {Array.isArray(messages) ? messages.join(', ') : messages}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Media */}
            <section className="mb-10">
                {/* <h2 className="text-lg font-bold text-[#9333ea] mb-6">Upload Media</h2> */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-[10px] md:text-xs font-medium text-gray-700 mb-1.5">Company Logo<span className="text-red-500">*</span></label>
                        <div
                            onClick={() => logoInputRef.current?.click()}
                            className="bg-[#fcfaff] border-2 border-dashed border-[#e9d5ff] rounded-xl flex flex-col items-center justify-center p-2 md:p-4 cursor-pointer hover:bg-[#f3e8ff] transition-colors h-[80px] md:h-[100px]"
                        >
                            {formData.companyLogo && !formData.removeLogo ? (
                                <div className="relative h-full w-full group/logo">
                                    <img src={formData.companyLogo} alt="Logo" className="h-full w-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFormData({ ...formData, companyLogo: null, companyLogoFile: null, removeLogo: true });
                                        }}
                                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity translate-x-1 -translate-y-1 shadow-sm"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[#9333ea] rounded-lg flex items-center justify-center mb-1.5">
                                        <FiUpload className="text-white" size={14} />
                                    </div>
                                    <span className="text-[#9333ea] font-bold text-[9px] md:text-[11px] text-center">Upload Logo</span>
                                </>
                            )}
                            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                        </div>
                    </div>

                    {/* Reel Upload */}
                    <div>
                        <label className="block text-[10px] md:text-xs font-medium text-gray-700 mb-1.5 truncate">Job Reel</label>
                        <div
                            onClick={() => reelInputRef.current?.click()}
                            className="bg-[#fcfaff] border-2 border-dashed border-[#e9d5ff] rounded-xl flex flex-col items-center justify-center p-2 md:p-4 cursor-pointer hover:bg-[#f3e8ff] transition-colors h-[80px] md:h-[100px]"
                        >
                            {formData.vacancyReel || (formData.reelUrl && !formData.removeReel) ? (
                                <div className="flex flex-col items-center justify-center relative w-full h-full group/reel">
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[#9333ea] rounded-lg flex items-center justify-center mb-1.5">
                                        <FiCheck className="text-white" size={14} />
                                    </div>
                                    <span className="text-gray-900 font-bold text-[9px] md:text-[11px]">
                                        {formData.vacancyReel ? 'Reel Selected' : 'Reel Uploaded'}
                                    </span>
                                    {formData.reelUrl && !formData.vacancyReel && (
                                        <a
                                            href={formData.reelUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] text-[#9333ea] underline mt-1 hover:text-purple-800"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View Reel
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFormData({ ...formData, vacancyReel: null, removeReel: true });
                                        }}
                                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/reel:opacity-100 transition-opacity translate-x-1 -translate-y-1 shadow-sm"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[#9333ea] rounded-lg flex items-center justify-center mb-1.5">
                                        <FiVideo className="text-white" size={14} />
                                    </div>
                                    <span className="text-[#9333ea] font-bold text-[9px] md:text-[11px] text-center">Upload Reel</span>
                                </>
                            )}
                            <input type="file" ref={reelInputRef} onChange={handleReelUpload} className="hidden" accept="video/*" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Job Details */}
            <section className="mb-10">
                <h2 className="text-sm lg:text-lg font-medium text-[#9333ea] mb-4 lg:mb-6">Job Details</h2>
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div className="col-span-2 md:col-span-1">
                        <TextInput
                            id="jobTitle"
                            label="Job Title/ Designation"
                            required
                            placeholder="Enter job title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            inputClassName="text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <TextInput
                            id="companyName"
                            label="Company Name"
                            required
                            placeholder="Enter company name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            inputClassName="text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] sm:text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Employment type <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                value={formData.employmentType}
                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm"
                            >
                                {employmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Description <span className="text-red-500">*</span></label>
                    <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium min-h-[200px] text-sm placeholder:text-gray-400"
                        placeholder="Enter job description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div className="col-span-2 md:col-span-1">
                        <TextInput
                            id="keySkills"
                            label="Key Skills"
                            required
                            placeholder="Eg: Java, Python"
                            value={formData.keySkills}
                            onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
                            inputClassName="text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <TextInput
                            id="department"
                            label="Department"
                            required
                            placeholder="Eg: Sales, IT"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            inputClassName="text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div>
                        <label className="block text-[10px] sm:text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Work Experience <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 md:gap-4 items-center">
                            <div className="flex-1 relative">
                                <input
                                    type="number"
                                    placeholder="Eg: 4"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-900 placeholder:text-gray-400"
                                    value={formData.workExperienceMin}
                                    onChange={(e) => setFormData({ ...formData, workExperienceMin: e.target.value })}
                                />
                            </div>
                            <span className="text-gray-400 font-medium text-xs">To</span>
                            <div className="flex-1 relative">
                                <input
                                    type="number"
                                    placeholder="Eg: 8"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-900 placeholder:text-gray-400"
                                    value={formData.workExperienceMax}
                                    onChange={(e) => setFormData({ ...formData, workExperienceMax: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Work Mode <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                value={formData.workMode}
                                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm"
                            >
                                {workModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                            </select>
                            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div className="relative">
                        <TextInput
                            id="not-location"
                            label="Location"
                            placeholder="Delhi NCR"
                            value={formData.locationPreference}
                            onChange={(e) => setFormData({ ...formData, locationPreference: e.target.value })}
                            inputClassName="text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Joining Date <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                value={formData.noticePeriod}
                                onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm"
                            >
                                {noticePeriods.map(period => <option key={period} value={period}>{period}</option>)}
                            </select>
                            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-[10px] sm:text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Annual Salary range <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 md:gap-4 items-center max-w-sm">
                        <div className="flex-1 relative">
                            <input
                                type="number"
                                placeholder="Eg: 400000"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-900 placeholder:text-gray-400"
                                value={formData.salaryMin}
                                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                            />
                            {/* <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] md:text-xs">Lpa</span> */}
                        </div>
                        <span className="text-gray-400 font-medium text-xs">To</span>
                        <div className="flex-1 relative">
                            <input
                                type="number"
                                placeholder="Eg: 800000"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-900 placeholder:text-gray-400"
                                value={formData.salaryMax}
                                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                            />
                            {/* <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] md:text-xs">Lpa</span> */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Screening Questions */}
            <section className="mb-10">
                <h2 className="text-sm lg:text-lg font-medium text-[#9333ea] mb-4 lg:mb-6">Screening Questions</h2>
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Add Screening Questions</label>
                    {formData.screeningQuestions.slice(0, 3).map((question: string, index: number) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder={`Enter your question`}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium placeholder:text-gray-400 text-sm"
                                value={question}
                                onChange={(e) => handleQuestionChange(index, e.target.value)}
                            />
                            {formData.screeningQuestions.length > 1 && (
                                <button type="button" onClick={() => removeQuestion(index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100">
                                    <FiX size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addQuestion}
                        type="button"
                        className={`w-full py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${formData.screeningQuestions.length >= 3 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#f3e8ff] text-[#9333ea] hover:bg-[#ebd5ff]'}`}
                        disabled={formData.screeningQuestions.length >= 3}
                    >
                        <FiPlus size={18} /> {formData.screeningQuestions.length >= 3 ? 'Maximum 3 Questions' : 'Add More Question'}
                    </button>
                </div>
            </section>

            {/* Location Details */}
            <section className="mb-10">
                <h2 className="text-sm lg:text-lg font-medium text-[#9333ea] mb-4 lg:mb-6">Location Details</h2>
                <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-gray-700">Enable Map Selection</span>
                    <button
                        type="button"
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.enableGoogleMap ? 'bg-[#9333ea]' : 'bg-gray-200'}`}
                        onClick={() => setFormData({ ...formData, enableGoogleMap: !formData.enableGoogleMap })}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.enableGoogleMap ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {formData.enableGoogleMap && (
                    <div className="mb-6">
                        <LocationPicker
                            initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                            initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
                            initialLocation={formData.fullAddress}
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>
                )}

                <div className="space-y-6">
                    <TextInput
                        id="fullAddress"
                        label="Full Address"
                        required
                        placeholder="Enter job location"
                        helperText="Enter the full address if it's not available on the map"
                        value={formData.fullAddress}
                        onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                        rightIcon={<FiChevronDown className="text-gray-400" />}
                        inputClassName="text-gray-900 placeholder:text-gray-400"
                    />

                    <input
                        placeholder="Street/area/locality here..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm placeholder:text-gray-400"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="relative">
                            <select
                                value={selectedCountryCode}
                                onChange={handleCountryChange}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm"
                            >
                                <option value="">Select Country</option>
                                {countries.map(country => (
                                    <option key={country.code} value={country.code}>{country.name}</option>
                                ))}
                            </select>
                            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={selectedStateCode}
                                onChange={handleStateChange}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm"
                                disabled={availableStates.length === 0}
                            >
                                <option value="">Select State</option>
                                {availableStates.map(state => (
                                    <option key={state.code} value={state.code}>{state.name}</option>
                                ))}
                            </select>
                            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>


                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="relative">
                            <select
                                value={formData.city}
                                onChange={handleCityChange}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm"
                                disabled={availableCities.length === 0}
                            >
                                <option value="">Select City</option>
                                {availableCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <input
                            placeholder="Pin Code"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm placeholder:text-gray-400"
                            value={formData.pinCode}
                            onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                        />
                    </div>



                </div>
            </section>

            {/* Application Settings */}
            <section className="mb-10">
                <h2 className="text-sm lg:text-lg font-medium text-[#9333ea] mb-4 lg:mb-6">Application Preferences</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receive Applications Via<span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select
                            value={formData.receiveApplicationsVia}
                            onChange={(e) => setFormData({ ...formData, receiveApplicationsVia: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium text-sm"
                        >
                            {receiveViaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </section>
            {/* Terms and Conditions Checkbox */}
            <div className="mt-6 flex flex-col items-start gap-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-[#9333ea]/30 text-[#9333ea] focus:ring-[#9333ea] cursor-pointer transition-all appearance-none checked:bg-[#9333ea] checked:border-[#9333ea]"
                        />
                        {acceptTerms && (
                            <FiCheck className="absolute text-white pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={14} />
                        )}
                    </div>
                    <span className="text-sm text-gray-600 select-none">
                        I agree to the{' '}
                        <button
                            type="button"
                            onClick={fetchTermsContent}
                            className="text-[#9333ea] font-bold hover:underline"
                        >
                            {isLoadingTerms ? 'Loading...' : 'Job Posting Terms & Conditions'}
                        </button>
                    </span>
                </label>
                {errors.terms && (
                    <p className="text-xs text-red-500 font-medium ml-8">{errors.terms[0]}</p>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pb-4">

                <div className="text-center md:text-left w-full md:w-auto order-3 md:md:order-1">
                    <button
                        onClick={onCancel}
                        className="text-gray-500 text-sm font-medium hover:text-gray-900 transition-colors px-4 py-2"
                    >
                        Cancel
                    </button>
                </div>

                <div className="flex gap-4 w-full md:w-auto order-1 md:order-2">
                    <button
                        type="button"
                        className="flex-1 md:flex-none px-8 py-2.5 rounded-full border border-[#9333ea] text-[#9333ea] font-bold hover:bg-purple-50 transition-colors text-sm"
                        onClick={() => setShowPreview(true)}
                    >
                        Preview Job
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 md:flex-none px-8 py-2.5 rounded-full bg-[#9333ea] text-white font-bold hover:bg-[#7e22ce] transition-colors shadow-lg shadow-purple-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Posting...' : (initialData ? 'Update Job' : 'Post Job')}
                    </button>
                </div>

                {/* Preview Modal */}
                {showPreview && (
                    <JobPreviewModal formData={formData} onClose={() => setShowPreview(false)} />
                )}

            </div>



            {/* Terms Modal */}
            {mounted && showTermsModal && cmsContent && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowTermsModal(false)}>
                    <div
                        className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
                            <h2 className="text-xl font-bold text-gray-900">{cmsContent.title}</h2>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="p-6 md:p-10 overflow-y-auto prose prose-purple max-w-none scroll-smooth custom-scrollbar">
                            <div
                                className="text-gray-600 leading-relaxed space-y-4"
                                dangerouslySetInnerHTML={{ __html: cmsContent.content }}
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white rounded-b-3xl">
                            <button
                                onClick={() => {
                                    setAcceptTerms(true);
                                    setShowTermsModal(false);
                                }}
                                className="px-8 py-2.5 rounded-full bg-[#9333ea] text-white font-bold hover:bg-[#7e22ce] transition-colors shadow-lg shadow-purple-200"
                            >
                                I Understand & Agree
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </form>
    );
}

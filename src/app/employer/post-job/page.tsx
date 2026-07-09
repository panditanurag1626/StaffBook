'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Users, Calendar } from 'lucide-react';
import { jobService, type CreateJobPostRequest } from '@/lib/api';
import { withEmployerMode } from '@/context/UserModeContext';
import ProfileLayout from '@/components/shared/ProfileLayout';
import toast from 'react-hot-toast';

function PostJobPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateJobPostRequest>({
        name: '',
        department: '',
        jobposttype: 'Own Company',
        city: '',
        pincode: '',
        state: '',
        country: 'India',
        jobtype: 'Full Time',
        jobtitle: '',
        nightship: 0,
        joblocation: 'Office',
        maplocation: 0,
        address: '',
        area: '',
        paytype: 'Fixed Only',
        minimumfixedsalary: '',
        maximumfixedsalary: 0,
        jobdescription: '',
        nationality: 'Indian',
        minimumeducation: '',
        gender: 'Any',
        agecriteria: 'No',
        minimumexperience: '',
        englishlevel: 'Basic',
        regionallanguage: 'No',
        skills: '',
        accommodationandfoodfacility: 'No',
        interviewmethod: 'In-Person',
        applicationmanagement: 'Email',
        status: 10,
        educationdiplomadegree: '',
        hirenoofposition: 1,
        noofposition: 1,
    });

    const handleChange = (field: keyof CreateJobPostRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await jobService.createJobPost(formData);

            if (response.status === 200) {
                toast.success('Job posted successfully!');
                router.push('/employer/my-jobs');
            }
        } catch (err: any) {
            console.error('Error posting job:', err);
            setError(err.response?.data?.message || 'Failed to post job');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
                    <p className="text-gray-600">Fill in the details to create a job posting</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Briefcase size={24} className="text-purple-600" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.jobtitle}
                                    onChange={(e) => handleChange('jobtitle', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="e.g. Software Engineer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="Your company name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="e.g. IT, HR, Sales"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.jobtype}
                                    onChange={(e) => handleChange('jobtype', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                >
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Location <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.joblocation}
                                    onChange={(e) => handleChange('joblocation', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                >
                                    <option value="Office">Office</option>
                                    <option value="Work From Home">Work From Home</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Positions <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.noofposition}
                                    onChange={(e) => handleChange('noofposition', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={24} className="text-purple-600" />
                            Location
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.state}
                                    onChange={(e) => handleChange('state', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pincode <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.pincode}
                                    onChange={(e) => handleChange('pincode', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Area
                                </label>
                                <input
                                    type="text"
                                    value={formData.area}
                                    onChange={(e) => handleChange('area', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Salary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign size={24} className="text-purple-600" />
                            Salary
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Salary (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.minimumfixedsalary}
                                    onChange={(e) => handleChange('minimumfixedsalary', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="e.g. 30000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Salary (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.maximumfixedsalary}
                                    onChange={(e) => handleChange('maximumfixedsalary', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="e.g. 50000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users size={24} className="text-purple-600" />
                            Requirements
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Education <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.minimumeducation}
                                    onChange={(e) => handleChange('minimumeducation', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="e.g. B.Tech, MBA"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Experience <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.minimumexperience}
                                    onChange={(e) => handleChange('minimumexperience', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="e.g. 2 years, Fresher"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender Preference
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                >
                                    <option value="Any">Any</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    English Level
                                </label>
                                <select
                                    value={formData.englishlevel}
                                    onChange={(e) => handleChange('englishlevel', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                >
                                    <option value="Basic">Basic</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Fluent">Fluent</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Required Skills <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.skills}
                                    onChange={(e) => handleChange('skills', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="e.g. React, Node.js, TypeScript (comma separated)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>

                        <textarea
                            required
                            value={formData.jobdescription}
                            onChange={(e) => handleChange('jobdescription', e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                            placeholder="Describe the job role, responsibilities, and what you're looking for..."
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Posting Job...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    );
}

export default withEmployerMode(PostJobPage);

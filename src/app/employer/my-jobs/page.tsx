'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Eye, MapPin, DollarSign, Users, Calendar } from 'lucide-react';
import { jobService, type JobPost } from '@/lib/api';
import { withEmployerMode } from '@/context/UserModeContext';
import ProfileLayout from '@/components/shared/ProfileLayout';
import toast from 'react-hot-toast';

function MyJobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchMyJobs();
    }, [page]);

    const fetchMyJobs = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await jobService.getMyJobPosts(page);

            if (response.status === 200) {
                setJobs(response.data.items || []);
                setTotalPages(response.data._meta?.pageCount || 1);
            }
        } catch (err: any) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load your jobs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (jobId: number) => {
        if (!confirm('Are you sure you want to delete this job posting?')) {
            return;
        }

        try {
            await jobService.deleteJobPost(jobId);
            toast.success('Job deleted successfully!');
            fetchMyJobs(); // Refresh list
        } catch (err) {
            console.error('Error deleting job:', err);
            toast.error('Failed to delete job');
        }
    };

    if (isLoading && jobs.length === 0) {
        return (
            <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </ProfileLayout>
        );
    }

    return (
        <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Job Postings</h1>
                        <p className="text-gray-600">Manage your job listings</p>
                    </div>
                    <button
                        onClick={() => router.push('/employer/post-job')}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Post New Job</span>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Jobs</p>
                                <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Active Jobs</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {jobs.filter(j => j.status === "Active").length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Eye className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Positions</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {jobs.reduce((sum, j) => sum + 2, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jobs List */}
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{job.jobtitle}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === "Active"
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {job.status === "Active" ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{job.name}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} />
                                            <span>{job.city}, {job.state}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={16} />
                                            <span>₹{job.minimumfixedsalary} - ₹{job.maximumfixedsalary}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users size={16} />
                                            <span>2 positions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            <span>{job.jobtype}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => router.push(`/jobs/${job.id}`)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <Eye size={20} className="text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => router.push(`/employer/edit-job/${job.id}`)}
                                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={20} className="text-purple-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} className="text-red-600" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-2">{job.jobdescription}</p>

                            <div className="flex flex-wrap gap-2">
                                {job.key_skills?.split(',').slice(0, 5).map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                                    >
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>

                            {/* Applications Count (if available) */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Applications received</span>
                                    <span className="font-semibold text-purple-600">
                                        {/* This would come from API - placeholder for now */}
                                        View Applications →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {jobs.length === 0 && !isLoading && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Users size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg mb-2">No job postings yet</p>
                        <p className="text-gray-400 text-sm mb-6">
                            Start by posting your first job
                        </p>
                        <button
                            onClick={() => router.push('/employer/post-job')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus size={20} />
                            <span>Post Your First Job</span>
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </ProfileLayout>
    );
}

export default withEmployerMode(MyJobsPage);

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileLayout from '@/components/shared/ProfileLayout';
import { THEME } from '@/styles/theme';
import { FiDownload, FiFolder, FiCalendar, FiUsers, FiTrash2, FiExternalLink, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { jobService } from '@/lib/api/services/jobService';

interface DownloadRecord {
    job_post_id: number;
    job_title: string;
    company_name: string;
    location: string;
    employment_type: string;
    work_mode: string;
    status: string;
    total_applicants: number;
    total_resume_size_bytes: number;
    total_resume_size_text: string;
    candidates_name: string[];
    candidates: {
        application_id: number;
        candidate_id: number;
        candidate_name: string;
        applied_at: number;
        applied_at_formatted: string;
        status: number;
        status_text: string;
        resume_url: string;
    }[];
    created_at: number;
    updated_at: number;
}

export default function DownloadsPage({ searchParams }: { searchParams: { job_post_id?: string } }) {
    const router = useRouter();
    const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDownloads();
    }, []);

    const fetchDownloads = async () => {
        try {
            setLoading(true);
            const res = await jobService.getEmployerJobPostsWithApplicants();
            if (res.data?.data?.items) {
                setDownloads(res.data.data.items);
            }
        } catch (error) {
            console.error('Failed to fetch downloads', error);
            toast.error('Failed to fetch download history');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this download record?')) {
            setDownloads(prev => prev.filter(d => d.job_post_id !== id));
            toast.success('Record deleted from view');
        }
    };

    const handleReDownload = async (record: DownloadRecord) => {
        try {
            toast.loading('Preparing download...', { id: 'download' });
            const applicationIds = record.candidates.map(c => c.application_id);
            if (applicationIds.length === 0) {
                toast.error('No resumes to download', { id: 'download' });
                return;
            }

            const res = await jobService.downloadBulkResume(record.job_post_id, applicationIds);
            if (res.data?.data?.zip_download?.zip_file_url) {
                const link = document.createElement("a");
                link.href = res.data.data.zip_download.zip_file_url;
                link.download = `${record.job_title}_resumes.zip`;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Download started', { id: 'download' });
            } else {
                throw new Error('No download URL available');
            }
        } catch (err) {
            console.error("Download failed", err);
            toast.error("Download failed to initiate.", { id: 'download' });
        }
    };

    const handleViewFolder = (record: DownloadRecord) => {
        router.push(`/profile/downloads/${record.job_post_id}`);
    };

    return (
        <div className={`min-h-[calc(100vh-80px)] ${THEME.colors.background.page} py-8`}>
            <div className="max-w-6xl mx-auto px-3 sm:px-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="font-semibold text-xs sm:text-sm text-gray-700 tracking-tight mb-1">
                        Downloaded Resumes
                    </h1>
                    <p className="text-gray-500 text-xs">
                        View and manage downloaded resumes
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div
                        onClick={() => router.push('/profile/manage-jobs')}
                        className="bg-white rounded-2xl border border-gray-100/50 p-6 shadow-sm hover:shadow-md hover:border-purple-100 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                <FiFolder className="text-purple-500" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-xs sm:text-sm text-gray-400 mb-0.5">Total Job Posts</p>
                                <p className="font-semibold text-xs sm:text-sm text-gray-700">{downloads.length}</p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => router.push('/profile/downloads')}
                        className="bg-white rounded-2xl border border-gray-100/50 p-6 shadow-sm hover:shadow-md hover:border-purple-100 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <FiFileText className="text-blue-500" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-xs sm:text-sm text-gray-400 mb-0.5">Resumes Downloaded</p>
                                <p className="font-semibold text-xs sm:text-sm text-gray-700">
                                    {downloads.reduce((sum, d) => sum + d.total_applicants, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => router.push('/profile/downloads')}
                        className="bg-white rounded-2xl border border-gray-100/50 p-6 shadow-sm hover:shadow-md hover:border-purple-100 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <FiDownload className="text-green-500" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-xs sm:text-sm text-gray-400 mb-0.5">Storage Used</p>
                                <p className="font-semibold text-xs sm:text-sm text-gray-700">
                                    {(downloads.reduce((sum, d) => sum + (d.total_resume_size_bytes || 0), 0) / (1024 * 1024)).toFixed(1)} MB
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download History */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-xs sm:text-sm text-gray-700 mb-3">Resume Download History
                    </h2>

                    {loading ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-500">Loading history...</p>
                        </div>
                    ) : downloads.length > 0 ? (
                        downloads.map((record) => (
                            <div
                                key={record.job_post_id}
                                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                    {/* Left Section - Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 mt-1">
                                                <FiFolder className="text-purple-600" size={24} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-xs sm:text-sm text-gray-700 mb-1 truncate break-words max-w-full">
                                                    {record.job_title}
                                                </h3>
                                                {/* <p className="text-sm text-gray-500 font-mono mb-3 truncate w-full" title={record.job_title}>
                                                    batch_{record.job_post_id}
                                                </p> */}

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <FiCalendar size={14} className="text-gray-400" />
                                                        <span>{new Date(record.created_at * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <FiUsers size={14} className="text-gray-400" />
                                                        <span>{record.total_applicants} resumes</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <FiDownload size={14} className="text-gray-400" />
                                                        <span>{record.total_resume_size_text}</span>
                                                    </div>
                                                </div>

                                                {/* Candidate List */}
                                                {/* <div className="mt-4 flex flex-wrap gap-2">
                                                    {record.candidates_name.map((name, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[11px] font-medium rounded-lg border border-gray-100"
                                                        >
                                                            {name}
                                                        </span>
                                                    ))}
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Actions */}
                                    <div className="flex flex-row md:flex-col gap-2 flex-wrap w-full md:w-auto">
                                        <button
                                            onClick={() => handleViewFolder(record)}
                                            className="flex-1 md:flex-none justify-center px-4 md:px-5 py-2 md:py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs md:text-sm rounded-full transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                                        >
                                            <FiExternalLink size={14} />
                                            Open Folder
                                        </button>

                                        <button
                                            onClick={() => handleReDownload(record)}
                                            className="flex-1 md:flex-none justify-center px-4 md:px-5 py-2 md:py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs md:text-sm rounded-full transition-all duration-300 flex items-center gap-2 border border-gray-200"
                                        >
                                            <FiDownload size={14} />
                                            Download Folder
                                        </button>

                                        <button
                                            onClick={() => handleDelete(record.job_post_id)}
                                            className="flex-1 md:flex-none justify-center px-4 md:px-5 py-2 md:py-2.5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 font-semibold text-xs md:text-sm rounded-full transition-all duration-300 flex items-center gap-2 border border-gray-100 hover:border-red-100"
                                        >
                                            <FiTrash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiDownload size={40} className="text-gray-300" />
                            </div>
                            <h3 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">No downloads yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                When you download candidate resumes, they will appear here with organized folders.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

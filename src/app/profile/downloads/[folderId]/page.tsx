'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProfileLayout from '@/components/shared/ProfileLayout';
import Modal from '@/components/shared/Modal';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@/styles/theme';
import {
    FiArrowLeft,
    FiDownload,
    FiFile,
    FiCalendar,
    FiUser,
    FiFolder,
    FiCheck,
    FiX,
    FiEye,
    FiShare2,
    FiLoader
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { jobService } from '@/lib/api/services/jobService';

interface Candidate {
    application_id: number;
    applied_at: number;
    applied_at_formatted: string;
    status: number;
    status_text: string;
    status_badge: string;
    cover_letter: string | null;
    resume_file: string;
    resume_url: string;
    resume_file_size_bytes: number;
    resume_file_size_text: string;
    applicant: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        picture: string;
    };
}

interface FolderData {
    success: boolean;
    job_details: {
        id: number;
        title: string;
        company: string;
        location: string;
        employment_type: string;
        work_mode: string;
        posted_at: string;
        status: string;
    };
    data: {
        items: Candidate[];
        pagination: {
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    };
    statistics: {
        total_applications: number;
        total_resume_size_bytes: number;
        total_resume_size_text: string;
    };
}

export default function FolderViewPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const folderId = params.folderId as string;
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [folderData, setFolderData] = useState<FolderData | null>(null);
    const [isExcelDownloading, setIsExcelDownloading] = useState(false);
    const [previewFile, setPreviewFile] = useState<Candidate | null>(null);

    const isPlanExpired = (expiryDate: string | undefined | null) => {
        if (!expiryDate) return true;
        const now = new Date();
        const expiry = new Date(expiryDate);
        return now > expiry;
    };

    const balance = user?.user_balance_employer;
    const isSubscriptionActive = !!balance?.plan_name && !isPlanExpired(balance?.plan_expiry_date);

    useEffect(() => {
        fetchFolderData();
    }, [folderId]);

    const fetchFolderData = async () => {
        try {
            setLoading(true);
            const res = await jobService.getEmployerJobPostsWithApplicants(folderId);
            if (res.data.success) {
                setFolderData(res.data as unknown as FolderData);
            } else {
                setFolderData(null);
            }
        } catch (error) {
            console.error('Failed to fetch folder data', error);
            toast.error('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const handleShareFile = (file: Candidate) => {
        if (!isSubscriptionActive) return;
        const profileUrl = `${window.location.origin}/profile/find-candidates/${file.applicant.id}`;
        if (navigator.share) {
            navigator.share({
                title: `${file.applicant.first_name} ${file.applicant.last_name}`,
                text: `Check out ${file.applicant.first_name} ${file.applicant.last_name}'s profile`,
                url: profileUrl,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(profileUrl);
            toast.success(`Profile link copied to clipboard!`);
        }
    };

    const handleSelectFile = (applicationId: number) => {
        setSelectedFiles(prev =>
            prev.includes(applicationId)
                ? prev.filter(id => id !== applicationId)
                : [...prev, applicationId]
        );
    };

    const handleSelectAll = () => {
        if (!folderData) return;
        if (selectedFiles.length === folderData.data.items.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(folderData.data.items.map(r => r.application_id));
        }
    };

    const handleDownloadSelected = async () => {
        if (!folderData) return;
        try {
            toast.loading('Preparing bulk download...', { id: 'bulk-download' });
            const res = await jobService.downloadBulkResume(folderData.job_details.id, selectedFiles);
            if (res.data?.data?.zip_download?.zip_file_url) {
                const link = document.createElement("a");
                link.href = res.data.data.zip_download.zip_file_url;
                link.download = `${folderData.job_details.title}_resumes.zip`;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Download started', { id: 'bulk-download' });
            } else {
                throw new Error('No download URL available');
            }
        } catch (error) {
            console.error('Bulk download failed', error);
            toast.error('Failed to prepare bulk download', { id: 'bulk-download' });
        }
    };

    const handleDownloadExcel = async () => {
        if (!folderData || isExcelDownloading || selectedFiles.length === 0) return;
        setIsExcelDownloading(true);
        try {
            toast.loading('Generating Excel...', { id: 'excel-download' });
            const response = await jobService.downloadSelectedApplicantsExcel(folderData.job_details.id, selectedFiles);
            const downloadUrl = response?.data?.data?.download_url ||
                response?.data?.data?.excel_file_url ||
                response?.data?.download_url ||
                response?.data?.excel_file_url ||
                response?.download_url ||
                response?.excel_file_url;

            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
                toast.success('Excel downloaded successfully', { id: 'excel-download' });
                setSelectedFiles([]);
            } else if (response?.data?.scheme_url) {
                window.open(response.data.scheme_url, '_blank');
                toast.success('Excel downloaded successfully', { id: 'excel-download' });
                setSelectedFiles([]);
            } else {
                toast.error(response?.message || response?.data?.message || 'Failed to generate Excel', { id: 'excel-download' });
            }
        } catch (error: any) {
            console.error('Excel download error:', error);
            const errMsg = error?.response?.data?.message || error?.message || 'Failed to download Excel';
            toast.error(errMsg, { id: 'excel-download' });
        } finally {
            setIsExcelDownloading(false);
        }
    };

    const handleDownloadFile = (file: Candidate) => {
        if (!isSubscriptionActive) return;
        toast.success(`Downloading: ${file.applicant.first_name}'s resume`);
        const link = document.createElement("a");
        link.href = file.resume_url;
        link.download = file.resume_file;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleViewFile = (file: Candidate) => {
        if (!isSubscriptionActive) return;
        setPreviewFile(file);
    };

    const closePreview = () => setPreviewFile(null);

    if (loading) {
        return (
            <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
                <div className="flex flex-col items-center justify-center min-h-screen gap-3">
                    <FiLoader className="text-purple-600 animate-spin" size={36} />
                    <p className="text-gray-400 font-medium">Loading application details...</p>
                </div>
            </ProfileLayout>
        );
    }

    if (!folderData || !folderData.job_details) {
        return (
            <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
                <div className={`min-h-screen ${THEME.colors.background.page} pt-8 pb-20`}>
                    <div className="max-w-6xl mx-auto px-3 sm:px-6">
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <FiFolder className="text-gray-200 mx-auto mb-4" size={64} />
                            <h2 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">Applications Not Found</h2>
                            <p className="text-gray-500 mb-8">We couldn't find the application data for this job post.</p>
                            <button
                                onClick={() => router.push('/profile/downloads')}
                                className="px-6 py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors"
                            >
                                Back to Downloads
                            </button>
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        );
    }

    return (
        <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
            <div className={`min-h-screen ${THEME.colors.background.page} pt-8 pb-20`}>
                <div className="max-w-6xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/profile/downloads')}
                            className="flex items-center gap-2 text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors group mb-6"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to Downloads
                        </button>

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <FiFolder className="text-purple-500" size={28} />
                                </div>
                                <div>
                                    <h1 className="font-semibold text-xs sm:text-sm text-gray-700 tracking-tight mb-1">
                                        {folderData.job_details.title}
                                    </h1>
                                    {/* <p className="text-sm text-gray-500 font-mono mb-3">
                                        batch_{folderData.job_details.id}
                                    </p> */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <FiCalendar size={14} className="text-gray-400" />
                                            <span>Posted {new Date(folderData.job_details.posted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FiFile size={14} className="text-gray-400" />
                                            <span>{folderData.statistics.total_applications} candidate CVs</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FiDownload size={14} className="text-gray-400" />
                                            <span>{folderData.statistics.total_resume_size_text}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bulk Actions */}
                            {selectedFiles.length > 0 && (
                                <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/50 px-4 py-2 flex items-center gap-4 transition-all duration-300 animate-in slide-in-from-right-4">
                                    <div className="flex items-center gap-2 pl-1 border-r border-gray-200 pr-4">
                                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                                            <span className="text-purple-600 font-bold text-[10px]">{selectedFiles.length}</span>
                                        </div>
                                        <span className="font-semibold text-gray-700 text-sm whitespace-nowrap">
                                            {selectedFiles.length} selected
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleDownloadSelected}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md"
                                        >
                                            <FiDownload size={14} />
                                            Download Resume
                                        </button>

                                        <button
                                            onClick={handleDownloadExcel}
                                            disabled={isExcelDownloading}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiDownload size={14} />
                                            {isExcelDownloading ? 'Processing...' : 'Download Excel'}
                                        </button>

                                        <button
                                            onClick={() => setSelectedFiles([])}
                                            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ml-1"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File List Header */}
                    <div className="bg-white rounded-t-2xl border border-gray-100 px-4 md:px-6 py-3 md:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                checked={selectedFiles.length === folderData.data.items.length && folderData.data.items.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className="text-xs md:text-sm font-bold text-gray-600">
                                {selectedFiles.length > 0 ? `${selectedFiles.length} of ${folderData.data.items.length}` : 'Select All Candidates'}
                            </span>
                        </div>
                        <div className="hidden lg:flex items-center justify-between lg:justify-end gap-2 lg:gap-6 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span>Size</span>
                            <span>Applied Date</span>
                            <span className="w-16 lg:w-auto text-right">Actions</span>
                        </div>
                    </div>

                    {/* File List */}
                    <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100 divide-y divide-gray-50 shadow-sm overflow-hidden">
                        {folderData.data.items.map((file) => (
                            <div
                                key={file.application_id}
                                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${selectedFiles.includes(file.application_id) ? 'bg-purple-50/50' : ''
                                    }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                                    {/* Left - Checkbox + User Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.includes(file.application_id)}
                                            onChange={() => handleSelectFile(file.application_id)}
                                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                        />

                                        <div className="flex items-center gap-3 flex-1">
                                            {file.applicant.picture ? (
                                                <img
                                                    src={file.applicant.picture}
                                                    alt={file.applicant.first_name}
                                                    className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-purple-200/20">
                                                    <FiUser className="text-white" size={20} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">
                                                    {file.resume_file}
                                                </p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate">
                                                    <FiUser size={12} />
                                                    {file.applicant.first_name} {file.applicant.last_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right - Details + Actions */}
                                    <div className="flex items-center justify-between lg:justify-end gap-2 lg:gap-6 pl-9 lg:pl-0">
                                        <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{file.resume_file_size_text}</span>
                                        <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">{file.applied_at_formatted}</span>

                                        <div className="flex items-center justify-end gap-1 md:gap-2">
                                            <button
                                                onClick={() => handleViewFile(file)}
                                                disabled={!isSubscriptionActive}
                                                className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                    isSubscriptionActive
                                                        ? 'hover:bg-purple-50 text-gray-400 hover:text-purple-600'
                                                        : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                                title={isSubscriptionActive ? 'View Resume' : 'Subscription required'}
                                            >
                                                <FiEye size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadFile(file)}
                                                disabled={!isSubscriptionActive}
                                                className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                    isSubscriptionActive
                                                        ? 'hover:bg-purple-50 text-gray-400 hover:text-purple-600'
                                                        : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                                title={isSubscriptionActive ? 'Download Resume' : 'Subscription required'}
                                            >
                                                <FiDownload size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleShareFile(file)}
                                                disabled={!isSubscriptionActive}
                                                className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                    isSubscriptionActive
                                                        ? 'hover:bg-purple-50 text-gray-400 hover:text-purple-600'
                                                        : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                                title={isSubscriptionActive ? 'Share Profile Link' : 'Subscription required'}
                                            >
                                                <FiShare2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination or Empty State inside list */}
                        {folderData.data.items.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiUser size={40} className="text-gray-300" />
                                </div>
                                <h3 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">No candidates found</h3>
                                <p className="text-gray-500">
                                    There are no applicants for this job post yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Resume Preview Modal */}
            <Modal open={!!previewFile} onClose={closePreview}>
                <div className="w-screen max-w-5xl max-h-[90vh] overflow-hidden">
                    {previewFile && (
                        <div className="flex flex-col h-full">
                            {/* Header with padding to avoid overlap with Modal close button */}
                            <div className="flex items-center justify-between pt-4 sm:pt-3 pr-14 pl-6 pb-3 border-b border-gray-100">
                                <div className="min-w-0 flex-1 mr-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                        {previewFile.applicant.first_name} {previewFile.applicant.last_name}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate">{previewFile.resume_file}</p>
                                </div>
                                <a
                                    href={isSubscriptionActive ? previewFile.resume_url : '#'}
                                    target={isSubscriptionActive ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    onClick={e => { if (!isSubscriptionActive) e.preventDefault(); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors shrink-0 ${
                                        isSubscriptionActive
                                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <FiDownload size={14} />
                                    Download
                                </a>
                            </div>
                            {/* Preview content */}
                            <div className="flex-1 overflow-hidden">
                                {previewFile.resume_url.match(/\.(pdf|docx?)$/i) ? (
                                    <iframe
                                        src={previewFile.resume_url}
                                        className="w-full h-[calc(90vh-60px)] rounded-lg border-0"
                                        title="Resume Preview"
                                    />
                                ) : previewFile.resume_url.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                                    <div className="w-full h-[calc(90vh-60px)] flex items-center justify-center bg-gray-50 p-4">
                                        <img
                                            src={previewFile.resume_url}
                                            alt="Resume preview"
                                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-[calc(90vh-60px)] flex items-center justify-center bg-gray-50">
                                        <div className="text-center p-8">
                                            <FiFile size={40} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium mb-2">Preview not available for this file format</p>
                                            <p className="text-gray-400 text-sm mb-4">Please download the file to view it.</p>
                                            <a
                                                href={isSubscriptionActive ? previewFile.resume_url : '#'}
                                                target={isSubscriptionActive ? '_blank' : undefined}
                                                rel="noopener noreferrer"
                                                onClick={e => { if (!isSubscriptionActive) e.preventDefault(); }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                <FiDownload size={14} />
                                                Download File
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </ProfileLayout>
    );
}


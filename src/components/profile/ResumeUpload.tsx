
import React, { useState } from 'react';
import { UploadCloud, CheckCircle, Loader2, Download, Trash2 } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import { THEME } from '../../styles/theme';
import { formatDateTime } from '@/lib/utils';
import type { UserProfile } from '@/lib/api/types';
import { userService, jobService } from '@/lib/api';
import toast from 'react-hot-toast';

interface ResumeUploadProps {
  profileData?: UserProfile | null;
  readOnly?: boolean;
}

export default function ResumeUpload({ profileData, readOnly = false }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploading(true);
        await userService.uploadResume(file);

        toast.success('Resume uploaded successfully!');
        window.location.reload();
      } catch (err) {
        toast.error('Failed to upload resume.');
      } finally {
        setUploading(false);
      }
    }
  };

  const resumeUrl = profileData?.resumeUrl || (profileData as any)?.resume_upload || (profileData as any)?.resumeUpload || null;

  const handleDownload = async () => {
    if (resumeUrl) {
      if (readOnly) {
        try {
          await jobService.downloadCandidateResume(null, profileData?.id ?? '');
        } catch (error) {
          console.error("Error tracking resume download:", error);
        }
      }

      const a = document.createElement('a');
      a.href = resumeUrl;
      a.download = 'resume';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your resume?')) {
      try {
        setUploading(true);
        await userService.deleteResume();
        toast.success('Resume deleted successfully!');
        window.location.reload();
      } catch (err) {
        console.error("Delete resume error:", err);
        toast.error('Failed to delete resume.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div id="resume" className={`${THEME.components.card.default} flex flex-col gap-3`}>
      <div className="flex items-center justify-between w-full">
        <h2 className={THEME.components.typography.sectionTitle}>
          {SITE_CONFIG.resume.section} <span className="text-red-500 text-sm font-normal ml-1">{SITE_CONFIG.resume.required}</span>
        </h2>
      </div>

      {!readOnly && <label className="border-2 border-dashed border-purple-200 rounded-xl p-4 flex items-center gap-4 bg-purple-50/30 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer group">
        <input
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <div className="p-3 rounded-full bg-white shadow-sm shrink-0">
              <Loader2 size={20} className="animate-spin text-purple-600" />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              Uploading...
            </span>
          </>
        ) : (
          <>
            <div className="p-3 rounded-full bg-white shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-700 mb-0.5 group-hover:text-purple-800 transition-colors">{SITE_CONFIG.resume.upload}</p>
              <p className="text-xs text-gray-500">{SITE_CONFIG.resume.helper}</p>
            </div>
          </>
        )}
      </label>
      }
      {resumeUrl && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-green-50/50 border border-green-100">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
              <CheckCircle size={18} />
              Resume
            </div>
            {(profileData as any).resume_uploaded_at && (
              <p className="text-xs text-green-600/80 font-medium">
                Uploaded On: {formatDateTime((profileData as any).resume_uploaded_at)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={uploading}
              className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:text-purple-600 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
            </button>
            {!readOnly &&
              <button
                onClick={handleDelete}
                disabled={uploading}
                className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            }
          </div>
        </div>
      )}
    </div>
  );
}

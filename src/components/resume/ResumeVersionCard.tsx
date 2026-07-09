import React from 'react';
import { FiFileText, FiCalendar, FiEdit3, FiTrash2, FiDownload } from 'react-icons/fi';

interface ResumeVersion {
  id: string;
  name: string;
  lastModified: string;
  views: number;
  downloads: number;
  isDefault: boolean;
  template: string;
  size: string;
  atsScore?: number;
}

interface ResumeVersionCardProps {
  resume: ResumeVersion;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
  if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

const ResumeVersionCard: React.FC<ResumeVersionCardProps> = ({ resume, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group flex flex-col">
      <div className="p-4 flex-1 flex flex-col items-center text-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
          <FiFileText className="w-5 h-5 text-purple-600" />
        </div>

        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
          {resume.name}
        </h4>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <FiCalendar size={11} />
          {resume.lastModified}
          <span>•</span>
          {resume.size}
        </div>

        {resume.atsScore !== undefined && (
          <div className={`px-2.5 py-1 rounded-md border text-[11px] font-bold ${getScoreColor(resume.atsScore)}`}>
            ATS {resume.atsScore}/100
          </div>
        )}
      </div>

      <div className="flex border-t border-gray-100 divide-x divide-gray-100">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors rounded-bl-xl"
        >
          <FiEdit3 size={14} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors rounded-br-xl"
        >
          <FiTrash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ResumeVersionCard;

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiFileText, FiTarget, FiNavigation } from 'react-icons/fi';

interface JobPreviewModalProps {
  formData: {
    title: string;
    companyName: string;
    employmentType: string;
    description: string;
    keySkills: string;
    department: string;
    workExperienceMin: string | number;
    workExperienceMax: string | number;
    workMode: string;
    locationPreference: string;
    noticePeriod: string;
    salaryMin: string | number;
    salaryMax: string | number;
    screeningQuestions: string[];
    fullAddress: string;
    street: string;
    city: string;
    pinCode: string;
    state: string;
    country: string;
    receiveApplicationsVia: string;
    companyLogo: string | null;
    vacancyReel: File | null;
    reelUrl?: string | null;
  };
  onClose: () => void;
}

const JobPreviewModal: React.FC<JobPreviewModalProps> = ({ formData, onClose }) => {
  const {
    title,
    companyName,
    description,
    keySkills,
    department,
    employmentType,
    workExperienceMin,
    workExperienceMax,
    workMode,
    locationPreference,
    noticePeriod,
    salaryMin,
    salaryMax,
    screeningQuestions,
    fullAddress,
    companyLogo,
    vacancyReel,
    reelUrl
  } = formData;

  const [mounted, setMounted] = useState(false);
  const [reelPreviewUrl, setReelPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (vacancyReel) {
      const url = URL.createObjectURL(vacancyReel);
      setReelPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (reelUrl) {
      setReelPreviewUrl(reelUrl);
    }
  }, [vacancyReel, reelUrl]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl relative animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xl">
              P
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Job Preview</h2>
              <p className="text-xs text-gray-400">Review and Confirm Your Job Posting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 group"
          >
            <FiX size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">

          {/* Main Info Section */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Logo/Identity */}
            <div className="shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <FiBriefcase size={32} className="text-gray-300" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2">
                  {title || 'Untitled Job Position'}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-[10px] font-semibold uppercase tracking-wider">
                    {employmentType}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                    {department || 'General'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 font-bold">
                <FiBriefcase className="text-purple-500" />
                <span className="text-sm">{companyName || 'Staffbook Employer'}</span>
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-gray-50/50 rounded-[24px] p-6 border border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiDollarSign size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Salary (Annual)</span>
              </div>
              <p className="font-bold text-gray-900">
                {salaryMin && salaryMax ? `₹${Number(salaryMin).toLocaleString()} - ₹${Number(salaryMax).toLocaleString()}` : 'Not Specified'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiClock size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Work Experience</span>
              </div>
              <p className="font-bold text-gray-900">
                {workExperienceMin} - {workExperienceMax} Years
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiMapPin size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Work Mode</span>
              </div>
              <p className="font-bold text-gray-900">{workMode}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiNavigation size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Joining Date</span>
              </div>
              <p className="font-bold text-gray-900">{noticePeriod}</p>
            </div>
          </div>

          {/* Job Description */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <FiFileText className="text-purple-600" size={20} />
              <h3 className="text-base font-bold">Job Description</h3>
            </div>
            <div className="bg-white border border-gray-100 rounded-[24px] p-6 text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
              {description || 'No description provided yet.'}
            </div>
          </section>

          {/* Key Skills */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <FiTarget className="text-purple-600" size={20} />
              <h3 className="text-base font-bold">Key Skills Required</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {keySkills ? keySkills.split(',').map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-[#fcfaff] border border-[#e9d5ff] text-[#9333ea] rounded-xl text-xs font-bold shadow-sm"
                >
                  {skill.trim()}
                </span>
              )) : <p className="text-gray-400 italic">No skills listed</p>}
            </div>
          </section>

          {/* Preview Reel If Available */}
          {reelPreviewUrl && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900">
                <FiTarget className="text-purple-600" size={20} />
                <h3 className="text-base font-bold">Job Video/Reel</h3>
              </div>
              <div className="relative aspect-[9/16] max-w-[280px] rounded-[24px] overflow-hidden bg-black shadow-2xl mx-auto md:mx-0">
                <video
                  src={reelPreviewUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </section>
          )}

          {/* Screening Questions */}
          <section className="space-y-4 pb-10">
            <div className="flex items-center gap-2 text-gray-900">
              <FiTarget className="text-purple-600" size={20} />
              <h3 className="text-base font-bold">Screening Questions</h3>
            </div>
            <div className="space-y-3">
              {screeningQuestions && screeningQuestions.length > 0 ? screeningQuestions.map((q, i) => (
                q.trim() && (
                  <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 font-medium text-gray-800">
                    <span className="text-purple-600 font-bold shrink-0">Q{i + 1}.</span>
                    <p>{q}</p>
                  </div>
                )
              )) : <p className="text-gray-400 italic">No screening questions added</p>}
            </div>
          </section>

          {/* Footer Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-100">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Location Identity</h4>
              <p className="text-sm font-bold text-gray-700">{fullAddress || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Receive Applications Via</h4>
              <p className="text-sm font-bold text-gray-700">{formData.receiveApplicationsVia}</p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#9333ea] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#7e22ce] transition-all shadow-lg active:scale-95"
          >
            Done Previewing
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JobPreviewModal;

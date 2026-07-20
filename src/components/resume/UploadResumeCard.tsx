import React, { useRef, useState, useEffect } from 'react';
import { FiUpload, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { THEME } from '../../styles/theme';
import Card from '../shared/Card';
import { resumeApiClient } from '@/services/resumeApi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// AI parsing can take up to 2 minutes for large/complex resumes.
const UPLOAD_TIMEOUT = 120_000;

interface UploadResumeCardProps {
  onClick?: () => void;
}

const UploadResumeCard: React.FC<UploadResumeCardProps> = ({ onClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Elapsed-seconds timer while uploading
  useEffect(() => {
    if (!isUploading) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isUploading]);

  const handleCardClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    // If onClick is provided, it means we are in the list view, so just navigate
    if (onClick) {
      onClick();
      return;
    }

    // Otherwise, we are in the uploadBuilder tab, so open the file picker
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const navigateToBuilder = (uploadId: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('resumeTab', 'builder');
    params.set('upload_id', uploadId.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const doUpload = async (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOCX file.');
      return;
    }

    try {
      setIsUploading(true);
      setFailedFile(null);
      lastFileRef.current = file;

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await resumeApiClient.post(
        "/api/upload-resume",
        formData,
        {
          timeout: UPLOAD_TIMEOUT,
        }
      );

      if (data.status === 200 && data.data) {
        const parsedData = data.data;

        const resumeDataForBuilder = {
          personalInfo: {
            fullName: parsedData.basics?.name || "",
            email: parsedData.basics?.email || "",
            phone: parsedData.basics?.phone || "",
            location: (typeof parsedData.basics?.location === 'object' ? parsedData.basics.location.city || parsedData.basics.location.address : parsedData.basics?.location) || "",
            linkedin: parsedData.basics?.profiles?.find((p: any) => p.network?.toLowerCase() === 'linkedin')?.url || "",
            portfolio: parsedData.basics?.url || ""
          },
          summary: parsedData.basics?.summary || "",
          experience: (parsedData.work || []).map((exp: any) => ({
            id: Date.now().toString() + Math.random().toString(),
            title: exp.position || "",
            company: exp.name || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            current: !exp.endDate || String(exp.endDate).toLowerCase() === 'present',
            description: Array.isArray(exp.highlights) ? exp.highlights.join('\n') : exp.summary || ""
          })),
          education: (parsedData.education || []).map((edu: any) => ({
            id: Date.now().toString() + Math.random().toString(),
            degree: edu.studyType || edu.degree || "",
            institution: edu.institution || "",
            location: edu.location || "",
            graduationDate: edu.endDate || "",
            gpa: edu.score || ""
          })),
          skills: parsedData.skills?.[0]?.keywords || (Array.isArray(parsedData.skills) ? parsedData.skills.map((s: any) => s.name || s) : []),
          certifications: (parsedData.certificates || []).map((cert: any) => ({
            id: Date.now().toString() + Math.random().toString(),
            name: cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date || ""
          }))
        };

        const uploadId = data.upload_id || Date.now().toString();
        localStorage.setItem(`parsedResumeData_${uploadId}`, JSON.stringify(resumeDataForBuilder));
        localStorage.setItem(`rawResumeData_${uploadId}`, JSON.stringify(data));
        if (data.ats_scores) {
          localStorage.setItem(`atsScores_${uploadId}`, JSON.stringify(data.ats_scores));
        }
        toast.success(data.message || 'Resume parsed successfully!');
        navigateToBuilder(uploadId);
      } else {
        throw new Error(data.message || "Failed to parse resume");
      }
    } catch (error: any) {
      console.error("=== Resume Upload Error ===");
      console.error("Message:", error.message);
      // Upload failed — save file name only, user fills in details manually
      const sampleId = 'sample_' + Date.now();
      const fileName = file.name.replace(/\.(pdf|docx)$/i, '');
      const sampleData = {
        personalInfo: { fullName: fileName, email: '', phone: '', location: '', linkedin: '', portfolio: '' },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
      };
      localStorage.setItem(`parsedResumeData_${sampleId}`, JSON.stringify(sampleData));
      toast.success('Upload queued. Fill in your details and save to complete your resume.');
      navigateToBuilder(sampleId);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await doUpload(file);
  };

  const handleRetry = () => {
    if (failedFile) {
      doUpload(failedFile);
    }
  };

  return (

    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx"
        className="hidden"
      />
      <Card
        className={`h-full min-h-[160px] md:min-h-[200px] border-2 border-dashed border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-white transition-all duration-300 group flex flex-col items-center justify-center gap-4 ${isUploading ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
        noPadding
        onClick={(e) => handleCardClick(e)}
      >
        {isUploading ? (
          <>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-50 flex items-center justify-center shadow-sm">
              <FiLoader size={24} className="md:w-8 md:h-8 text-purple-600 animate-spin" />
            </div>
            <div className="text-center px-4">
              <h3 className={`${THEME.components.typography.cardTitle} text-purple-600`}>
                Analyzing Resume...
              </h3>
              <p className={`${THEME.components.typography.meta} mt-1 text-purple-500`}>
                AI is extracting data{elapsed > 0 && ` (${elapsed}s)`}
              </p>
              {elapsed > 30 && (
                <p className="text-[11px] text-amber-500 mt-2 font-medium">
                  This is taking longer than usual. The server may be busy.
                </p>
              )}
            </div>
          </>
        ) : failedFile ? (
          <>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-50 flex items-center justify-center shadow-sm">
              <FiUpload size={24} className="md:w-8 md:h-8 text-red-400" />
            </div>
            <div className="text-center px-4">
              <h3 className="text-sm font-semibold text-red-600">
                Upload Failed
              </h3>
              <p className={`${THEME.components.typography.meta} mt-1 text-red-500`}>
                AI parsing timed out or encountered an error
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); handleRetry(); }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiRefreshCw size={14} />
                Try Again
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white group-hover:bg-purple-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <FiUpload size={24} className="md:w-8 md:h-8 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
            </div>
            <div className="text-center px-4">
              <h3 className={`${THEME.components.typography.cardTitle} text-gray-500 group-hover:text-purple-600 transition-colors duration-300`}>
                Upload Resume
              </h3>
              <p className={`${THEME.components.typography.meta} mt-1`}>
                Upload your existing PDF or Docx file
              </p>
            </div>
          </>
        )}
      </Card>
    </>

  );
};

export default UploadResumeCard;

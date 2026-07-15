"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FiArrowLeft, FiLoader, FiFileText, FiStar, FiExternalLink } from "react-icons/fi";
import apiClient from "@/lib/api/config";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ATSResumeBuilder from '@/components/resume/ATSResumeBuilder';
import ResumeVersionCard from '@/components/resume/ResumeVersionCard';
import CreateResumeCard from '@/components/resume/CreateResumeCard';
import UploadResumeCard from '@/components/resume/UploadResumeCard';
import ResumeAnalytics from '@/components/resume/ResumeAnalytics';
import ResumeTemplates from '@/components/resume/ResumeTemplates';
import ResumeShare from '@/components/resume/ResumeShare';
import { THEME } from '@/styles/theme';

interface ResumeVersion {
  id: string;
  name: string;
  lastModified: string;
  views: number;
  downloads: number;
  isDefault: boolean;
  template: string;
  size: string;
  upload_id?: string;
  raw_data?: any;
  atsScore?: number;
}

function calculateATSScoreFromParsedData(parsedJson: any): number {
  let score = 0;
  const parsedData = parsedJson?.data || {};
  if (parsedData.personal_information?.full_name) score += 10;
  if (parsedData.personal_information?.email) score += 10;
  if (parsedData.personal_information?.phone) score += 10;
  if (parsedData.professional_summary && parsedData.professional_summary.length > 50) score += 15;
  if (parsedData.work_experience?.length > 0) score += 20;
  if (parsedData.education?.length > 0) score += 15;
  if (parsedData.skills?.length >= 5) score += 20;
  return score;
}

const STEPS = [
  { label: 'Start', sub: 'Create/Upload' },
  { label: 'Job Details', sub: 'Fill Details' },
  { label: 'Templates', sub: 'Design' },
];

function StepProgressBar({ activeStep }: { activeStep: number }) {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isActive = stepNum <= activeStep;
          return (
            <div key={step.label} className="flex items-center flex-1 relative">
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  isActive ? 'bg-purple-600' : 'bg-gray-300'
                }`}>
                  <span className="text-white text-sm font-bold">{stepNum}</span>
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap transition-colors ${
                  isActive ? 'text-purple-700' : 'text-gray-400'
                }`}>{step.label}</span>
                <span className={`text-[10px] -mt-0.5 transition-colors ${
                  isActive ? 'text-gray-400' : 'text-gray-300'
                }`}>{step.sub}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-20px] transition-colors ${
                  isActive ? 'bg-purple-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ResumeContentProps {
  queryParam?: string;
}

export default function ResumeContent({ queryParam = 'tab' }: ResumeContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<
    "versions" | "builder" | "analytics" | "templates" | "share" | "uploadBuilder"
  >(searchParams.get(queryParam) as any || "versions");

  const handleTabChange = (tab: string) => {
    // Limit free users to 3 resumes
    if (tab === "builder" || tab === "uploadBuilder") {
      const resumeCount = resumeVersions.length;
      const userBalance = user?.userBalance?.no_of_resume;
      const isPremium = user?.user_balance_job_seeker?.premium_designs_available === 1 || (userBalance && userBalance > resumeCount);
      if (!isPremium && resumeCount >= 3) {
        toast.error("Free plan allows up to 3 resumes. Upgrade to Premium for unlimited.");
        return;
      }
    }
    setActiveTab(tab as any);
    const params = new URLSearchParams(searchParams.toString());
    params.set(queryParam, tab);
    
    if (tab !== "builder") {
      params.delete("upload_id");
      params.delete("resume_id");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Update activeTab when URL changes
  React.useEffect(() => {
    const tab = searchParams.get(queryParam);
    if (tab) {
      setActiveTab(tab as any);
    }
  }, [searchParams, queryParam]);

  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await apiClient.get("resume-builders/index");
        if (response.data?.data?.resume_builder_list) {
          const list = response.data.data.resume_builder_list.map((item: any) => {
            const parsedJson = item.parsed_data_json || {};
            const parsedData = parsedJson.data || {};
            return {
              id: item.id.toString(),
              name: item.title || "My Resume",
              lastModified: new Date(item.updated_at).toLocaleDateString(),
              views: 0,
              downloads: 0,
              isDefault: false,
              template: item.template_data_json?.name || "Standard",
              size: "1.2 MB", // placeholder
              upload_id: parsedJson.upload_id?.toString() || "",
              raw_data: parsedJson,
              atsScore: calculateATSScoreFromParsedData(parsedJson)
            };
          });
          setResumeVersions(list);
        }
      } catch (error) {
        console.error("Failed to fetch resumes", error);
        toast.error("Failed to fetch resumes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleEditResume = (resumeId: string, uploadId: string, rawData: any) => {
    const parsedData = rawData?.data || {};
    const resumeDataForBuilder = {
      personalInfo: {
        fullName: parsedData.personal_information?.full_name || "",
        email: parsedData.personal_information?.email || "",
        phone: parsedData.personal_information?.phone || "",
        location: parsedData.personal_information?.location || "",
        linkedin: parsedData.personal_information?.linkedin_profile || "",
        portfolio: parsedData.personal_information?.portfolio_website || ""
      },
      summary: parsedData.professional_summary || "",
      experience: parsedData.work_experience ? parsedData.work_experience.map((exp: any) => ({
        title: exp.job_title || "",
        company: exp.company || "",
        location: exp.location || "Remote",
        startDate: exp.start_date || "",
        endDate: exp.end_date || "",
        description: exp.responsibilities ? exp.responsibilities.join('\n') : ""
      })) : [],
      education: parsedData.education ? parsedData.education.map((edu: any) => ({
        degree: edu.degree || "",
        institution: edu.institution || "",
        endDate: edu.end_year || "",
        gpa: edu.grade || ""
      })) : [],
      skills: Array.from(new Set([
        ...(parsedData.skills || []),
        ...(parsedData.additional_info?.technical_skills || []),
        ...(parsedData.additional_info?.soft_skills || [])
      ])),
      certifications: parsedData.certifications ? parsedData.certifications.map((cert: any) => ({
        name: cert.name || "",
        issuer: cert.issuing_organization || "",
        date: cert.date_obtained || ""
      })) : []
    };

    const storageId = uploadId || resumeId;
    localStorage.setItem(`parsedResumeData_${storageId}`, JSON.stringify(resumeDataForBuilder));
    localStorage.setItem(`rawResumeData_${storageId}`, JSON.stringify(rawData));

    setActiveTab("builder");
    const params = new URLSearchParams(searchParams.toString());
    params.set(queryParam, "builder");
    params.set("upload_id", storageId);
    params.set("resume_id", resumeId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      const response = await apiClient.post("resume-builders/delete-resume-builder", { id: resumeId });
      if (response.status === 200) {
        toast.success("Resume deleted successfully");
        setResumeVersions((prev) => prev.filter((r) => r.id !== resumeId));
      }
    } catch (error) {
      console.error("Failed to delete resume", error);
      toast.error("Failed to delete resume");
    }
  };

  const BackButton = () => (
    <button
      onClick={() => handleTabChange("versions")}
      className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-6 group cursor-pointer"
    >
      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-purple-50 transition-colors">
        <FiArrowLeft className="w-5 h-5" />
      </div>
      <span className="font-medium text-sm">Back to My Resumes</span>
    </button>
  );

  return (
    <div className={`w-full ${THEME.colors.background.page}`}>
      {/* Show ATS Builder for builder tab */}
      {activeTab === "builder" && (
        <div className="p-4 md:p-8 pb-28 lg:pb-8">
          <StepProgressBar activeStep={searchParams.get('template_id') ? 3 : 2} />
          <div className="mt-6">
            <BackButton />
          </div>
          <ATSResumeBuilder />
        </div>
      )}

      {activeTab === "uploadBuilder" && (
        <div className="p-4 md:p-8">
          <StepProgressBar activeStep={2} />
          <div className="mt-6">
            <BackButton />
          </div>
          <UploadResumeCard />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="p-4 md:p-8">
          <BackButton />
          <ResumeAnalytics resumeVersions={resumeVersions} />
        </div>
      )}

      {activeTab === "templates" && (
        <div className="py-4 md:py-8">
          <div className="px-4 md:px-8">
            <StepProgressBar activeStep={3} />
            <div className="mt-6">
              <BackButton />
            </div>
          </div>
          <ResumeTemplates />
        </div>
      )}

      {activeTab === "share" && (
        <div className="p-4 md:p-8">
          <BackButton />
          <ResumeShare />
        </div>
      )}

      {activeTab === "versions" && (
        <>
          <div className={`space-y-8 p-4 md:p-6 ${THEME.layout.spacing.xl}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div onClick={() => handleTabChange("builder")} className="cursor-pointer">
                <CreateResumeCard />
              </div>
              <div className="cursor-pointer">
                <UploadResumeCard onClick={() => handleTabChange("uploadBuilder")} />
              </div>
              <a
                href="https://resume-pro-ebon.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-white rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 hover:shadow-lg transition-all p-5 h-full flex flex-col items-center justify-center text-center min-h-[160px] group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-3 shadow-md">
                    <FiExternalLink className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    AI Resume Builder
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Build with AI on resume-pro
                  </p>
                </div>
              </a>
            </div>

            {/* My Resume Folder */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">My Resume</h3>
                  <p className="text-xs text-gray-500">{resumeVersions.length} resume{resumeVersions.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <FiLoader className="animate-spin text-purple-600 w-6 h-6" />
                </div>
              ) : resumeVersions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FiFileText className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No resumes yet. Create or upload one above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 px-5 py-4 min-w-min">
                    {resumeVersions.map((resume) => (
                      <div key={resume.id} className="flex-shrink-0 w-[220px]">
                        <ResumeVersionCard 
                          resume={resume} 
                          onEdit={() => handleEditResume(resume.id, resume.upload_id || "", resume.raw_data)}
                          onDelete={() => handleDeleteResume(resume.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resume Templates Section */}
          <div className={`${THEME.layout.spacing.xl} mt-12`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Choose the Perfect Template for Your Resume</h3>
            <p className="text-sm text-gray-500 mb-6">Pick a professional design to make your resume stand out</p>
            <ResumeTemplates />
          </div>
        </>
      )}
    </div>
  );
}

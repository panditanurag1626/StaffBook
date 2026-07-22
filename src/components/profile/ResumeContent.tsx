"use client";

import React, { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FiArrowLeft, FiLoader, FiFileText, FiStar } from "react-icons/fi";
import apiClient from "@/lib/api/config";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ATSResumeBuilder from '@/components/resume/ATSResumeBuilder';
import ResumeVersionCard from '@/components/resume/ResumeVersionCard';
import CreateResumeCard from '@/components/resume/CreateResumeCard';
import UploadResumeCard from '@/components/resume/UploadResumeCard';
import ExploreTemplatesCard from '@/components/resume/ExploreTemplatesCard';
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
  template_data?: any;
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

  // Start with "versions" during SSR/initial render so server and client HTML
  // match.  The URL-sync effect below corrects the tab after hydration.
  const [activeTab, setActiveTab] = useState<
    "versions" | "builder" | "analytics" | "templates" | "share" | "uploadBuilder"
  >("versions");
  const [resumeRefreshKey, setResumeRefreshKey] = useState(0);

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
    
    // Refresh resume list when going back to versions tab
    if (tab === "versions") {
      setResumeRefreshKey(k => k + 1);
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
              template_data: item.template_data_json || null,
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
  }, [resumeRefreshKey]);

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

  const escHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const handleViewResume = (resume: ResumeVersion) => {
    const rawData = resume.raw_data?.data || {};
    // Support both JSON Resume (basics) and builder (personal_information) formats
    const isJsonResume = !!(rawData.basics?.name);
    const p = isJsonResume ? rawData.basics || {} : (rawData.personal_information || {});
    const name = p.name || p.full_name || resume.name || 'Resume';
    const email = p.email || '';
    const phone = p.phone || '';
    const location = (typeof p.location === 'object' ? p.location.city || p.location.address || '' : p.location) || '';
    const summary = isJsonResume ? (rawData.summary || '') : (rawData.professional_summary || '');
    const experience = isJsonResume
      ? (rawData.work || []).map((e: any) => ({ title: e.name || '', company: e.company || '', startDate: e.startDate || '', endDate: e.endDate || '', description: (e.summary || e.description || '') }))
      : (rawData.work_experience || []).map((e: any) => ({ title: e.job_title || '', company: e.company || '', startDate: e.start_date || '', endDate: e.end_date || '', description: (e.responsibilities || []).join('\n') }));
    const education = isJsonResume
      ? (rawData.education || []).map((e: any) => ({ degree: e.studyType || e.area || '', institution: e.institution || '', graduationDate: e.endDate || '', gpa: e.gpa || '' }))
      : (rawData.education || []).map((e: any) => ({ degree: e.degree || '', institution: e.institution || '', graduationDate: e.end_year || '', gpa: e.grade || '' }));
    const skillsRaw = isJsonResume ? (rawData.skills || []) : [...new Set([...(rawData.skills || []), ...(rawData.additional_info?.technical_skills || []), ...(rawData.additional_info?.soft_skills || [])])];
    const skills = skillsRaw.map((s: any) => (typeof s === 'string' ? s : s.name || s));
    const projects = rawData.projects || [];
    const certifications = isJsonResume ? (rawData.certificates || []) : (rawData.certifications || []);
    const volunteer = rawData.volunteer || [];
    const languages = rawData.languages || (rawData.additional_info?.languages) || [];
    const awards = rawData.awards || [];
    const publications = rawData.publications || [];
    const interests = rawData.interests || [];
    const references = rawData.references || [];
    if (typeof window === 'undefined') return;
    const win = window.open('', '_blank');
    if (!win) { toast.error('Pop-up blocked'); return; }
    const sectionHtml = (label: string, content: string) => content ? `<div style="margin-bottom:14px"><h2 style="font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #7c3aed;padding-bottom:4px;margin-bottom:6px">${label}</h2>${content}</div>` : '';
    const contactHtml = [email, phone, location].filter(Boolean).join(' &nbsp;|&nbsp; ');
    const linkedinHtml = p.linkedin || p.linkedin_profile ? `<div>${escHtml(p.linkedin || p.linkedin_profile)}</div>` : '';
    const summaryHtml = summary ? `<p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0">${escHtml(summary)}</p>` : '';
    const expHtml = (experience || []).map((e: any) => e?.title || e?.company ? `<div style="margin-bottom:8px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(e.title || '')}</div><div style="color:#6b7280;font-size:12px">${[e.company, e.startDate ? `${e.startDate} – ${e.endDate || 'Present'}` : ''].filter(Boolean).join(' · ')}</div>${e.description ? `<div style="font-size:12px;color:#4b5563;margin-top:2px;line-height:1.5">${escHtml(e.description)}</div>` : ''}</div>` : '').filter(Boolean).join('');
    const eduHtml = (education || []).map((e: any) => e?.degree || e?.institution ? `<div style="margin-bottom:4px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(e.degree || '')}</div><div style="color:#6b7280;font-size:12px">${[e.institution, e.graduationDate].filter(Boolean).join(' · ')}${e.gpa ? ` · <span style="font-weight:500">GPA: ${escHtml(e.gpa)}</span>` : ''}</div></div>` : '').filter(Boolean).join('');
    const skillsHtml = (skills || []).length ? skills.map((s: any) => escHtml(s)).join(' &middot; ') : '';
    const projHtml = projects.map((pr: any) => pr.name || pr.title ? `<div style="margin-bottom:8px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(pr.name || pr.title)}</div><div style="color:#6b7280;font-size:12px">${[pr.start_date, pr.end_date || 'Present'].filter(Boolean).join(' – ')}</div>${pr.description ? `<div style="font-size:12px;color:#4b5563;margin-top:2px;line-height:1.5">${escHtml(pr.description)}</div>` : ''}${(pr.highlights||[]).length ? pr.highlights.map((h: string) => `<div style="font-size:11px;color:#555;margin:1px 0 1px 16px">– ${escHtml(h)}</div>`).join('') : ''}</div>` : '').filter(Boolean).join('');
    const certHtml = certifications.map((c: any) => c.name ? `<div style="margin-bottom:4px;font-size:12px"><strong>${escHtml(c.name)}</strong>${c.issuer || c.issuing_organization ? ' — '+escHtml(c.issuer||c.issuing_organization) : ''}${c.date || c.date_obtained ? ' · '+(c.date||c.date_obtained) : ''}</div>` : '').filter(Boolean).join('');
    const volHtml = volunteer.map((v: any) => v.position ? `<div style="margin-bottom:8px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(v.position)}${v.organization ? ' — '+escHtml(v.organization) : ''}</div><div style="color:#6b7280;font-size:12px">${[v.start_date, v.end_date || 'Present'].filter(Boolean).join(' – ')}</div>${v.summary || v.description ? `<div style="font-size:12px;color:#4b5563;margin-top:2px;line-height:1.5">${escHtml(v.summary||v.description)}</div>` : ''}</div>` : '').filter(Boolean).join('');
    const langHtml = languages.length ? languages.map((l: any) => (l.language || l)+(l.fluency ? ' — '+l.fluency : '')).join(' &middot; ') : '';
    const awardHtml = awards.map((a: any) => a.title ? `<div style="margin-bottom:4px;font-size:12px"><strong>${escHtml(a.title)}</strong>${a.awarder ? ' — '+escHtml(a.awarder) : ''}${a.date ? ' ('+a.date+')' : ''}${a.summary ? '<div style="color:#555;margin-top:2px">'+escHtml(a.summary)+'</div>' : ''}</div>` : '').filter(Boolean).join('');
    const pubHtml = publications.map((p: any) => p.name ? `<div style="margin-bottom:4px;font-size:12px"><strong>${escHtml(p.name)}</strong>${p.publisher ? ' — '+escHtml(p.publisher) : ''}${p.release_date ? ' ('+p.release_date+')' : ''}${p.summary ? '<div style="color:#555;margin-top:2px">'+escHtml(p.summary)+'</div>' : ''}</div>` : '').filter(Boolean).join('');
    const intHtml = interests.length ? interests.map((i: any) => i.name || i).join(', ') : '';
    const refHtml = references.map((r: any) => r.name ? `<div style="margin-bottom:4px;font-size:12px"><strong>${escHtml(r.name)}</strong>${r.reference ? '<div style="color:#555">'+escHtml(r.reference)+'</div>' : ''}</div>` : '').filter(Boolean).join('');
    const hasData = name || contactHtml || summaryHtml || expHtml || eduHtml || skillsHtml || projHtml || certHtml;
    const bodyContent = hasData
      ? `<div class="page"><div class="header"><h1>${escHtml(name)}</h1>${contactHtml ? `<div class="contact">${contactHtml}</div>` : ''}${linkedinHtml ? `<div class="contact" style="margin-top:2px">${linkedinHtml}</div>` : ''}</div>${sectionHtml('Professional Summary', summaryHtml)}${sectionHtml('Experience', expHtml)}${sectionHtml('Education', eduHtml)}${sectionHtml('Skills', skillsHtml)}${sectionHtml('Projects', projHtml)}${sectionHtml('Certifications', certHtml)}${sectionHtml('Volunteer', volHtml)}${sectionHtml('Languages', langHtml)}${sectionHtml('Awards', awardHtml)}${sectionHtml('Publications', pubHtml)}${sectionHtml('Interests', intHtml)}${sectionHtml('References', refHtml)}</div>`
      : `<div class="page" style="text-align:center;padding:80px 48px"><div style="font-size:48px;margin-bottom:16px">📄</div><h2 style="color:#374151;margin-bottom:8px">No Resume Data</h2><p style="color:#6b7280;font-size:14px;line-height:1.6">This resume has no content yet. Edit it in the Resume Builder to add your details.</p></div>`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escHtml(name)} - Resume</title><style>@page{size:A4;margin:15mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,Segoe UI,sans-serif;background:#f3f4f6;display:flex;justify-content:center;padding:40px 16px}@media print{body{background:#fff;padding:0}}@media screen{.page{max-width:800px;width:100%;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.1);padding:40px 48px;border-radius:4px}}.header{margin-bottom:20px}.header h1{font-size:26px;font-weight:700;color:#111827;margin:0;line-height:1.2}.header .title{font-size:14px;color:#6b7280;margin-top:2px}.header .contact{font-size:13px;color:#6b7280;margin-top:4px}</style></head><body>${bodyContent}</body></html>`;
    try { win.document.write(html); win.document.close(); } catch (e) { toast.error('Failed to open preview'); }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (typeof window === 'undefined' || !window.confirm("Are you sure you want to delete this resume?")) return;
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

  const usedTemplateIds = resumeVersions
    .map(r => {
      const td = r.template_data;
      if (typeof td === 'string') try { return JSON.parse(td); } catch { return {}; }
      return td || {};
    })
    .filter((td: any) => td?.id)
    .map((td: any) => String(td.id));

  return (
    <div className={`w-full ${THEME.colors.background.page}`}>
      {/* Show ATS Builder for builder tab */}
      {activeTab === "builder" && (
        <div className="px-4 md:px-6 pb-28 lg:pb-6">
          <ATSResumeBuilder />
        </div>
      )}

      {activeTab === "uploadBuilder" && (
        <div className="px-4 md:px-6 pb-28 lg:pb-6">
          <ATSResumeBuilder />
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
          <ResumeTemplates usedTemplateIds={usedTemplateIds} />
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
              <div onClick={() => handleTabChange("templates")} className="cursor-pointer">
                <ExploreTemplatesCard />
              </div>
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
                          onView={() => handleViewResume(resume)}
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
            <ResumeTemplates usedTemplateIds={usedTemplateIds} />
          </div>
        </>
      )}
    </div>
  );
}

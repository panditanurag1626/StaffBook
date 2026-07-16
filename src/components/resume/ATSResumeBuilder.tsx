/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  FiUser,
  FiBriefcase,
  FiBook,
  FiAward,
  FiCode,
  FiFileText,
  FiDownload,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiChevronRight,
  FiChevronDown,
  FiLayout,
  FiLoader,
  FiStar,
} from "react-icons/fi";
import { THEME } from "../../styles/theme";
import Card from "../shared/Card";
import apiClient from "@/lib/api/config";
import {
  fetchTemplateHtml,
  withResumeApiBase,
  printTemplate,
  downloadTemplatePdf,
  openHtmlWindow,
  fetchAtsScore,
  AtsScore,
} from "@/lib/api/resumeApi";
import toast from "react-hot-toast";
import ResumeTemplates from "./ResumeTemplates";
import { useAuth } from '@/context/AuthContext';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface ATSScore {
  score: number;
  issues: string[];
  suggestions: string[];
  categories: {
    personalInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
}

export default function ATSResumeBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const uploadId = searchParams.get('upload_id');
  const resumeId = searchParams.get('resume_id');
  const templateId = searchParams.get('template_id');
  const { user } = useAuth();
  const isPremium = user?.user_balance_job_seeker?.premium_designs_available === 1 || (user?.userBalance?.no_of_resume ?? 0) > 0;

  const updateUrlWithId = (newId: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('resume_id', newId.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const [activeSection, setActiveSection] = useState<string>("personal");
  const [issuesExpanded, setIssuesExpanded] = useState(false);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [builderId, setBuilderId] = useState<number | null>(null);
  const isEditMode = !!resumeId || !!builderId;
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  });

  const [atsScore, setAtsScore] = useState<ATSScore>({
    score: 0,
    issues: [],
    suggestions: [],
    categories: {
      personalInfo: 0,
      summary: 0,
      experience: 0,
      education: 0,
      skills: 0,
    },
  });

  // The real, rule-based ATS analysis from the resume-api. Seeded from the
  // upload response and refreshed (debounced) as the user edits. Falls back to
  // the local heuristic above when the service is unavailable.
  const [apiAtsScore, setApiAtsScore] = useState<AtsScore | null>(null);

  const generateParsedDataPayload = (dataToUse: ResumeData = resumeData) => {
    const storageKey = uploadId ? `rawResumeData_${uploadId}` : null;
    let baseRawData: any = null;
    if (storageKey) {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          baseRawData = JSON.parse(raw);
        } catch (e) { }
      }
    }

    const mapStateToData = () => ({
      personal_information: {
        full_name: dataToUse.personalInfo.fullName,
        email: dataToUse.personalInfo.email,
        phone: dataToUse.personalInfo.phone,
        location: dataToUse.personalInfo.location,
        linkedin_profile: dataToUse.personalInfo.linkedin || null,
        portfolio_website: dataToUse.personalInfo.portfolio || null
      },
      professional_summary: dataToUse.summary,
      work_experience: dataToUse.experience.map((exp: any) => ({
        job_title: exp.title,
        company: exp.company,
        location: exp.location || "Remote",
        duration: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
        start_date: exp.startDate,
        end_date: exp.current ? 'Present' : exp.endDate,
        responsibilities: exp.description ? exp.description.split('\n').filter(Boolean) : []
      })),
      education: dataToUse.education.map((edu: any) => ({
        degree: edu.degree,
        major: null,
        institution: edu.institution,
        location: edu.location || "",
        start_year: null,
        end_year: edu.graduationDate,
        grade: edu.gpa || null
      })),
      projects: baseRawData?.data?.projects || [],
      hobbies: baseRawData?.data?.hobbies || [],
      skills: dataToUse.skills,
      certifications: dataToUse.certifications.map((cert: any) => ({
        name: cert.name,
        issuing_organization: cert.issuer,
        date_obtained: cert.date
      })),
      additional_info: baseRawData?.data?.additional_info || {
        technical_skills: [],
        soft_skills: [],
        languages: [],
        achievements: [],
        awards: [],
        github_url: null,
        years_of_experience: 0,
        inferred_job_title: dataToUse.experience[0]?.title || ""
      },
      parsing_info: baseRawData?.data?.parsing_info || {
        accuracy: 100,
        label: "high"
      }
    });

    if (baseRawData) {
      return {
        ...baseRawData,
        data: {
          ...baseRawData.data,
          ...mapStateToData()
        }
      };
    }

    return {
      status: 200,
      statusText: "OK",
      message: "Resume created manually",
      upload_id: null,
      resume_file: null,
      data: mapStateToData()
    };
  };

  const autoSaveResume = async (initialData: ResumeData) => {
    setIsSaving(true);
    try {
      const parsedDataPayload = generateParsedDataPayload(initialData);
      const payload = {
        title: initialData.personalInfo.fullName ? `${initialData.personalInfo.fullName}'s Resume` : "My Resume",
        parsed_data: JSON.stringify(parsedDataPayload),
        template_data: JSON.stringify({}),
        status: 1
      };

      const response = await apiClient.post("resume-builders/add-resume-builder", payload);
      if (response.data) {
        toast.success("Resume saved automatically!");
        const newId = response.data?.data?.resume_builder?.id || response.data?.data?.id || response.data?.id;
        if (newId) {
          setBuilderId(newId);
          updateUrlWithId(newId);
        }
      }
    } catch (error) {
      console.error("Auto-save failed", error);
      toast.error("Failed to auto-save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsedDataPayload = generateParsedDataPayload();
      const payload = {
        title: resumeData.personalInfo.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : "My Resume",
        parsed_data: JSON.stringify(parsedDataPayload),
        template_data: JSON.stringify({}),
        status: 1
      };

      const idToUpdate = builderId || resumeId;

      if (idToUpdate) {
        const updatePayload = { ...payload, id: idToUpdate };
        const response = await apiClient.post("resume-builders/update-resume-builder", updatePayload);
        if (response.data) {
          toast.success("Resume updated successfully!");
        }
      } else {
        const response = await apiClient.post("resume-builders/add-resume-builder", payload);
        if (response.data) {
          toast.success("Resume saved successfully!");
          const newId = response.data?.data?.resume_builder?.id || response.data?.data?.id || response.data?.id;
          if (newId) {
            setBuilderId(newId);
            updateUrlWithId(newId);
          }
        }
      }
    } catch (error) {
      console.error("Failed to save resume", error);
      toast.error("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  // Current form state as the grouped payload the resume-api templates expect.
  const getGroupedData = () => generateParsedDataPayload().data;

  // Open the selected template, rendered with the current data, in a print
  // window so the user can "Save as PDF".
  const handleDownloadPdf = async () => {
    if (!templateId) {
      toast.error("Save your resume first. Template download is unavailable right now.");
      return;
    }
    const name = resumeData.personalInfo.fullName?.trim() || "Resume";
    const filename = `${name.replace(/\s+/g, "_")}_Resume.pdf`;
    const toastId = toast.loading("Generating your PDF...");
    try {
      await downloadTemplatePdf(templateId, { data: getGroupedData() }, filename);
      toast.success("Resume downloaded!", { id: toastId });
    } catch (err) {
      // Server has no PDF engine (501) or another error — fall back to the
      // browser print dialog so the user can still "Save as PDF".
      console.error("PDF download error:", err);
      try {
        const ok = await printTemplate(templateId, { data: getGroupedData() });
        if (ok) {
          toast("Opened print dialog — choose “Save as PDF”.", { id: toastId, icon: "🖨️" });
        } else {
          toast.error("Couldn't generate the PDF.", { id: toastId });
        }
      } catch {
        toast.error("Template service unavailable. Save your resume and try again later.", { id: toastId });
      }
    }
  };

  // Open the live-rendered resume full-size in a new tab.
  // Falls back to downloading the PDF if the popup is blocked.
  const handleViewFullscreen = async () => {
    if (!templateId) {
      openResumeWindow();
      return;
    }
    try {
      const html = await fetchTemplateHtml(templateId, getGroupedData());
      if (!openHtmlWindow(html)) {
        toast("Pop-up blocked.", { icon: "📄" });
      }
    } catch (err) {
      console.error("Preview error:", err);
      openResumeWindow();
    }
  };

  const escHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const openResumeWindow = () => {
    const p = resumeData.personalInfo || {} as any;
    const win = window.open('', '_blank');
    if (!win) { toast.error("Pop-up blocked"); return; }
    const sectionHtml = (label: string, content: string) => content ? `<div style="margin-bottom:14px"><h2 style="font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #7c3aed;padding-bottom:4px;margin-bottom:6px">${label}</h2>${content}</div>` : '';
    const contactHtml = [p.email, p.phone, p.location].filter(Boolean).join(' &nbsp;|&nbsp; ');
    const summaryHtml = resumeData.summary ? `<p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0">${escHtml(resumeData.summary)}</p>` : '';
    const expHtml = (resumeData.experience || []).map(e => e?.title || e?.company ? `<div style="margin-bottom:8px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(e.title || '')}</div><div style="color:#6b7280;font-size:12px">${[e.company, e.startDate ? `${e.startDate} – ${e.current ? 'Present' : e.endDate || ''}` : ''].filter(Boolean).join(' · ')}</div>${e.description ? `<div style="font-size:12px;color:#4b5563;margin-top:2px;line-height:1.5">${escHtml(e.description)}</div>` : ''}</div>` : '').filter(Boolean).join('');
    const eduHtml = (resumeData.education || []).map(e => e?.degree || e?.institution ? `<div style="margin-bottom:4px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(e.degree || '')}</div><div style="color:#6b7280;font-size:12px">${[e.institution, e.graduationDate].filter(Boolean).join(' · ')}${e.gpa ? ` · <span style="font-weight:500">GPA: ${escHtml(e.gpa)}</span>` : ''}</div></div>` : '').filter(Boolean).join('');
    const skillsHtml = (resumeData.skills || []).length ? resumeData.skills.map(s => escHtml(s)).join(' &middot; ') : '';
    const hasData = p.fullName || contactHtml || summaryHtml || expHtml || eduHtml || skillsHtml;
    const bodyContent = hasData
      ? `<div class="page"><div class="header"><h1>${escHtml(p.fullName || 'Resume')}</h1>${resumeData.experience?.[0]?.title ? `<div class="title">${escHtml(resumeData.experience[0].title)}</div>` : ''}${contactHtml ? `<div class="contact">${contactHtml}</div>` : ''}</div>${sectionHtml('Professional Summary', summaryHtml)}${sectionHtml('Experience', expHtml)}${sectionHtml('Education', eduHtml)}${sectionHtml('Skills', skillsHtml)}</div>`
      : `<div class="page" style="text-align:center;padding:80px 48px"><div style="font-size:48px;margin-bottom:16px">📄</div><h2 style="color:#374151;margin-bottom:8px">No Resume Data</h2><p style="color:#6b7280;font-size:14px;line-height:1.6">Fill in your details in the Resume Builder and click <strong>Save</strong>.<br>Then open the preview again to see your completed resume.</p></div>`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escHtml(p.fullName || 'Resume')} - Preview</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,Segoe UI,sans-serif;background:#f3f4f6;display:flex;justify-content:center;padding:40px 16px}.page{max-width:800px;width:100%;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.1);padding:40px 48px;border-radius:4px}.header{margin-bottom:20px}.header h1{font-size:26px;font-weight:700;color:#111827;margin:0;line-height:1.2}.header .title{font-size:14px;color:#6b7280;margin-top:2px}.header .contact{font-size:13px;color:#6b7280;margin-top:4px}</style></head><body>${bodyContent}</body></html>`;
    try { win.document.write(html); win.document.close(); } catch (e) { toast.error("Failed to open preview"); }
  };

  // Calculate ATS Score
  const calculateATSScore = () => {
    let score = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];

    let personalInfo = 0;
    let summaryScore = 0;
    let experienceScore = 0;
    let educationScore = 0;
    let skillsScore = 0;

    if (resumeData.personalInfo.fullName) { score += 10; personalInfo += 10; }
    else issues.push("Missing full name");

    if (resumeData.personalInfo.email) { score += 10; personalInfo += 10; }
    else issues.push("Missing email");

    if (resumeData.personalInfo.phone) { score += 10; personalInfo += 10; }
    else issues.push("Missing phone number");

    if (resumeData.summary && resumeData.summary.length > 50) { score += 15; summaryScore += 15; }
    else suggestions.push("Add a professional summary (50+ words)");

    if (resumeData.experience.length > 0) {
      score += 20; experienceScore += 20;
      resumeData.experience.forEach((exp) => {
        if (exp.description.length < 100) {
          suggestions.push(`Add more details to ${exp.title} role`);
        }
      });
    } else {
      issues.push("No work experience added");
    }

    if (resumeData.education.length > 0) { score += 15; educationScore += 15; }
    else issues.push("No education added");

    if (resumeData.skills.length >= 5) { score += 20; skillsScore += 20; }
    else suggestions.push("Add at least 5 relevant skills");

    setAtsScore({
      score,
      issues,
      suggestions,
      categories: {
        personalInfo,
        summary: summaryScore,
        experience: experienceScore,
        education: educationScore,
        skills: skillsScore,
      },
    });
  };

  // Handle scroll for tab navigation
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  React.useEffect(() => {
    calculateATSScore();
  }, [resumeData]);

  // Seed the real ATS analysis captured at upload time (instant, no request).
  React.useEffect(() => {
    if (!uploadId) return;
    const saved = localStorage.getItem(`atsScores_${uploadId}`);
    if (saved) {
      try { setApiAtsScore(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, [uploadId]);

  // Live, debounced re-scoring via the resume-api as the resume changes, so the
  // displayed score always matches what the API would compute.
  React.useEffect(() => {
    const hasContent =
      !!resumeData.personalInfo.fullName ||
      resumeData.experience.length > 0 ||
      resumeData.skills.length > 0;
    if (!hasContent) return;

    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const score = await fetchAtsScore({ data: generateParsedDataPayload().data });
        if (!cancelled && score) setApiAtsScore(score);
      } catch {
        /* keep last known score; local heuristic remains as fallback */
      }
    }, 800);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [resumeData]);

  // Warn user before reload/leave that data will be lost (only if there's actual data)
  const hasResumeData = isEditMode || !!uploadId || resumeData.personalInfo.fullName || resumeData.experience.length > 0 || resumeData.education.length > 0 || resumeData.skills.length > 0;
  React.useEffect(() => {
    if (!hasResumeData) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Changes you made may not be saved. Your resume details will be lost.";
      return "Changes you made may not be saved. Your resume details will be lost.";
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasResumeData]);
  // Check for auto-fill data from upload
  React.useEffect(() => {
    // Only proceed if we have an uploadId or fallback to the generic key
    const storageKey = uploadId ? `parsedResumeData_${uploadId}` : 'parsedResumeData';
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const raw = JSON.parse(savedData);
        // The data might be the full response with .data, or already mapped data
        const parsed = raw.data || raw;

        // Check if it's the JSON Resume format (has basics)
        const isJsonResume = !!parsed.basics;

        // Map parsed data to component state structure with robustness for various field names
        const mappedData: ResumeData = {
          personalInfo: {
            fullName: isJsonResume
              ? (parsed.basics?.name || "")
              : (parsed.personalInfo?.fullName || parsed.personalInfo?.name || parsed.personalInfo?.full_name || ""),
            email: isJsonResume
              ? (parsed.basics?.email || "")
              : (parsed.personalInfo?.email || ""),
            phone: isJsonResume
              ? (parsed.basics?.phone || "")
              : (parsed.personalInfo?.phone || ""),
            location: isJsonResume
              ? (parsed.basics?.location?.city || parsed.basics?.location?.address || "")
              : (parsed.personalInfo?.location || parsed.personalInfo?.address || ""),
            linkedin: isJsonResume
              ? (parsed.basics?.profiles?.find((p: any) => p.network?.toLowerCase() === 'linkedin')?.url || "")
              : (parsed.personalInfo?.linkedin || ""),
            portfolio: isJsonResume
              ? (parsed.basics?.url || "")
              : (parsed.personalInfo?.portfolio || parsed.personalInfo?.website || ""),
          },
          summary: isJsonResume ? (parsed.basics?.summary || "") : (parsed.summary || ""),
          experience: (isJsonResume ? (parsed.work || []) : (parsed.experience || [])).map((exp: any) => ({
            id: exp.id || Date.now().toString() + Math.random().toString(),
            title: exp.position || exp.title || exp.job_title || "",
            company: exp.name || exp.company || "",
            location: exp.location || "",
            startDate: exp.startDate || exp.start_date || "",
            endDate: exp.endDate || exp.end_date || "",
            current: exp.current || !exp.endDate || exp.endDate?.toLowerCase() === 'present',
            description: Array.isArray(exp.highlights)
              ? exp.highlights.join('\n')
              : (exp.description || exp.summary || ""),
          })),
          education: (parsed.education || []).map((edu: any) => ({
            id: edu.id || Date.now().toString() + Math.random().toString(),
            degree: edu.studyType || edu.degree || "",
            institution: edu.institution || "",
            location: edu.location || "",
            graduationDate: edu.endDate || edu.graduationDate || edu.end_year || "",
            gpa: edu.score || edu.gpa || edu.grade || "",
          })),
          skills: isJsonResume
            ? (parsed.skills?.[0]?.keywords || [])
            : (Array.isArray(parsed.skills) ? parsed.skills.map((s: any) => s.name || s) : []),
          certifications: (isJsonResume ? (parsed.certificates || []) : (parsed.certifications || [])).map((cert: any) => ({
            id: cert.id || Date.now().toString() + Math.random().toString(),
            name: cert.name || "",
            issuer: cert.issuer || cert.issuing_organization || "",
            date: cert.date || cert.date_obtained || "",
          })),
        };

        setResumeData(mappedData);
        // Clear after loading so it doesn't persist forever
        localStorage.removeItem(storageKey);

        // Auto-save only if it's a freshly uploaded resume (no resumeId yet)
        if (!resumeId && !builderId) {
          autoSaveResume(mappedData);
        }
      } catch (e) {
        console.error("Failed to parse resume data", e);
      }
    }
  }, [uploadId]);


  const sections = [
    { id: "personal", label: "Personal Info", icon: <FiUser size={18} /> },
    { id: "summary", label: "Summary", icon: <FiFileText size={18} /> },
    { id: "experience", label: "Experience", icon: <FiBriefcase size={18} /> },
    { id: "education", label: "Education", icon: <FiBook size={18} /> },
    { id: "skills", label: "Skills", icon: <FiCode size={18} /> },
    { id: "certifications", label: "Certifications", icon: <FiAward size={18} /> },
  ];

  // Unified score view: prefer the real API analysis, fall back to the local
  // heuristic. Category values are normalised to 0-100 either way.
  const atsView = apiAtsScore
    ? {
        isApi: true,
        score: apiAtsScore.overall_score,
        categories: [
          { label: "Contact", value: apiAtsScore.breakdown.contact_info },
          { label: "Summary", value: apiAtsScore.breakdown.summary },
          { label: "Experience", value: apiAtsScore.breakdown.work_experience },
          { label: "Quantify", value: apiAtsScore.breakdown.quantification },
          { label: "Skills", value: apiAtsScore.breakdown.skills },
          { label: "Education", value: apiAtsScore.breakdown.education },
          { label: "Projects", value: apiAtsScore.breakdown.projects },
          { label: "Certs", value: apiAtsScore.breakdown.certifications },
        ],
        issues: [] as string[],
        suggestions: apiAtsScore.feedback || [],
      }
    : {
        isApi: false,
        score: atsScore.score,
        categories: [
          { label: "Personal Info", value: Math.round((atsScore.categories.personalInfo / 30) * 100) },
          { label: "Summary", value: Math.round((atsScore.categories.summary / 15) * 100) },
          { label: "Experience", value: Math.round((atsScore.categories.experience / 20) * 100) },
          { label: "Education", value: Math.round((atsScore.categories.education / 15) * 100) },
          { label: "Skills", value: Math.round((atsScore.categories.skills / 20) * 100) },
        ],
        issues: atsScore.issues,
        suggestions: atsScore.suggestions,
      };

  const scoreColor = (v: number) =>
    v >= 80 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-600";
  const dotColor = (v: number) =>
    v >= 80 ? "bg-green-500" : v >= 50 ? "bg-amber-500" : "bg-red-400";

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <button
          onClick={openResumeWindow}
          className="px-4 py-2.5 text-sm font-semibold flex items-center gap-2 bg-white border border-purple-300 text-purple-700 rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
        >
          <FiEye size={18} />
          Open Resume
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`${THEME.components.button.primary} px-6 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-sm`}
        >
          {isSaving ? <FiLoader className="animate-spin" size={18} /> : <FiCheckCircle size={18} />}
          {isSaving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Resume" : "Save Resume")}
        </button>
      </div>
      {/* ATS Score - Top Banner */}
      <Card>
        <Card.Content>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F3EFFF" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={atsView.score >= 80 ? "#10B981" : atsView.score >= 60 ? "#F59E0B" : "#EF4444"} strokeWidth="3" strokeDasharray={`${atsView.score}, 100`} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className={`text-sm md:text-base font-bold ${atsView.score >= 80 ? "text-green-600" : atsView.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>{atsView.score}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  ATS Compatibility Score
                  {atsView.isApi && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">AI</span>
                  )}
                </p>
                <p className={`text-xs font-semibold ${atsView.score >= 80 ? "text-green-600" : atsView.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                  {atsView.score >= 80 ? "Excellent" : atsView.score >= 60 ? "Good" : "Needs Improvement"}
                </p>
              </div>
            </div>

            <div className="flex-1 hidden sm:block" />

            {/* Category Pills (each scored 0-100) */}
            <div className="flex flex-wrap gap-2">
              {atsView.categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor(cat.value)}`} />
                  <span className="text-[10px] font-semibold text-gray-600">{cat.label}</span>
                  <span className={`text-[10px] font-bold ${scoreColor(cat.value)}`}>{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Pro Tips Panel */}
      <Card>
        <Card.Content>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCheckCircle size={18} className="text-purple-600" />
              <h4 className="text-sm font-bold text-gray-900">Pro Tips</h4>
            </div>
            {!isPremium && (
              <Link
                href="/premium-services"
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <FiStar size={14} />
                Unlock Full Insights
              </Link>
            )}
          </div>

          {isPremium && atsView.issues.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                <FiAlertCircle size={14} /> Issues ({atsView.issues.length})
              </p>
              <ul className="space-y-1">
                {atsView.issues.slice(0, 3).map((issue, idx) => (
                  <li key={idx} className="text-[11px] text-red-600 flex items-start gap-1.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isPremium && atsView.suggestions.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                <FiCheckCircle size={14} /> Suggestions ({atsView.suggestions.length})
              </p>
              <ul className="space-y-1">
                {atsView.suggestions.slice(0, 6).map((suggestion, idx) => (
                  <li key={idx} className="text-[11px] text-amber-600 flex items-start gap-1.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isPremium && (
            <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
              <FiStar size={20} className="mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-gray-500">
                Get detailed issue analysis and personalized suggestions to improve your resume score.
              </p>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Two-Column Layout: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6 min-w-0">
          <Card noPadding>
            {/* Tab Navigation with Scroll Arrows */}
            <div className="relative">
              {/* Left Scroll Arrow */}
              {showLeftArrow && (
                <button
                  onClick={() => scrollTabs('left')}
                  className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-white via-white to-transparent px-2 flex items-center justify-center transition-all"
                >
                  <div className="bg-white hover:bg-gray-50 rounded-full p-1 shadow-md border border-gray-200">
                    <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </button>
              )}

              {/* Right Scroll Arrow */}
              {showRightArrow && (
                <button
                  onClick={() => scrollTabs('right')}
                  className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-white via-white to-transparent px-2 flex items-center justify-center transition-all"
                >
                  <div className="bg-white hover:bg-gray-50 rounded-full p-1 shadow-md border border-gray-200">
                    <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )}

              {/* Tabs Container */}
              <div
                ref={scrollContainerRef}
                className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide px-4"
              >
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeSection === section.id
                      ? `text-purple-600 border-b-2 border-purple-600 bg-purple-50`
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {section.icon}
                    {section.label}
                  </button>
                ))}
                <button
                  onClick={() => setActiveSection("templates")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeSection === "templates"
                    ? `text-purple-600 border-b-2 border-purple-600 bg-purple-50`
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <FiLayout size={18} />
                  Templates
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 pt-12">
              {activeSection === "personal" && (
                <PersonalInfoForm
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  onFocus={() => setIsFormActive(true)}
                  onBlur={() => setTimeout(() => setIsFormActive(false), 200)}
                />
              )}
              {activeSection === "summary" && (
                <SummaryForm
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  onFocus={() => setIsFormActive(true)}
                  onBlur={() => setTimeout(() => setIsFormActive(false), 200)}
                />
              )}
              {activeSection === "experience" && (
                <ExperienceForm
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  onFocus={() => setIsFormActive(true)}
                  onBlur={() => setTimeout(() => setIsFormActive(false), 200)}
                />
              )}
              {activeSection === "education" && (
                <EducationForm
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  onFocus={() => setIsFormActive(true)}
                  onBlur={() => setTimeout(() => setIsFormActive(false), 200)}
                />
              )}
              {activeSection === "skills" && (
                <SkillsForm
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  onFocus={() => setIsFormActive(true)}
                  onBlur={() => setTimeout(() => setIsFormActive(false), 200)}
                />
              )}
              {activeSection === "certifications" && (
                <CertificationsForm
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  onFocus={() => setIsFormActive(true)}
                  onBlur={() => setTimeout(() => setIsFormActive(false), 200)}
                />
              )}
              {activeSection === "templates" && (
                <div className="pt-2">
                  <ResumeTemplates />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Preview (always visible on desktop) */}
        <div className="space-y-6 min-w-0">
          <Card className="sticky top-24">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className={THEME.components.typography.cardTitle}>Live Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleViewFullscreen}
                    title="View resume"
                    className="p-2 rounded-lg text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <FiEye size={18} />
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className={`${THEME.components.button.primary} px-3 py-1.5 text-xs flex items-center gap-2 ${!templateId ? 'opacity-50' : ''}`}
                  >
                    <FiDownload size={16} />
                    Download PDF
                  </button>
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              <div className={`border border-gray-200 rounded-lg bg-white min-h-[600px] shadow-sm flex justify-center overflow-hidden ${templateId ? 'p-0' : 'p-8'}`}>
                {templateId ? (
                  <div className="relative h-[800px] w-full">
                    <LivePreview templateId={templateId} groupedData={getGroupedData()} scale={0.55} />
                  </div>
                ) : (
                  <ResumePreview data={resumeData} />
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Matching Jobs */}
          {resumeData.personalInfo.fullName && (
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <FiBriefcase size={16} className="text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Matching Jobs</h4>
                </div>
              </Card.Header>
              <Card.Content>
                <p className="text-xs text-gray-500">
                  Complete your resume with a template and download it to start applying. Employers look for well-formatted, ATS-friendly resumes.
                </p>
                <Link
                  href="/profile/jobs?tab=browse"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Browse Jobs →
                </Link>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar - Preview & Save */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm shadow-sm hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          <FiEye size={18} />
          Live Preview
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isSaving ? <FiLoader className="animate-spin" size={18} /> : <FiCheckCircle size={18} />}
          {isSaving ? (isEditMode ? "Updating..." : "Saving...") : "Save"}
        </button>
      </div>

      {/* Mobile Preview Slide-in Panel */}
      {isPreviewOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 right-0 w-full bg-white z-50 overflow-y-auto transform transition-transform duration-300 ease-out">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="fixed top-20 left-4 z-[150] bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all"
              title="Go Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 ml-12">Live Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${!templateId ? 'opacity-50' : ''}`}
                  title="Download PDF"
                >
                  <FiDownload size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className={`border border-gray-200 rounded-lg bg-white shadow-sm flex justify-center overflow-hidden ${templateId ? 'p-0 h-[800px]' : 'p-6'}`}>
                {templateId ? (
                  <div className="relative w-full h-full">
                    <LivePreview templateId={templateId} groupedData={getGroupedData()} scale={0.35} />
                  </div>
                ) : (
                  <ResumePreview data={resumeData} />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Live, debounced preview of the selected template rendered with the current
// form data. Renders the real resume-api template HTML inside an iframe so the
// preview always matches the downloaded PDF.
function LivePreview({
  templateId,
  groupedData,
  scale,
}: {
  templateId: string;
  groupedData: any;
  scale: number;
}) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);
  const dataKey = JSON.stringify(groupedData);

  React.useEffect(() => {
    if (loadedRef.current) return;
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const raw = await fetchTemplateHtml(templateId, JSON.parse(dataKey));
        if (!cancelled) {
          setHtml(withResumeApiBase(raw));
          loadedRef.current = true;
        }
      } catch (err) {
        if (!cancelled) {
          setFailed(true);
          loadedRef.current = true;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [dataKey, templateId]);

  if ((failed && !loading) || process.env.NODE_ENV === 'development') {
    return <FallbackPreview groupedData={groupedData} scale={scale} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden flex justify-center">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <FiLoader className="animate-spin text-purple-600" size={28} />
        </div>
      )}
      {!failed && (
        <div
          className="origin-top"
          style={{ width: "1000px", height: "1414px", transform: `scale(${scale})`, flexShrink: 0 }}
        >
          <iframe
            srcDoc={html}
            style={{ width: "100%", height: "100%", border: 0 }}
            title="Resume Live Preview"
            scrolling="no"
          />
        </div>
      )}
    </div>
  );
}

function FallbackPreview({ groupedData, scale }: { groupedData: any; scale: number }) {
  const data = groupedData?.data || groupedData;
  const p = data?.personalInfo || {};
  const sections: string[] = [];
  sections.push(`<table style="width:100%;border-collapse:collapse"><tr><td style="width:70%"><h1 style="font-size:20px;font-weight:700;margin:0">${p.fullName || 'Resume'}</h1><div style="color:#555;font-size:12px;margin:2px 0">${data?.experience?.[0]?.title || ''}</div><div style="color:#888;font-size:11px;margin:2px 0">${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}</div></td><td style="width:30%;text-align:right;vertical-align:top;font-size:11px;color:#888">${[p.linkedin, p.portfolio].filter(Boolean).join('<br>')}</td></tr></table>`);
  sections.push(`<hr style="border:none;border-top:2px solid #7c3aed;margin:8px 0">`);
  if (data?.summary) sections.push(`<h2 style="font-size:13px;font-weight:600;margin:8px 0 4px;color:#333">Professional Summary</h2><p style="font-size:11px;color:#555;line-height:1.5;margin:0">${data.summary}</p>`);
  if (data?.experience?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Experience</h2>`);
    data.experience.forEach((e: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${e.title || ''}${e.company ? ' <span style="font-weight:400;color:#666">at '+e.company+'</span>' : ''}</div><div style="color:#888;font-size:10px">${[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}${e.location ? ' · '+e.location : ''}</div><div style="font-size:11px;color:#444;margin:2px 0">${e.description || ''}</div></div>`));
  }
  if (data?.education?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Education</h2>`);
    data.education.forEach((e: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${e.degree || ''}${e.institution ? ' — '+e.institution : ''}</div><div style="color:#888;font-size:10px">${[e.graduationDate, e.gpa ? 'GPA: '+e.gpa : ''].filter(Boolean).join(' · ')}</div></div>`));
  }
  if (data?.skills?.length) sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Skills</h2><div style="font-size:11px;color:#444">${Array.isArray(data.skills) ? data.skills.map((s:any) => s.name || s).join(' · ') : ''}</div>`);
  if (data?.certifications?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Certifications</h2>`);
    data.certifications.forEach((c: any) => sections.push(`<div style="font-size:11px;margin:2px 0"><strong>${c.name || ''}</strong>${c.issuer ? ' — '+c.issuer : ''}${c.date ? ' · '+c.date : ''}</div>`));
  }
  const innerHtml = sections.join('');
  return (
    <div className="origin-top flex justify-center" style={{ width: "1000px", transform: `scale(${scale})`, flexShrink: 0, transformOrigin: 'top' }}>
      <div style={{ fontFamily: 'Inter, sans-serif', width: '800px', padding: '24px 32px', color: '#222', lineHeight: '1.5', background: '#fff' }} dangerouslySetInnerHTML={{ __html: innerHtml }} />
    </div>
  );
}

// Form Components
function PersonalInfoForm({ resumeData, setResumeData, onFocus, onBlur }: any) {
  return (
    <div className="space-y-5">
      <h3 className={THEME.components.typography.sectionTitle}>Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Full Name *</label>
          <input
            type="text"
            className={THEME.components.input.default}
            value={resumeData.personalInfo.fullName}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(e) => setResumeData({
              ...resumeData,
              personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
            })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Email *</label>
          <input
            type="email"
            className={THEME.components.input.default}
            value={resumeData.personalInfo.email}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(e) => setResumeData({
              ...resumeData,
              personalInfo: { ...resumeData.personalInfo, email: e.target.value }
            })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Phone *</label>
          <input
            type="tel"
            className={THEME.components.input.default}
            value={resumeData.personalInfo.phone}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(e) => setResumeData({
              ...resumeData,
              personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
            })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Location</label>
          <input
            type="text"
            placeholder="City, Country"
            className={THEME.components.input.default}
            value={resumeData.personalInfo.location}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(e) => setResumeData({
              ...resumeData,
              personalInfo: { ...resumeData.personalInfo, location: e.target.value }
            })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">LinkedIn Profile</label>
          <input
            type="url"
            className={THEME.components.input.default}
            value={resumeData.personalInfo.linkedin}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(e) => setResumeData({
              ...resumeData,
              personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
            })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Portfolio/Website</label>
          <input
            type="url"
            className={THEME.components.input.default}
            value={resumeData.personalInfo.portfolio}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(e) => setResumeData({
              ...resumeData,
              personalInfo: { ...resumeData.personalInfo, portfolio: e.target.value }
            })}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryForm({ resumeData, setResumeData, onFocus, onBlur }: any) {
  return (
    <div className="space-y-4">
      <h3 className={THEME.components.typography.sectionTitle}>Professional Summary</h3>
      <p className="text-sm text-gray-500">
        Write a compelling summary that highlights your key achievements and career goals (50-150 words recommended)
      </p>
      <textarea
        placeholder="Example: Results-driven software engineer with 5+ years of experience in full-stack development..."
        className={`${THEME.components.input.default} min-h-[200px]`}
        value={resumeData.summary}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
      />
      <p className="text-xs text-gray-400 text-right">
        {resumeData.summary.split(' ').filter((w: string) => w).length} words
      </p>
    </div>
  );
}

function ExperienceForm({ resumeData, setResumeData, onFocus, onBlur }: any) {
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: Date.now().toString(),
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map((exp: any) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={THEME.components.typography.sectionTitle}>Work Experience</h3>
        <button
          onClick={addExperience}
          className={`${THEME.components.button.primary} px-4 py-2 text-sm flex items-center gap-2`}
        >
          <FiPlus size={16} />
          Add Experience
        </button>
      </div>

      {resumeData.experience.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <FiBriefcase size={24} />
          </div>
          <p className="text-gray-500 font-medium">No experience added yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your past work experience to boost your ATS score</p>
        </div>
      ) : (
        <div className="space-y-6">
          {resumeData.experience.map((exp: any) => (
            <div key={exp.id} className="p-5 border border-gray-200 rounded-xl space-y-4 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800">Experience Details</h4>
                <button
                  onClick={() => {
                    setResumeData({
                      ...resumeData,
                      experience: resumeData.experience.filter((e: any) => e.id !== exp.id),
                    });
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Job Title *"
                  className={THEME.components.input.default}
                  value={exp.title}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Company *"
                  className={THEME.components.input.default}
                  value={exp.company}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                />
              </div>

              <textarea
                placeholder="Description (Use bullet points for ATS optimization)"
                className={`${THEME.components.input.default} min-h-[120px]`}
                value={exp.description}
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EducationForm({ resumeData, setResumeData, onFocus, onBlur }: any) {
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          id: Date.now().toString(),
          degree: "",
          institution: "",
          location: "",
          graduationDate: "",
          gpa: "",
        },
      ],
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu: any) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={THEME.components.typography.sectionTitle}>Education</h3>
        <button
          onClick={addEducation}
          className={`${THEME.components.button.primary} px-4 py-2 text-sm flex items-center gap-2`}
        >
          <FiPlus size={16} />
          Add Education
        </button>
      </div>

      {resumeData.education.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <FiBook size={24} />
          </div>
          <p className="text-gray-500 font-medium">No education added yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your academic background to complete your profile</p>
        </div>
      ) : (
        <div className="space-y-6">
          {resumeData.education.map((edu: any) => (
            <div key={edu.id} className="p-5 border border-gray-200 rounded-xl space-y-4 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800">Education Details</h4>
                <button
                  onClick={() => {
                    setResumeData({
                      ...resumeData,
                      education: resumeData.education.filter((e: any) => e.id !== edu.id),
                    });
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Degree *</label>
                  <input
                    type="text"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    className={THEME.components.input.default}
                    value={edu.degree}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Institution *</label>
                  <input
                    type="text"
                    placeholder="University/School Name"
                    className={THEME.components.input.default}
                    value={edu.institution}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Graduation Date</label>
                  <input
                    type="text"
                    placeholder="Month, Year"
                    className={THEME.components.input.default}
                    value={edu.graduationDate}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">GPA (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 3.8/4.0"
                    className={THEME.components.input.default}
                    value={edu.gpa}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillsForm({ resumeData, setResumeData, onFocus, onBlur }: any) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className={THEME.components.typography.sectionTitle}>Skills</h3>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Add a skill (e.g., React, Python, Project Management)"
          className={THEME.components.input.default}
          value={newSkill}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addSkill()}
        />
        <button
          onClick={addSkill}
          className={`${THEME.components.button.primary} px-6`}
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {resumeData.skills.map((skill: string, idx: number) => (
          <span
            key={idx}
            className={`px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium flex items-center gap-2`}
          >
            {skill}
            <button
              onClick={() => {
                setResumeData({
                  ...resumeData,
                  skills: resumeData.skills.filter((_: any, i: number) => i !== idx),
                });
              }}
              className="hover:text-red-600 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        {resumeData.skills.length === 0 && (
          <p className="text-sm text-gray-400 italic">No skills added yet. Add at least 5 skills.</p>
        )}
      </div>
    </div>
  );
}

function CertificationsForm({ resumeData, setResumeData, onFocus, onBlur }: any) {
  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [
        ...resumeData.certifications,
        {
          id: Date.now().toString(),
          name: "",
          issuer: "",
          date: "",
        },
      ],
    });
  };

  const updateCertification = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.map((cert: any) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={THEME.components.typography.sectionTitle}>Certifications</h3>
        <button
          onClick={addCertification}
          className={`${THEME.components.button.primary} px-4 py-2 text-sm flex items-center gap-2`}
        >
          <FiPlus size={16} />
          Add Certification
        </button>
      </div>

      {resumeData.certifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <FiAward size={24} />
          </div>
          <p className="text-gray-500 font-medium">No certifications added yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your professional certifications to stand out</p>
        </div>
      ) : (
        <div className="space-y-6">
          {resumeData.certifications.map((cert: any) => (
            <div key={cert.id} className="p-5 border border-gray-200 rounded-xl space-y-4 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800">Certification Details</h4>
                <button
                  onClick={() => {
                    setResumeData({
                      ...resumeData,
                      certifications: resumeData.certifications.filter((c: any) => c.id !== cert.id),
                    });
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Certification Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., AWS Certified Solutions Architect"
                    className={THEME.components.input.default}
                    value={cert.name}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Issuing Organization *</label>
                  <input
                    type="text"
                    placeholder="e.g., Amazon Web Services"
                    className={THEME.components.input.default}
                    value={cert.issuer}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Date Obtained</label>
                  <input
                    type="text"
                    placeholder="Month, Year"
                    className={THEME.components.input.default}
                    value={cert.date}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResumePreview({ data }: { data: ResumeData }) {
  const rawData = (() => {
    try {
      const raw = localStorage.getItem('rawResumeData_' + new URLSearchParams(window.location.search).get('upload_id'));
      return raw ? JSON.parse(raw)?.data : null;
    } catch { return null; }
  })();

  const p = data.personalInfo;
  const designation = data.experience[0]?.title || rawData?.work_experience?.[0]?.job_title || '';

  return (
    <div className="space-y-3 font-sans max-w-[210mm] mx-auto text-xs leading-relaxed">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-900 pb-3">
        <h1 className="text-xl font-bold text-gray-900">{p.fullName || ''}</h1>
        {designation && <p className="text-sm text-gray-700 font-medium mt-0.5">{designation}</p>}
        <div className="text-[11px] text-gray-600 mt-1 space-y-0.5">
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
          {p.portfolio && <div>https://{p.portfolio.replace(/^https?:\/\//, '')}</div>}
          {p.linkedin && <div>LinkedIn: {p.linkedin.replace(/^https?:\/\//, '')}</div>}
          {rawData?.additional_info?.github_url && <div>GitHub: {rawData.additional_info.github_url.replace(/^https?:\/\//, '')}</div>}
        </div>
      </div>

      {/* Profile */}
      {data.summary && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Profile</h2>
          <p className="text-gray-700 text-justify">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-gray-800">{exp.title}</span>
                <span className="text-[10px] text-gray-500">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-[11px] text-gray-600">{exp.company}</div>
              <div className="text-gray-700 mt-0.5">{exp.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {rawData?.projects?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Projects</h2>
          {rawData.projects.map((proj: any, idx: number) => (
            <div key={idx} className="mb-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-gray-800">{proj.name || proj.title}</span>
                <span className="text-[10px] text-gray-500">{proj.start_date} – {proj.end_date || 'Present'}</span>
              </div>
              <div className="text-gray-700 mt-0.5">{proj.description}</div>
              {proj.highlights?.length > 0 && proj.highlights.map((h: string, i: number) => (
                <div key={i} className="text-gray-600 text-[11px] ml-2">– {h}</div>
              ))}
              {proj.url && <div className="text-blue-600 text-[11px]">{proj.url}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Volunteer */}
      {rawData?.volunteer?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Volunteer</h2>
          {rawData.volunteer.map((v: any, idx: number) => (
            <div key={idx} className="mb-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-gray-800">{v.position}</span>
                <span className="text-[10px] text-gray-500">{v.start_date} – {v.end_date || 'Present'}</span>
              </div>
              <div className="text-[11px] text-gray-600">{v.organization}</div>
              <div className="text-gray-700 mt-0.5">{v.summary || v.description}</div>
              {v.highlights?.length > 0 && v.highlights.map((h: string, i: number) => (
                <div key={i} className="text-gray-600 text-[11px] ml-2">– {h}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-1.5">
              <div className="text-xs font-semibold text-gray-800">{edu.degree}</div>
              <div className="text-[11px] text-gray-600">{edu.institution}</div>
              <div className="text-[10px] text-gray-500">{edu.graduationDate}</div>
              {edu.gpa && <div className="text-[11px] text-gray-600">Score: {edu.gpa}</div>}
              {rawData?.education?.find((e: any) => e.institution === edu.institution)?.courses?.length > 0 && (
                <div className="text-[11px] text-gray-600">Courses: {rawData.education.find((e: any) => e.institution === edu.institution).courses.join(' · ')}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Skills</h2>
          {rawData?.skills?.length > 0 ? rawData.skills.map((s: any, idx: number) => (
            <div key={idx} className="mb-1">
              {typeof s === 'string' ? (
                <div className="text-gray-800 text-xs">{s}</div>
              ) : (
                <div>
                  <div className="text-gray-800 text-xs font-medium">{s.name}</div>
                  {s.keywords?.length > 0 && (
                    <div className="text-gray-600 text-[11px] ml-2">{s.keywords.join(' · ')}</div>
                  )}
                </div>
              )}
            </div>
          )) : (
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="text-gray-700">{skill}{idx < data.skills.length - 1 ? '' : ''}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Languages */}
      {rawData?.languages?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Languages</h2>
          {rawData.languages.map((lang: any, idx: number) => (
            <div key={idx} className="text-gray-700 text-xs">{lang.language || lang} — {lang.fluency || 'Native speaker'}</div>
          ))}
        </div>
      )}

      {/* Certificates */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Certificates</h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} className="text-gray-700 text-xs">{cert.name} — {cert.issuer} ({cert.date})</div>
          ))}
        </div>
      )}

      {/* Awards */}
      {rawData?.awards?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Awards</h2>
          {rawData.awards.map((a: any, idx: number) => (
            <div key={idx} className="mb-1">
              <div className="text-gray-800 text-xs font-medium">{a.title} — {a.awarder} ({a.date})</div>
              {a.summary && <div className="text-gray-600 text-[11px]">{a.summary}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Publications */}
      {rawData?.publications?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Publications</h2>
          {rawData.publications.map((pub: any, idx: number) => (
            <div key={idx} className="mb-1">
              <div className="text-gray-800 text-xs font-medium">{pub.name} — {pub.publisher} ({pub.release_date})</div>
              {pub.summary && <div className="text-gray-600 text-[11px]">{pub.summary}</div>}
              {pub.url && <div className="text-blue-600 text-[11px]">{pub.url}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Interests */}
      {rawData?.interests?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">Interests</h2>
          <div className="text-gray-700 text-xs">{rawData.interests.map((i: any) => i.name || i).join(', ')}</div>
        </div>
      )}

      {/* References */}
      {rawData?.references?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1">References</h2>
          {rawData.references.map((ref: any, idx: number) => (
            <div key={idx} className="mb-1">
              <div className="text-gray-800 text-xs font-medium">{ref.name}</div>
              {ref.reference && <div className="text-gray-600 text-[11px]">{ref.reference}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

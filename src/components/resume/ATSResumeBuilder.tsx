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
  FiRefreshCw,
  FiArrowLeft,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import { THEME } from "../../styles/theme";
import Card from "../shared/Card";
import apiClient from "@/lib/api/config";
import {
  fetchTemplateHtml,
  withResumeApiBase,
  downloadTemplatePdf,
  openHtmlWindow,
  AtsScore,
  fetchSchema,
  matchJobDescription,
  aiGenerateText,
  aiApplyAll,
  aiApplySummary,
  aiApplyKeywords,
  aiApplyVerbs,
  toJsonResumeFormat,
  renderTemplateHtmlRaw,
  generateTemplatePdf,
} from "@/services/resumeApi";
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
  const [mounted, setMounted] = React.useState(false);

  // Defer search param reads until after hydration so SSR and first client
  // render produce identical HTML (prevents hydration mismatch).
  React.useEffect(() => { setMounted(true); }, []);

  const uploadId = !mounted ? null : (searchParams?.get('upload_id') ?? null);
  const resumeId = !mounted ? null : (searchParams?.get('resume_id') ?? null);
  const templateId = !mounted ? null : (searchParams?.get('template_id') ?? null);
  const { user } = useAuth();
  const isPremium = user?.user_balance_job_seeker?.premium_designs_available === 1 || (user?.userBalance?.no_of_resume ?? 0) > 0;

  const updateUrlWithId = (newId: string | number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? window.location.search);
    params.set('resume_id', newId.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const [activeSection, setActiveSection] = useState<string>("personal");
  const [issuesExpanded, setIssuesExpanded] = useState(false);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'editor'>('split');
  const [isFormActive, setIsFormActive] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [builderId, setBuilderId] = useState<number | null>(null);
  const idCounter = useRef(0);
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

  // JD Match state
  const [jdText, setJdText] = useState("");
  const [jdMatchResult, setJdMatchResult] = useState<Record<string, any> | null>(null);
  const [jdMatchLoading, setJdMatchLoading] = useState(false);
  const [jdPanelExpanded, setJdPanelExpanded] = useState(false);

  // AI Generate state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState("");
  const [aiGenKey, setAiGenKey] = useState(0);
  const [aiOptions, setAiOptions] = useState<string[]>([]);
  const [aiPanelExpanded, setAiPanelExpanded] = useState(false);
  const [aiSelectedOption, setAiSelectedOption] = useState<number | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any> | null>(null);

  // Schema sample
  const [schemaLoading, setSchemaLoading] = useState(false);

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
    if (storageKey && typeof window !== 'undefined') {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          baseRawData = JSON.parse(raw);
        } catch (e) { }
      }
    }

    const safeArray = (arr: any[] | undefined | null): any[] => Array.isArray(arr) ? arr : [];

    const mapStateToData = () => ({
      personal_information: {
        full_name: dataToUse.personalInfo?.fullName ?? "",
        email: dataToUse.personalInfo?.email ?? "",
        phone: dataToUse.personalInfo?.phone ?? "",
        location: dataToUse.personalInfo?.location ?? "",
        linkedin_profile: dataToUse.personalInfo?.linkedin || null,
        portfolio_website: dataToUse.personalInfo?.portfolio || null
      },
      professional_summary: dataToUse.summary ?? "",
      work_experience: safeArray(dataToUse.experience).map((exp: any) => ({
        job_title: exp.title ?? "",
        company: exp.company ?? "",
        location: exp.location || "Remote",
        duration: `${exp.startDate ?? ""} - ${exp.current ? 'Present' : (exp.endDate ?? "")}`,
        start_date: exp.startDate ?? "",
        end_date: exp.current ? 'Present' : (exp.endDate ?? ""),
        responsibilities: exp.description ? exp.description.split('\n').filter(Boolean) : []
      })),
      education: safeArray(dataToUse.education).map((edu: any) => ({
        degree: edu.degree ?? "",
        major: null,
        institution: edu.institution ?? "",
        location: edu.location || "",
        start_year: null,
        end_year: edu.graduationDate ?? "",
        grade: edu.gpa || null
      })),
      projects: baseRawData?.data?.projects || [],
      hobbies: baseRawData?.data?.hobbies || [],
      skills: safeArray(dataToUse.skills),
      certifications: safeArray(dataToUse.certifications).map((cert: any) => ({
        name: cert.name ?? "",
        issuing_organization: cert.issuer ?? "",
        date_obtained: cert.date ?? ""
      })),
      additional_info: baseRawData?.data?.additional_info || {
        technical_skills: [],
        soft_skills: [],
        languages: [],
        achievements: [],
        awards: [],
        github_url: null,
        years_of_experience: 0,
        inferred_job_title: safeArray(dataToUse.experience)[0]?.title || ""
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
      const storageKey = uploadId || resumeId || 'new';
      const templateInfo = templateId ? { id: templateId, savedAt: new Date().toISOString() } : {};
      localStorage.setItem(`selectedTemplate_${storageKey}`, JSON.stringify(templateInfo));
      const payload = {
        title: resumeData.personalInfo.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : "My Resume",
        parsed_data: JSON.stringify(parsedDataPayload),
        template_data: JSON.stringify(templateInfo),
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
  const getGroupedData = () => {
    const data = generateParsedDataPayload().data;
    // Remove empty arrays so templates don't render sections with no data
    // (e.g. Awards, Volunteer, Publications). Keeps 0, false, null, "" etc.
    const strip = (obj: Record<string, any>): Record<string, any> =>
      Object.fromEntries(
        Object.entries(obj).flatMap(([k, v]) => {
          if (Array.isArray(v)) return v.length > 0 ? [[k, v]] : [];
          if (v && typeof v === 'object' && !(v instanceof Date)) {
            const cleaned = strip(v);
            return Object.keys(cleaned).length > 0 ? [[k, cleaned]] : [];
          }
          return [[k, v]];
        })
      );
    return strip(data);
  };

  // Open the selected template, rendered with the current data, in a print
  // window so the user can "Save as PDF".
  const handleDownloadPdf = async () => {
    const name = resumeData.personalInfo.fullName?.trim() || "Resume";
    const filename = `${name.replace(/\s+/g, "_")}_Resume.pdf`;
    const toastId = toast.loading("Generating your PDF...");

    // No template selected — use the browser print dialog as fallback.
    if (!templateId) {
      openResumeWindow();
      toast.dismiss(toastId);
      return;
    }

    try {
      await downloadTemplatePdf(templateId, { data: getGroupedData() }, filename);
      toast.success("Resume downloaded!", { id: toastId });
    } catch (err) {
      // Server-side download unavailable — fall back to browser print dialog
      // with client-side rendered HTML.
      console.error("PDF download error:", err);
      openResumeWindow();
      toast("Opened print dialog — choose “Save as PDF”.", { id: toastId, icon: "🖨️" });
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
    if (typeof window === 'undefined') return;
    const p = resumeData.personalInfo || {} as any;
    const win = window.open('', '_blank');
    if (!win) { toast.error("Pop-up blocked"); return; }

    // Try to read projects from localStorage (same key ResumePreview uses).
    let rawProjects: any[] = [];
    try {
      const id = new URLSearchParams(window.location.search).get('upload_id');
      if (id) {
        const raw = localStorage.getItem('rawResumeData_' + id);
        if (raw) rawProjects = JSON.parse(raw)?.data?.projects || [];
      }
    } catch { /* ignore */ }

    const sectionHtml = (label: string, content: string) => content ? `<div style="margin-bottom:14px"><h2 style="font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #7c3aed;padding-bottom:4px;margin-bottom:6px">${label}</h2>${content}</div>` : '';
    const contactHtml = [p.email, p.phone, p.location].filter(Boolean).join(' &nbsp;|&nbsp; ');
    const linkedinHtml = p.linkedin ? `<div>${escHtml(p.linkedin)}</div>` : '';
    const summaryHtml = resumeData.summary ? `<p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0">${escHtml(resumeData.summary)}</p>` : '';
    const expHtml = (resumeData.experience || []).map(e => e?.title || e?.company ? `<div style="margin-bottom:8px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(e.title || '')}</div><div style="color:#6b7280;font-size:12px">${[e.company, e.startDate ? `${e.startDate} – ${e.current ? 'Present' : e.endDate || ''}` : ''].filter(Boolean).join(' · ')}</div>${e.description ? `<div style="font-size:12px;color:#4b5563;margin-top:2px;line-height:1.5">${escHtml(e.description)}</div>` : ''}</div>` : '').filter(Boolean).join('');
    const eduHtml = (resumeData.education || []).map(e => e?.degree || e?.institution ? `<div style="margin-bottom:4px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(e.degree || '')}</div><div style="color:#6b7280;font-size:12px">${[e.institution, e.graduationDate].filter(Boolean).join(' · ')}${e.gpa ? ` · <span style="font-weight:500">GPA: ${escHtml(e.gpa)}</span>` : ''}</div></div>` : '').filter(Boolean).join('');
    const skillsHtml = (resumeData.skills || []).length ? resumeData.skills.map(s => escHtml(s)).join(' &middot; ') : '';
    const projHtml = rawProjects.map((pr: any) => pr.name || pr.title ? `<div style="margin-bottom:8px"><div style="font-weight:600;font-size:13px;color:#111827">${escHtml(pr.name || pr.title)}</div><div style="color:#6b7280;font-size:12px">${[pr.start_date, pr.end_date || 'Present'].filter(Boolean).join(' – ')}</div>${pr.description ? `<div style="font-size:12px;color:#4b5563;margin-top:2px;line-height:1.5">${escHtml(pr.description)}</div>` : ''}${(pr.highlights||[]).length ? pr.highlights.map((h: string) => `<div style="font-size:11px;color:#555;margin:1px 0 1px 16px">– ${escHtml(h)}</div>`).join('') : ''}</div>` : '').filter(Boolean).join('');
    const certHtml = (resumeData.certifications || []).map(c => c.name ? `<div style="margin-bottom:4px;font-size:12px"><strong>${escHtml(c.name)}</strong>${c.issuer ? ' — '+escHtml(c.issuer) : ''}${c.date ? ' · '+c.date : ''}</div>` : '').filter(Boolean).join('');
    const hasData = p.fullName || contactHtml || summaryHtml || expHtml || eduHtml || skillsHtml || projHtml || certHtml;
    const bodyContent = hasData
      ? `<div class="page"><div class="header"><h1>${escHtml(p.fullName || '')}</h1>${resumeData.experience?.[0]?.title ? `<div class="title">${escHtml(resumeData.experience[0].title)}</div>` : ''}${contactHtml ? `<div class="contact">${contactHtml}</div>` : ''}${linkedinHtml ? `<div class="contact" style="margin-top:2px">${linkedinHtml}</div>` : ''}</div>${sectionHtml('Professional Summary', summaryHtml)}${sectionHtml('Experience', expHtml)}${sectionHtml('Education', eduHtml)}${sectionHtml('Skills', skillsHtml)}${sectionHtml('Projects', projHtml)}${sectionHtml('Certifications', certHtml)}</div>`
      : `<div class="page" style="text-align:center;padding:80px 48px"><div style="font-size:48px;margin-bottom:16px">📄</div><h2 style="color:#374151;margin-bottom:8px">No Resume Data</h2><p style="color:#6b7280;font-size:14px;line-height:1.6">Fill in your details in the Resume Builder and click <strong>Save</strong>.<br>Then open the preview again to see your completed resume.</p></div>`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escHtml(p.fullName || '')} - Preview</title><style>@page{size:A4;margin:15mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,Segoe UI,sans-serif;background:#f3f4f6;display:flex;justify-content:center;padding:40px 16px}@media print{body{background:#fff;padding:0}}@media screen{.page{max-width:800px;width:100%;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.1);padding:40px 48px;border-radius:4px}}.header{margin-bottom:20px}.header h1{font-size:26px;font-weight:700;color:#111827;margin:0;line-height:1.2}.header .title{font-size:14px;color:#6b7280;margin-top:2px}.header .contact{font-size:13px;color:#6b7280;margin-top:4px}</style></head><body>${bodyContent}</body></html>`;
    try { win.document.write(html); win.document.close(); } catch (e) { toast.error("Failed to open preview"); }
  };

  // Calculate ATS Score — comprehensive local heuristic (replaces broken API)
  const calculateATSScore = () => {
    let score = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];

    let personalInfo = 0;
    let summaryScore = 0;
    let experienceScore = 0;
    let educationScore = 0;
    let skillsScore = 0;
    let projectsScore = 0;
    let certsScore = 0;
    let quantifyScore = 0;

    // --- Contact (max 30) ---
    if (resumeData.personalInfo.fullName) { score += 8; personalInfo += 8; }
    else issues.push("Missing full name");
    if (resumeData.personalInfo.email) { score += 8; personalInfo += 8; }
    else issues.push("Missing email");
    if (resumeData.personalInfo.phone) { score += 7; personalInfo += 7; }
    else issues.push("Missing phone number");
    if (resumeData.personalInfo.location) { score += 4; personalInfo += 4; }
    else suggestions.push("Add your location for better ATS匹配");
    if (resumeData.personalInfo.linkedin) { score += 3; personalInfo += 3; }

    // --- Summary (max 15) ---
    const summaryLen = (resumeData.summary || '').length;
    if (summaryLen > 200) { score += 15; summaryScore = 15; }
    else if (summaryLen > 100) { score += 12; summaryScore = 12; }
    else if (summaryLen > 50) { score += 8; summaryScore = 8; suggestions.push("Expand summary to 200+ characters for better score"); }
    else if (summaryLen > 0) { score += 4; summaryScore = 4; suggestions.push("Add a professional summary (200+ characters)"); }
    else issues.push("No professional summary added");

    // --- Experience (max 20) ---
    if (resumeData.experience.length > 0) {
      const exp = resumeData.experience[0];
      const descLen = (exp.description || '').length;
      if (descLen > 300) { score += 20; experienceScore = 20; }
      else if (descLen > 150) { score += 16; experienceScore = 16; }
      else if (descLen > 50) { score += 10; experienceScore = 10; suggestions.push("Add more details to your experience (300+ characters)"); }
      else { score += 5; experienceScore = 5; suggestions.push("Flesh out your experience descriptions"); }
      // Quantify bonus
      const hasNumbers = /\d/.test(exp.description || '');
      if (hasNumbers) { score += 3; quantifyScore = 3; }
      else suggestions.push("Add numbers/metrics to experience (e.g. 'improved performance by 30%')");
    } else {
      issues.push("No work experience added");
    }

    // --- Education (max 12) ---
    if (resumeData.education.length > 0) {
      score += 12; educationScore = 12;
    } else {
      issues.push("No education added");
    }

    // --- Skills (max 15) ---
    const skillCount = resumeData.skills.length;
    if (skillCount >= 10) { score += 15; skillsScore = 15; }
    else if (skillCount >= 7) { score += 12; skillsScore = 12; }
    else if (skillCount >= 5) { score += 9; skillsScore = 9; }
    else if (skillCount >= 2) { score += 5; skillsScore = 5; suggestions.push("Add at least 7 skills for a stronger score"); }
    else if (skillCount === 1) { score += 2; skillsScore = 2; suggestions.push("Add more skills (at least 5)"); }
    else issues.push("No skills added");

    // --- Projects (max 8) ---
    const projects = (resumeData as any).projects || [];
    if (projects.length >= 2) { score += 8; projectsScore = 8; }
    else if (projects.length === 1) { score += 4; projectsScore = 4; }
    else suggestions.push("Add 1-2 projects to boost your score");

    // --- Certifications (max 5) ---
    if (resumeData.certifications.length >= 2) { score += 5; certsScore = 5; }
    else if (resumeData.certifications.length === 1) { score += 3; certsScore = 3; }
    else suggestions.push("Add certifications to stand out");

    setAtsScore({
      score: Math.min(score, 100),
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

    // Also build an apiAtsScore-compatible object so the rich UI renders
    setApiAtsScore({
      overall_score: Math.min(score, 100),
      breakdown: {
        contact_info: personalInfo,
        summary: summaryScore,
        work_experience: experienceScore,
        quantification: quantifyScore,
        skills: skillsScore,
        education: educationScore,
        projects: projectsScore,
        certifications: certsScore,
      },
      feedback: [...issues, ...suggestions],
      stats: {},
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

  // Score is now computed entirely by calculateATSScore() above.
  // No external API or localStorage seeding needed.

  // Live API re-scoring disabled — external backend returns 500.
  // Local heuristic is the primary score; manual "Check ATS" button available.

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
            id: exp.id || `exp_${++idCounter.current}`,
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
            id: edu.id || `edu_${++idCounter.current}`,
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
            id: cert.id || `cert_${++idCounter.current}`,
            name: cert.name || "",
            issuer: cert.issuer || cert.issuing_organization || "",
            date: cert.date || cert.date_obtained || "",
          })),
        };

        setResumeData(mappedData);

        // Auto-save only if it's a freshly uploaded resume (no resumeId yet)
        if (!resumeId && !builderId) {
          autoSaveResume(mappedData);
        }
      } catch (e) {
        console.error("Failed to parse resume data", e);
      }
    }
  }, [uploadId, resumeId, builderId]);


  const sections = [
    { id: "personal", label: "Personal Info", icon: <FiUser size={18} /> },
    { id: "summary", label: "Summary", icon: <FiFileText size={18} /> },
    { id: "experience", label: "Experience", icon: <FiBriefcase size={18} /> },
    { id: "education", label: "Education", icon: <FiBook size={18} /> },
    { id: "skills", label: "Skills", icon: <FiCode size={18} /> },
    { id: "certifications", label: "Certifications", icon: <FiAward size={18} /> },
  ];

  const renderFormContent = () => (
    <div className="px-6 pb-6 pt-2">
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
  );

  // Unified score view: prefer the real API analysis, fall back to the local
  // heuristic. Category values are normalised to 0-100 either way.
  const hasApiScore = apiAtsScore && typeof apiAtsScore.overall_score === 'number' && apiAtsScore.overall_score > 0;
  const atsView = hasApiScore
    ? {
        isApi: true,
        score: apiAtsScore!.overall_score,
        categories: [
          { label: "Contact", value: apiAtsScore.breakdown?.contact_info ?? 0 },
          { label: "Summary", value: apiAtsScore.breakdown?.summary ?? 0 },
          { label: "Experience", value: apiAtsScore.breakdown?.work_experience ?? 0 },
          { label: "Quantify", value: apiAtsScore.breakdown?.quantification ?? 0 },
          { label: "Skills", value: apiAtsScore.breakdown?.skills ?? 0 },
          { label: "Education", value: apiAtsScore.breakdown?.education ?? 0 },
          { label: "Projects", value: apiAtsScore.breakdown?.projects ?? 0 },
          { label: "Certs", value: apiAtsScore.breakdown?.certifications ?? 0 },
        ],
        issues: [] as string[],
        suggestions: apiAtsScore.feedback ?? [],
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

  const STEPS = [
    { label: 'Start', sub: 'Create/Upload' },
    { label: 'Job Details', sub: 'Fill Details' },
    { label: 'Templates', sub: 'Design' },
  ];
  const activeStep = templateId ? 3 : 2;

  const handleBackToResumes = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('tab', 'resume');
    params.set('resumeTab', 'versions');
    params.delete('upload_id');
    params.delete('resume_id');
    params.delete('template_id');
    router.push(`/profile/jobs?${params.toString()}`);
  };

  const StepBar = () => (
    <div className="pt-2 pb-2">
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

  return (
    <div className="space-y-4">
      {/* Back to Resumes */}
      <button
        onClick={handleBackToResumes}
        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group cursor-pointer"
      >
        <div className="p-2 rounded-full bg-gray-100 group-hover:bg-purple-50 transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm">Back to My Resumes</span>
      </button>

      {/* Step Progress Bar */}
      <StepBar />

      {/* ATS Score - Sticky Banner */}
      <div className="sticky top-0 z-30 bg-[#f3f2ed] py-2 -mx-4 md:-mx-6 px-4 md:px-6">
        <Card className="shadow-md">
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
            <div className="flex flex-wrap gap-2 items-center">
              {atsView.categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor(cat.value)}`} />
                  <span className="text-[10px] font-semibold text-gray-600">{cat.label}</span>
                  <span className={`text-[10px] font-bold ${scoreColor(cat.value)}`}>{cat.value}</span>
                </div>
              ))}
              <button
                onClick={() => calculateATSScore()}
                className="ml-1 flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-purple-700 bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 hover:border-purple-300 active:scale-95 transition-all shadow-sm"
              >
                <FiRefreshCw size={12} />
                Check ATS
              </button>
            </div>
          </div>
        </Card.Content>
      </Card>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* AI SUGGESTIONS — Premium Panel              */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 shadow-sm">
        {/* Header — always visible, toggles expand */}
        <button
          onClick={() => setAiPanelExpanded(v => !v)}
          className="w-full flex items-center gap-3 px-5 py-4 text-left group"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <FiStar className="text-white" size={18} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              AI Resume Enhancement
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-white">AI</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Generate bullet points, rewrite summary, optimize for ATS</p>
          </div>
          <FiChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 ${aiPanelExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Expandable content */}
        {aiPanelExpanded && (
          <div className="px-5 pb-5 space-y-4 border-t border-purple-100 pt-4">
            {/* AI Generate Text */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                  <FiFileText size={12} className="text-indigo-600" />
                </div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">AI Bullet Writer</h4>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Generate 3 AI-powered achievement bullets to compare and pick the best.</p>
              <button
                onClick={async () => {
                  setAiGenerating(true);
                  setAiOptions([]);
                  setAiSelectedOption(null);
                  setAiGeneratedText("");
                  try {
                    const payload = generateParsedDataPayload();
                    const parsed = toJsonResumeFormat(payload?.data ?? payload);
                    const results = await Promise.all(
                      [1, 2, 3].map(num =>
                        aiGenerateText({ resume: parsed, attempt_number: num }).then(r => (r?.generated_text || r?.text || "") as string)
                      )
                    );
                    const valid = results.filter(t => t.length > 0);
                    if (valid.length > 0) {
                      setAiOptions(valid);
                      toast.success(`${valid.length} options generated!`);
                    } else {
                      toast.error("No text generated");
                    }
                  } catch (e: any) {
                    const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "AI generation failed";
                    toast.error(msg);
                  }
                  setAiGenerating(false);
                }}
                disabled={aiGenerating}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.98]"
              >
                {aiGenerating ? (
                  <><FiLoader className="animate-spin" size={14} /> Generating...</>
                ) : (
                  <><FiStar size={14} /> Generate with AI</>
                )}
              </button>

              {/* 3 Options Comparison */}
              {aiOptions.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Choose an option:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {aiOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setAiSelectedOption(idx); setAiGeneratedText(opt); setAiGenKey(k => k + 1); }}
                        className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                          aiSelectedOption === idx
                            ? 'border-purple-500 bg-purple-50 shadow-md ring-1 ring-purple-200'
                            : 'border-gray-100 bg-gray-50/50 hover:border-purple-300 hover:bg-purple-50/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            aiSelectedOption === idx ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            Option {idx + 1}
                          </span>
                          {aiSelectedOption === idx && (
                            <span className="text-[9px] font-bold text-purple-600 flex items-center gap-1">
                              <FiCheckCircle size={10} /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{opt}</p>
                      </div>
                    ))}
                  </div>

                  {aiSelectedOption !== null && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        className="w-full border border-purple-200 rounded-lg p-3 text-xs text-gray-800 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows={6}
                        key={aiGenKey}
                        defaultValue={aiGeneratedText}
                        onChange={(e) => setAiGeneratedText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { navigator.clipboard.writeText(aiGeneratedText); toast.success("Copied!"); }}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 font-medium"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            const exp = resumeData.experience;
                            if (exp.length > 0) {
                              const updated = [...exp];
                              updated[0] = { ...updated[0], description: updated[0].description ? updated[0].description + "\n" + aiGeneratedText : aiGeneratedText };
                              setResumeData(prev => ({ ...prev, experience: updated }));
                              toast.success("Added to first experience!");
                            }
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                        >
                          Add to Experience
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Apply Quick Actions */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                  <FiRefreshCw size={12} className="text-purple-600" />
                </div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">One-Click Optimizations</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    try {
                      const payload = generateParsedDataPayload();
                      const parsed = toJsonResumeFormat(payload?.data ?? payload);
                      const summary = resumeData.summary;
                      if (!summary) { toast.error("No summary to rewrite"); return; }
                      const result = await aiApplySummary({ resume: parsed, summary_rewrite: summary });
                      if (result?.resume) toast.success("Summary applied!");
                      else toast.error("No response");
                    } catch (e: any) {
                      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Apply failed";
                      toast.error(msg);
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-center"
                >
                  Rewrite Summary
                </button>
                <button
                  onClick={async () => {
                    try {
                      const payload = generateParsedDataPayload();
                      const parsed = toJsonResumeFormat(payload?.data ?? payload);
                      const skillsArr = Array.isArray(resumeData.skills) ? resumeData.skills : [];
                      const kws = skillsArr.map((s: string) => ({ keyword: s, section: "skills" }));
                      if (!kws.length) { toast.error("No skills to optimize"); return; }
                      const result = await aiApplyKeywords({ resume: parsed, keyword_suggestions: kws });
                      if (result?.resume) toast.success("Keywords optimized!");
                      else toast.error("No response");
                    } catch (e: any) {
                      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Apply failed";
                      toast.error(msg);
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-center"
                >
                  Optimize Keywords
                </button>
                <button
                  onClick={async () => {
                    try {
                      const payload = generateParsedDataPayload();
                      const parsed = toJsonResumeFormat(payload?.data ?? payload);
                      const expArr = Array.isArray(resumeData.experience) ? resumeData.experience : [];
                      const upgrades = expArr.filter((e: any) => e.description).map((e: any) => ({ from: "", to: e.title || "" }));
                      if (!upgrades.length) { toast.error("No experience to upgrade"); return; }
                      const result = await aiApplyVerbs({ resume: parsed, action_verb_upgrades: upgrades });
                      if (result?.resume) toast.success("Action verbs upgraded!");
                      else toast.error("No response");
                    } catch (e: any) {
                      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Apply failed";
                      toast.error(msg);
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-center"
                >
                  Upgrade Verbs
                </button>
                <button
                  onClick={async () => {
                    try {
                      const payload = generateParsedDataPayload();
                      const parsed = toJsonResumeFormat(payload?.data ?? payload);
                      const skillsArr = Array.isArray(resumeData.skills) ? resumeData.skills : [];
                      const expArr = Array.isArray(resumeData.experience) ? resumeData.experience : [];
                      const summary = resumeData.summary ?? "";
                      const kws = skillsArr.map((s: string) => ({ keyword: s, section: "skills" }));
                      const upgrades = expArr.filter((e: any) => e.description).map((e: any) => ({ from: "", to: e.title || "" }));
                      if (!summary && !kws.length && !upgrades.length) {
                        toast.error("Fill summary, skills, or experience first");
                        return;
                      }
                      const result = await aiApplyAll({
                        resume: parsed,
                        ai_analysis: { summary_rewrite: summary || "", keyword_suggestions: kws, action_verb_upgrades: upgrades },
                      });
                      if (result?.resume) toast.success("All optimizations applied!");
                      else toast.error("No response");
                    } catch (e: any) {
                      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Apply all failed";
                      toast.error(msg);
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all active:scale-[0.98] col-span-2 text-center"
                >
                  Apply All Optimizations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* JD MATCH — Premium Panel                    */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-sm">
        <button
          onClick={() => setJdPanelExpanded(v => !v)}
          className="w-full flex items-center gap-3 px-5 py-4 text-left group"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <FiCheckCircle className="text-white" size={18} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Job Description Match
              {jdMatchResult && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  (jdMatchResult.match_score as number || 0) >= 70 ? 'bg-green-100 text-green-700'
                  : (jdMatchResult.match_score as number || 0) >= 40 ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
                }`}>
                  {jdMatchResult.match_score ?? jdMatchResult.score ?? "N/A"}%
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Compare your resume against a job description</p>
          </div>
          <FiChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 ${jdPanelExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {jdPanelExpanded && (
          <div className="px-5 pb-5 space-y-4 border-t border-emerald-100 pt-4">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Paste Job Description</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-800 bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                rows={5}
                placeholder="Paste the job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!jdText.trim()) { toast.error("Paste a job description first"); return; }
                  setJdMatchLoading(true);
                  setJdMatchResult(null);
                  try {
                    const parsed = toJsonResumeFormat(generateParsedDataPayload().data);
                    const result = await matchJobDescription({ resume: parsed, job_description: jdText });
                    setJdMatchResult(result);
                    toast.success("Match analysis complete!");
                  } catch (e: any) {
                    const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "JD match failed";
                    toast.error(msg);
                  }
                  setJdMatchLoading(false);
                }}
                disabled={jdMatchLoading}
                className="mt-3 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 flex items-center gap-2 shadow-md shadow-emerald-200 transition-all hover:shadow-lg active:scale-[0.98]"
              >
                {jdMatchLoading ? <><FiLoader className="animate-spin" size={14} /> Analyzing...</> : "Analyze Match"}
              </button>

              {jdMatchResult && (
                <div className="mt-4 rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Match Score</span>
                    <span className={`text-2xl font-bold ${
                      (jdMatchResult.match_score as number || 0) >= 70 ? "text-green-600"
                      : (jdMatchResult.match_score as number || 0) >= 40 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {jdMatchResult.match_score ?? jdMatchResult.score ?? "N/A"}%
                    </span>
                  </div>
                  {Array.isArray(jdMatchResult.matched_keywords) && jdMatchResult.matched_keywords.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Matched Keywords</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {jdMatchResult.matched_keywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {Array.isArray(jdMatchResult.missing_keywords) && jdMatchResult.missing_keywords.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Missing Keywords</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {jdMatchResult.missing_keywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-semibold">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {jdMatchResult.suggestions && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Suggestions</span>
                      <ul className="list-disc list-inside text-xs text-gray-600 mt-1.5 space-y-0.5">
                        {(Array.isArray(jdMatchResult.suggestions) ? jdMatchResult.suggestions : [jdMatchResult.suggestions]).map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Toggle Buttons */}
      <div className="flex items-center justify-center gap-1 p-1 bg-gray-100 rounded-xl w-fit mx-auto">
        <button
          onClick={() => setViewMode('editor')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'editor' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiEdit2 size={14} /> Editor
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'split' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiMinimize2 size={14} /> Split
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'preview' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiMaximize2 size={14} /> Preview
        </button>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MODE: PREVIEW — slim sidebar + full preview */}
      {/* ═══════════════════════════════════════════ */}
      {viewMode === 'preview' && (
        <div className="grid grid-cols-[48px_1fr] gap-4">
          {/* Slim Icon Sidebar */}
          <div className="flex flex-col items-center gap-1 pt-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); setViewMode('split'); }}
                title={section.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeSection === section.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                {section.icon}
              </button>
            ))}
            <button
              onClick={() => { setActiveSection('templates'); setViewMode('split'); }}
              title="Templates"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeSection === 'templates' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <FiLayout size={18} />
            </button>
          </div>

          {/* Full Width Preview */}
          <div>
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h3 className={THEME.components.typography.cardTitle}>Resume Preview</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('split')}
                      className="p-2 rounded-lg text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      title="Back to Editor"
                    >
                      <FiArrowLeft size={18} />
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className={`${THEME.components.button.primary} px-3 py-1.5 text-xs flex items-center gap-2 ${!templateId ? 'opacity-50' : ''}`}
                    >
                      <FiDownload size={16} /> Download PDF
                    </button>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div className={`border border-gray-200 rounded-lg bg-white min-h-[calc(100vh-200px)] shadow-sm flex justify-center overflow-hidden ${templateId ? 'p-0' : 'p-8'}`}>
                  {templateId ? (
                    <div className="relative w-full h-full">
                      <LivePreview templateId={templateId} groupedData={getGroupedData()} scale={0.75} />
                    </div>
                  ) : (
                    <ResumePreview data={resumeData} />
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* MODE: EDITOR — full width form, no preview  */}
      {/* ═══════════════════════════════════════════ */}
      {viewMode === 'editor' && (
        <div className="max-w-3xl mx-auto">
          <Card noPadding>
            {/* Tab Navigation with Scroll Arrows */}
            <div className="relative">
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

            <div className="pt-12">
              {renderFormContent()}
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* MODE: SPLIT — form left, preview right      */}
      {/* ═══════════════════════════════════════════ */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Form */}
          <div className="space-y-6">
            <Card noPadding>
              {/* Tab Navigation with Scroll Arrows */}
              <div className="relative">
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

              {renderFormContent()}
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6 min-w-0">
            <Card className="sticky top-24">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h3 className={THEME.components.typography.cardTitle}>Live Preview</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('preview')}
                      title="Full Preview"
                      className="p-2 rounded-lg text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      <FiMaximize2 size={18} />
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className={`${THEME.components.button.primary} px-3 py-1.5 text-xs flex items-center gap-2 ${!templateId ? 'opacity-50' : ''}`}
                    >
                      <FiDownload size={16} /> Download PDF
                    </button>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div className={`border border-gray-200 rounded-lg bg-white min-h-[600px] shadow-sm flex justify-center overflow-hidden ${templateId ? 'p-0' : 'p-8'}`}>
                  {templateId ? (
                    <div className="relative w-full h-[800px]">
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
      )}

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
  const dataKey = JSON.stringify(groupedData);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const raw = await fetchTemplateHtml(templateId, JSON.parse(dataKey));
        if (!cancelled) {
          setHtml(withResumeApiBase(raw));
          setFailed(false);
        }
      } catch (err) {
        if (!cancelled) {
          setFailed(true);
          setHtml("");
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
  const raw = groupedData?.data || groupedData;
  // Normalise parsed-format fields (personal_information, work_experience, …)
  // to builder-format so the same render code works regardless of input shape.
  const pi = raw.personalInfo || raw.personal_information || {};
  const exp = raw.experience || raw.work_experience || [];
  const edu = raw.education || [];
  const skl = raw.skills || [];
  const cert = raw.certifications || [];
  const proj = raw.projects || [];
  const p = {
    fullName: pi.fullName || pi.full_name || '',
    email: pi.email || '',
    phone: pi.phone || '',
    location: pi.location || '',
    linkedin: pi.linkedin || pi.linkedin_profile || '',
    portfolio: pi.portfolio || pi.portfolio_website || pi.website || '',
  };
  const summary = raw.summary || raw.professional_summary || '';
  const sections: string[] = [];
  sections.push(`<table style="width:100%;border-collapse:collapse"><tr><td style="width:70%"><h1 style="font-size:20px;font-weight:700;margin:0">${p.fullName || ''}</h1><div style="color:#555;font-size:12px;margin:2px 0">${exp?.[0]?.title || exp?.[0]?.job_title || ''}</div><div style="color:#888;font-size:11px;margin:2px 0">${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}</div></td><td style="width:30%;text-align:right;vertical-align:top;font-size:11px;color:#888">${[p.linkedin, p.portfolio].filter(Boolean).join('<br>')}</td></tr></table>`);
  sections.push(`<hr style="border:none;border-top:2px solid #7c3aed;margin:8px 0">`);
  if (summary) sections.push(`<h2 style="font-size:13px;font-weight:600;margin:8px 0 4px;color:#333">Professional Summary</h2><p style="font-size:11px;color:#555;line-height:1.5;margin:0">${summary}</p>`);
  if (exp.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Experience</h2>`);
    exp.forEach((e: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${e.title || e.job_title || ''}${e.company ? ' <span style="font-weight:400;color:#666">at '+e.company+'</span>' : ''}</div><div style="color:#888;font-size:10px">${[e.startDate || e.start_date, e.current ? 'Present' : (e.endDate || e.end_date)].filter(Boolean).join(' – ')}${e.location ? ' · '+e.location : ''}</div><div style="font-size:11px;color:#444;margin:2px 0">${e.description || e.summary || e.responsibilities?.join('\n') || ''}</div></div>`));
  }
  if (edu.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Education</h2>`);
    edu.forEach((e: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${e.degree || ''}${e.institution ? ' — '+e.institution : ''}</div><div style="color:#888;font-size:10px">${[e.graduationDate || e.endDate || e.end_year, e.gpa || e.grade ? 'GPA: '+(e.gpa||e.grade) : ''].filter(Boolean).join(' · ')}</div></div>`));
  }
  if (skl.length) sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Skills</h2><div style="font-size:11px;color:#444">${Array.isArray(skl) ? skl.map((s:any) => s.name || s).join(' · ') : ''}</div>`);
  if (proj.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Projects</h2>`);
    proj.forEach((pr: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${pr.name || pr.title || ''}</div><div style="color:#888;font-size:10px">${[pr.start_date, pr.end_date || 'Present'].filter(Boolean).join(' – ')}</div><div style="font-size:11px;color:#444;margin:2px 0">${pr.description || ''}</div>${(pr.highlights||[]).length ? pr.highlights.map((h: string) => `<div style="font-size:11px;color:#555;margin:1px 0 1px 12px">– ${h}</div>`).join('') : ''}</div>`));
  }
  if (cert.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Certifications</h2>`);
    cert.forEach((c: any) => sections.push(`<div style="font-size:11px;margin:2px 0"><strong>${c.name || ''}</strong>${c.issuer || c.issuing_organization ? ' — '+(c.issuer||c.issuing_organization) : ''}${c.date || c.date_obtained ? ' · '+(c.date||c.date_obtained) : ''}</div>`));
  }
  const volunteer = raw.volunteer || [];
  if (volunteer.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Volunteer</h2>`);
    volunteer.forEach((v: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${v.position || ''}${v.organization ? ' — '+v.organization : ''}</div><div style="color:#888;font-size:10px">${[v.start_date, v.end_date || 'Present'].filter(Boolean).join(' – ')}</div>${v.summary || v.description ? '<div style="font-size:11px;color:#444">'+(v.summary||v.description)+'</div>' : ''}</div>`));
  }
  const languages = raw.languages || (raw.additional_info?.languages) || [];
  if (languages.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Languages</h2><div style="font-size:11px;color:#444">${languages.map((l: any) => (l.language || l)+(l.fluency ? ' — '+l.fluency : '')).join(' · ')}</div>`);
  }
  const awards = raw.awards || [];
  if (awards.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Awards</h2>`);
    awards.forEach((a: any) => sections.push(`<div style="margin:2px 0;font-size:11px"><strong>${a.title || ''}</strong>${a.awarder ? ' — '+a.awarder : ''}${a.date ? ' ('+a.date+')' : ''}${a.summary ? '<div style="color:#555">'+a.summary+'</div>' : ''}</div>`));
  }
  const publications = raw.publications || [];
  if (publications.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Publications</h2>`);
    publications.forEach((p: any) => sections.push(`<div style="margin:2px 0;font-size:11px"><strong>${p.name || ''}</strong>${p.publisher ? ' — '+p.publisher : ''}${p.release_date ? ' ('+p.release_date+')' : ''}${p.summary ? '<div style="color:#555">'+p.summary+'</div>' : ''}</div>`));
  }
  const interests = raw.interests || [];
  if (interests.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Interests</h2><div style="font-size:11px;color:#444">${interests.map((i: any) => i.name || i).join(', ')}</div>`);
  }
  const references = raw.references || [];
  if (references.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">References</h2>`);
    references.forEach((r: any) => sections.push(`<div style="margin:2px 0;font-size:11px"><strong>${r.name || ''}</strong>${r.reference ? '<div style="color:#555">'+r.reference+'</div>' : ''}</div>`));
  }
  const innerHtml = sections.join('');
  return (
    <div className="origin-top flex justify-center" style={{ width: "794px", transform: `scale(${scale})`, flexShrink: 0, transformOrigin: 'top' }}>
      <div style={{ fontFamily: 'Inter, sans-serif', width: '210mm', padding: '40px 48px', color: '#222', lineHeight: '1.5', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,.08)', margin: '0 auto', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: innerHtml }} />
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
  const [rawData, setRawData] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const id = new URLSearchParams(window.location.search).get('upload_id');
      if (!id) return;
      const raw = localStorage.getItem('rawResumeData_' + id);
      if (raw) setRawData(JSON.parse(raw)?.data);
    } catch { /* ignore */ }
  }, []);

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

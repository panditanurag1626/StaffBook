import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_TEMPLATES } from "@/lib/api/templates-fallback";
import { buildPreviewHtml } from "@/lib/api/template-previews";

function buildResumeHtml(data: any, accentColor = '#7c3aed'): string {
  const p = data?.personalInfo || {};
  const sections: string[] = [];
  sections.push(`<table style="width:100%;border-collapse:collapse"><tr><td style="width:70%"><h1 style="font-size:20px;font-weight:700;margin:0">${p.fullName||'Resume'}</h1><div style="color:#555;font-size:12px;margin:2px 0">${(data?.experience||[])[0]?.title||''}</div><div style="color:#888;font-size:11px;margin:2px 0">${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}</div></td><td style="width:30%;text-align:right;vertical-align:top;font-size:11px;color:#888">${[p.linkedin, p.portfolio].filter(Boolean).join('<br>')}</td></tr></table>`);
  sections.push(`<hr style="border:none;border-top:2px solid ${accentColor};margin:8px 0">`);
  if (data?.summary) sections.push(`<h2 style="font-size:13px;font-weight:600;margin:8px 0 4px;color:#333">Professional Summary</h2><p style="font-size:11px;color:#555;line-height:1.5;margin:0">${data.summary}</p>`);
  if (data?.experience?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333">Experience</h2>`);
    data.experience.forEach((e: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${e.title||''}${e.company?' <span style="font-weight:400;color:#666">at '+e.company+'</span>':''}</div><div style="color:#888;font-size:10px">${[e.startDate, e.current?'Present':e.endDate].filter(Boolean).join(' – ')}${e.location?' · '+e.location:''}</div><div style="font-size:11px;color:#444;margin:2px 0">${e.description||''}</div></div>`));
  }
  if (data?.education?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333">Education</h2>`);
    data.education.forEach((e: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${e.degree||''}${e.institution?' — '+e.institution:''}</div><div style="color:#888;font-size:10px">${[e.graduationDate, e.gpa?'GPA: '+e.gpa:''].filter(Boolean).join(' · ')}</div></div>`));
  }
  if (data?.skills?.length) sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333">Skills</h2><div style="font-size:11px;color:#444">${Array.isArray(data.skills)?data.skills.map((s:any)=>s.name||s).join(' · '):''}</div>`);
  if (data?.certifications?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333">Certifications</h2>`);
    data.certifications.forEach((c: any) => sections.push(`<div style="font-size:11px;margin:2px 0"><strong>${c.name||''}</strong>${c.issuer?' — '+c.issuer:''}${c.date?' · '+c.date:''}</div>`));
  }
  return sections.join('');
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/resume-api/api/", "");
  const { searchParams } = request.nextUrl;

  if (path === "templates" || path === "templates/") {
    return NextResponse.json({
      status: 200, statusText: "OK", message: "Templates fetched successfully",
      data: { total: FALLBACK_TEMPLATES.length, page: 1, limit: 12, pages: Math.ceil(FALLBACK_TEMPLATES.length / 12), templates: FALLBACK_TEMPLATES },
    });
  }

  const previewMatch = path.match(/^templates\/(\d+)\/preview$/);
  if (previewMatch) {
    const id = parseInt(previewMatch[1], 10);
    const t = FALLBACK_TEMPLATES.find((x: any) => x.id === id);
    if (!t) return NextResponse.json({ status: 404, message: "Not found" }, { status: 404 });
    return new NextResponse(buildPreviewHtml(t), { headers: { "Content-Type": "text/html" } });
  }

  const singleMatch = path.match(/^templates\/(\d+)$/);
  if (singleMatch) {
    const id = parseInt(singleMatch[1], 10);
    const t = FALLBACK_TEMPLATES.find((x: any) => x.id === id);
    if (!t) return NextResponse.json({ status: 404, message: "Not found" }, { status: 404 });
    return NextResponse.json({ status: 200, data: t });
  }

  if (path === "ping") {
    return NextResponse.json({ status: 200, message: "pong" });
  }

  return NextResponse.json({ status: 404, message: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/resume-api/api/", "");

  if (path === "ats-score") {
    const body = await request.json().catch(() => ({}));
    const data = body?.data || {};
    let score = 0;
    if (data?.personalInfo?.fullName) score += 10;
    if (data?.personalInfo?.email) score += 10;
    if (data?.personalInfo?.phone) score += 10;
    if (data?.summary && data.summary.length > 50) score += 15;
    if (data?.experience?.length) score += 15;
    if (data?.education?.length) score += 10;
    if (data?.skills?.length) score += 15;
    if (data?.certifications?.length) score += 5;
    return NextResponse.json({
      status: 200, message: "ATS score calculated",
      data: {
        overall_score: score,
        breakdown: { contact_info: 30, summary: 15, work_experience: 15, quantification: 0, skills: 15, education: 10, projects: 0, certifications: 5 },
        feedback: score >= 80 ? ["Great resume!"] : ["Add more details to improve your score."],
        stats: {},
      },
    });
  }

  if (path === "upload-resume") {
    const uploadId = "local_" + Date.now();
    return NextResponse.json({
      status: 200, message: "Resume parsed successfully (offline mode)",
      upload_id: uploadId,
      data: {
        basics: { name: "Uploaded Resume", email: "", phone: "", summary: "" },
        work: [],
        education: [],
        skills: [],
        certificates: [],
      },
      ats_scores: { overall_score: 45, breakdown: { contact_info: 10, summary: 0, work_experience: 15, quantification: 0, skills: 10, education: 10, projects: 0, certifications: 0 }, feedback: ["Fill in your details to improve your ATS score."], stats: {} },
    });
  }

  if (path === "jsonresume") {
    return NextResponse.json({ status: 200, data: {} });
  }

  const htmlMatch = path.match(/^templates\/(\d+)\/html$/);
  if (htmlMatch) {
    const id = parseInt(htmlMatch[1], 10);
    const t = FALLBACK_TEMPLATES.find((x: any) => x.id === id);
    const body = await request.json().catch(() => ({}));
    const data = body?.data || {};
    const html = buildResumeHtml(data, t?.color_scheme?.primary);
    return new NextResponse(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${data?.personalInfo?.fullName||'Resume'}</title><style>body{font-family:Inter,sans-serif;max-width:800px;margin:0 auto;padding:24px 32px;color:#222;line-height:1.5;background:#fff;font-size:12px}</style></head><body>${html}</body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  const pdfMatch = path.match(/^templates\/(\d+)\/pdf$/);
  if (pdfMatch) {
    return NextResponse.json({ status: 501, message: "PDF generation not available in offline mode. Use Print to PDF instead." }, { status: 501 });
  }

  const singleMatch = path.match(/^templates\/(\d+)$/);
  if (singleMatch) {
    const id = parseInt(singleMatch[1], 10);
    const t = FALLBACK_TEMPLATES.find((x: any) => x.id === id);
    if (!t) return NextResponse.json({ status: 404, message: "Not found" }, { status: 404 });
    return NextResponse.json({ status: 200, data: t });
  }

  return NextResponse.json({ status: 404, message: "Not found" }, { status: 404 });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" } });
}

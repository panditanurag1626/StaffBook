import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_TEMPLATES } from "@/lib/api/templates-fallback";

const TEMPLATES_PER_PAGE = 12;

function buildPreviewHtml(t: any): string {
  const p = t.color_scheme?.primary || '#7c3aed';
  const s = t.color_scheme?.secondary || '#f5f5f5';
  const a = t.color_scheme?.accent || '#c4b5fd';
  const tx = t.color_scheme?.text || '#1f2937';
  const name = t.name || 'Resume Template';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;background:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh}.page{width:794px;height:1123px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.15);overflow:hidden;display:flex}.sidebar{width:280px;background:${p};padding:32px 24px;color:#fff;display:flex;flex-direction:column}.sidebar .avatar{width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin-bottom:16px}.sidebar h1{font-size:18px;font-weight:700;margin-bottom:4px}.sidebar .title{font-size:12px;opacity:.8;margin-bottom:20px}.sidebar .section{margin-bottom:16px}.sidebar .section h3{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.7;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:4px}.sidebar .section .item{font-size:11px;margin-bottom:4px;opacity:.9}.main{flex:1;padding:32px 28px}.main .section{margin-bottom:20px}.main .section h3{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${p};font-weight:600;margin-bottom:8px;border-bottom:2px solid ${a};padding-bottom:4px}.main .item{margin-bottom:10px}.main .item .title{font-size:13px;font-weight:600;color:${tx}}.main .item .sub{font-size:11px;color:#6b7280;margin:2px 0}.main .item .desc{font-size:11px;color:#4b5563;line-height:1.5}.skill-bar{height:4px;background:#e5e7eb;border-radius:2px;margin-top:2px;overflow:hidden}.skill-bar .fill{height:100%;background:#fff;border-radius:2px}.badge{display:inline-block;font-size:9px;padding:1px 8px;border-radius:4px;margin:2px;background:${a};color:${tx}}</style></head><body><div class="page"><div class="sidebar"><div class="avatar">${name.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}</div><h1>Alex Morgan</h1><div class="title">Senior Product Designer</div><div class="section"><h3>Contact</h3><div class="item">alex@example.com</div><div class="item">+1 (555) 234-5678</div><div class="item">San Francisco, CA</div></div><div class="section"><h3>Skills</h3><div class="item">UX Design<div class="skill-bar"><div class="fill" style="width:95%"></div></div></div><div class="item">Prototyping<div class="skill-bar"><div class="fill" style="width:88%"></div></div></div><div class="item">Design Systems<div class="skill-bar"><div class="fill" style="width:82%"></div></div></div><div class="item">User Research<div class="skill-bar"><div class="fill" style="width:76%"></div></div></div></div><div class="section"><h3>Languages</h3><div class="item">English (Native)</div><div class="item">Spanish (Fluent)</div></div></div><div class="main"><div class="section"><h3>Professional Summary</h3><p style="font-size:11px;color:#4b5563;line-height:1.6">Senior Product Designer with 7+ years of experience delivering human-centered digital solutions. Proven track record of leading cross-functional teams and driving product strategy through data-informed design decisions.</p></div><div class="section"><h3>Experience</h3><div class="item"><div class="title">Senior Product Designer</div><div class="sub">Designify Inc. · 2021 – Present</div><div class="desc">Led redesign of core product, improving user retention by 32%. Established design system used across 4 product teams.</div></div><div class="item"><div class="title">UI/UX Designer</div><div class="sub">PixelLab · 2018 – 2021</div><div class="desc">Designed and shipped 12+ major features. Conducted 50+ user research sessions to inform product decisions.</div></div></div><div class="section"><h3>Education</h3><div class="item"><div class="title">B.S. Human-Computer Interaction</div><div class="sub">Stanford University · 2014 – 2018</div></div></div></div></div></body></html>`;
}

function buildResumeHtml(data: any, accentColor = '#7c3aed'): string {
  const p = data?.personalInfo || {};
  const sections: string[] = [];
  sections.push(`<table style="width:100%;border-collapse:collapse"><tr><td style="width:70%"><h1 style="font-size:20px;font-weight:700;margin:0">${p.fullName||'Resume'}</h1><div style="color:#555;font-size:12px;margin:2px 0">${(data?.experience||[])[0]?.title||''}</div><div style="color:#888;font-size:11px;margin:2px 0">${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}</div></td><td style="width:30%;text-align:right;vertical-align:top;font-size:11px;color:#888">${[p.linkedin, p.portfolio].filter(Boolean).join('<br>')}</td></tr></table>`);
  sections.push(`<hr style="border:none;border-top:2px solid ${accentColor};margin:8px 0">`);
  if (data?.summary) sections.push(`<h2 style="font-size:13px;font-weight:600;margin:8px 0 4px;color:#333">Professional Summary</h2><p style="font-size:11px;color:#555;line-height:1.5;margin:0">${data.summary}</p>`);
  if (data?.experience?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Experience</h2>`);
    data.experience.forEach((e: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${e.title||''}${e.company?' <span style="font-weight:400;color:#666">at '+e.company+'</span>':''}</div><div style="color:#888;font-size:10px">${[e.startDate, e.current?'Present':e.endDate].filter(Boolean).join(' – ')}${e.location?' · '+e.location:''}</div><div style="font-size:11px;color:#444;margin:2px 0">${e.description||''}</div></div>`));
  }
  if (data?.education?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Education</h2>`);
    data.education.forEach((e: any) => sections.push(`<div style="margin:4px 0"><div style="font-weight:600;font-size:12px">${e.degree||''}${e.institution?' — '+e.institution:''}</div><div style="color:#888;font-size:10px">${[e.graduationDate, e.gpa?'GPA: '+e.gpa:''].filter(Boolean).join(' · ')}</div></div>`));
  }
  if (data?.skills?.length) sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Skills</h2><div style="font-size:11px;color:#444">${Array.isArray(data.skills)?data.skills.map((s:any)=>s.name||s).join(' · '):''}</div>`);
  if (data?.certifications?.length) {
    sections.push(`<h2 style="font-size:13px;font-weight:600;margin:10px 0 4px;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px">Certifications</h2>`);
    data.certifications.forEach((c: any) => sections.push(`<div style="font-size:11px;margin:2px 0"><strong>${c.name||''}</strong>${c.issuer?' — '+c.issuer:''}${c.date?' · '+c.date:''}</div>`));
  }
  return sections.join('');
}

function parsePath(req: NextRequest): string {
  return req.nextUrl.pathname.replace("/api/resume-fallback/api/", "");
}

export async function GET(request: NextRequest) {
  const path = parsePath(request);
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

  if (path === "ping") {
    return NextResponse.json({ status: 200, message: "pong" });
  }

  // /api/templates/:id (GET)
  const singleMatch = path.match(/^templates\/(\d+)$/);
  if (singleMatch) {
    const id = parseInt(singleMatch[1], 10);
    const t = FALLBACK_TEMPLATES.find((x: any) => x.id === id);
    if (!t) return NextResponse.json({ status: 404, message: "Not found" }, { status: 404 });
    return NextResponse.json({ status: 200, data: t });
  }

  return NextResponse.json({ status: 404, message: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest) {
  const path = parsePath(request);

  // /api/ats-score
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

  // /api/upload-resume
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

  // /api/jsonresume
  if (path === "jsonresume") {
    return NextResponse.json({ status: 200, data: {} });
  }

  // /api/templates/:id/html (POST)
  const htmlMatch = path.match(/^templates\/(\d+)\/html$/);
  if (htmlMatch) {
    const id = parseInt(htmlMatch[1], 10);
    const t = FALLBACK_TEMPLATES.find((x: any) => x.id === id);
    const body = await request.json().catch(() => ({}));
    const data = body?.data || {};
    const html = buildResumeHtml(data, t?.color_scheme?.primary);
    return new NextResponse(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${data?.personalInfo?.fullName||'Resume'}</title><style>body{font-family:Inter,sans-serif;max-width:800px;margin:0 auto;padding:24px 32px;color:#222;line-height:1.5;background:#fff;font-size:12px}</style></head><body>${html}</body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  // /api/templates/:id/pdf (POST)
  const pdfMatch = path.match(/^templates\/(\d+)\/pdf$/);
  if (pdfMatch) {
    return NextResponse.json({ status: 501, message: "PDF generation not available in offline mode. Use Print to PDF instead." }, { status: 501 });
  }

  // /api/templates/:id (GET or fallback POST — return single template)
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

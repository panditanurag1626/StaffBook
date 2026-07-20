import axios, { AxiosInstance, AxiosProgressEvent } from 'axios';
import toast from 'react-hot-toast';

// ============================================================
// Environment — single source of truth from env var
// ============================================================
/**
 * Base URL for the Resume API.
 *
 * Defaults to `/resume-api` (same-origin proxy) to avoid CORS in development.
 * In production, set NEXT_PUBLIC_RESUME_API_BASE_URL to your external API URL.
 *
 * Examples:
 *   NEXT_PUBLIC_RESUME_API_BASE_URL=/resume-api          (proxy — no CORS)
 *   NEXT_PUBLIC_RESUME_API_BASE_URL=https://api.example.com  (direct — needs CORS)
 */
const RESUME_API_BASE_URL = (
  process.env.NEXT_PUBLIC_RESUME_API_BASE_URL || '/resume-api'
).replace(/\/$/, '');

// ============================================================
// Types
// ============================================================

export interface AtsBreakdown {
  contact_info: number;
  summary: number;
  work_experience: number;
  quantification: number;
  skills: number;
  education: number;
  projects: number;
  certifications: number;
}

export interface AtsScore {
  overall_score: number;
  breakdown: AtsBreakdown;
  feedback: string[];
  stats: Record<string, number>;
}

export interface ResumeTemplate {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  is_premium: boolean;
  thumbnail: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  font_family: string;
  layout: string;
  template_file: string;
  sections: string[];
  tags: string[];
  supports_image?: boolean;
}

export interface TemplatesResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  templates: ResumeTemplate[];
}

export interface UploadResumeResponse {
  status: number;
  message: string;
  upload_id: string;
  data: Record<string, unknown>;
  ats_scores?: AtsScore;
}

export type GroupedResumeData = Record<string, unknown>;

// ============================================================
// Error helpers
// ============================================================

function extractError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'Unknown API error';
    return msg;
  }
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

function toastError(context: string, error: unknown): void {
  const msg = extractError(error);
  toast.error(`${context}: ${msg}`);
}

// ============================================================
// Axios instance
// ============================================================

export const resumeApiClient: AxiosInstance = axios.create({
  baseURL: RESUME_API_BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 60000,
  withCredentials: false,
});

// ============================================================
// API methods
// ============================================================

/** POST /api/upload-resume — upload a PDF/DOCX and get parsed JSON Resume data */
export async function uploadResume(
  file: File,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await resumeApiClient.post<UploadResumeResponse>(
    '/api/upload-resume',
    formData,
    {
      timeout: 120_000,
      signal,
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    },
  );
  return data;
}

/** GET /api/resume/{uploadId} — fetch parsed raw resume data */
export async function getResume(uploadId: string): Promise<Record<string, unknown>> {
  const { data } = await resumeApiClient.get(`/api/resume/${uploadId}`);
  return data?.data ?? data;
}

/** GET /api/jsonresume/{uploadId} — fetch parsed resume in JSON Resume format */
export async function getJsonResume(uploadId: string): Promise<Record<string, unknown>> {
  const { data } = await resumeApiClient.get(`/api/jsonresume/${uploadId}`);
  return data?.data ?? data;
}

/** GET /api/templates — list all templates (paginated) */
export async function getTemplates(
  page = 1,
  limit = 12,
): Promise<TemplatesResponse> {
  const { data } = await resumeApiClient.get('/api/templates', {
    params: { page, limit },
  });
  const payload = data?.data ?? data;
  if (Array.isArray(payload.templates)) return payload;
  if (Array.isArray(payload)) return { total: payload.length, page: 1, limit, pages: 1, templates: payload };
  throw new Error('Invalid templates response');
}

/** GET /api/templates/{id} — get a single template by id */
export async function getTemplate(id: number | string): Promise<ResumeTemplate> {
  const { data } = await resumeApiClient.get(`/api/templates/${id}`);
  return data?.data ?? data;
}

/** GET /api/templates/categories — list available template categories */
export async function getTemplateCategories(): Promise<string[]> {
  const { data } = await resumeApiClient.get('/api/templates/categories');
  const cat = data?.data ?? data;
  return Array.isArray(cat) ? cat : [];
}

/** POST /api/templates/{id}/render — render template, returns HTML string */
export async function renderTemplateHtml(
  templateId: number | string,
  body: Record<string, unknown>,
): Promise<string> {
  const { data } = await resumeApiClient.post(
    `/api/templates/${templateId}/render`,
    body,
  );
  const html = data?.data?.html ?? data?.html ?? (typeof data === 'string' ? data : null);
  if (!html) throw new Error('No HTML in render response');
  return String(html);
}

/** POST /api/templates/{id}/render — render template, returns structured data */
export async function renderTemplate(
  templateId: number | string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data } = await resumeApiClient.post(
    `/api/templates/${templateId}/render`,
    body,
  );
  return data?.data ?? data;
}

/** POST /api/ats-analyze — analyze resume for ATS score */
export async function analyzeAts(
  body: Record<string, unknown>,
): Promise<AtsScore | null> {
  const { data } = await resumeApiClient.post('/api/ats-analyze', body);
  return (data?.data as AtsScore) ?? null;
}

/** Download a template via the preview endpoint (renders HTML, opens print dialog). */
export async function downloadPdf(
  templateId: number | string,
  body: Record<string, unknown>,
  _filename = 'Resume.pdf',
): Promise<void> {
  const uploadId = body?.upload_id;
  if (uploadId) {
    const url = templatePreviewUrl(templateId, String(uploadId));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
    const html = await res.text();
    openHtmlPrintWindow(html);
    return;
  }
  throw new Error('PDF generation requires upload_id');
}

// ============================================================
// Legacy-compatible aliases (used by existing components)
// ============================================================

/** POST /api/ats-analyze — ATS analysis */
export async function fetchAtsScore(
  body: Record<string, unknown>,
): Promise<AtsScore | null> {
  try {
    const { data } = await resumeApiClient.post('/api/ats-analyze', body);
    return (data?.data as AtsScore) ?? null;
  } catch {
    return null;
  }
}

/** Render template with `{ data: groupedData }` payload */
export function fetchTemplateHtml(
  templateId: number | string,
  groupedData: GroupedResumeData,
): Promise<string> {
  return renderTemplateHtml(templateId, { data: groupedData });
}

/** Shorthand for renderTemplateHtml with arbitrary body */
export function fetchTemplateHtmlRaw(
  templateId: number | string,
  body: Record<string, unknown>,
): Promise<string> {
  return renderTemplateHtml(templateId, body);
}

/** GET preview URL for embedding in an iframe */
export function templatePreviewUrl(
  templateId: number | string,
  uploadId?: string | number | null,
): string {
  const base = `${RESUME_API_BASE_URL}/api/templates/${templateId}/preview`;
  return uploadId ? `${base}?upload_id=${uploadId}` : base;
}

// ============================================================
// HTML helpers
// ============================================================

/** Wrap HTML with a <base> tag so assets resolve against the API origin */
export function withResumeApiBase(html: string): string {
  if (!RESUME_API_BASE_URL) return html;
  const baseTag = `<base href="${RESUME_API_BASE_URL}/">`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
  }
  return `${baseTag}${html}`;
}

/** Open rendered HTML in a hidden iframe for printing */
export function openHtmlPrintWindow(html: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: '0',
    });
    document.body.appendChild(iframe);

    const cw = iframe.contentWindow;
    if (!cw) {
      iframe.remove();
      return false;
    }

    let removed = false;
    const cleanup = () => {
      if (removed) return;
      removed = true;
      try { iframe.remove(); } catch { /* ignore */ }
    };
    cw.onafterprint = cleanup;

    const doPrint = () => {
      try {
        cw.focus();
        cw.print();
      } catch {
        cleanup();
      }
    };

    cw.document.open();
    cw.document.write(withResumeApiBase(html));
    cw.document.close();

    if (cw.document.readyState === 'complete') {
      setTimeout(doPrint, 500);
    } else {
      cw.onload = () => setTimeout(doPrint, 500);
    }
    setTimeout(cleanup, 60000);
    return true;
  } catch {
    return false;
  }
}

/** Open rendered HTML full-size in a new tab */
export function openHtmlWindow(html: string): boolean {
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(withResumeApiBase(html));
  win.document.close();
  return true;
}

/**
 * Open preview URL in a new tab as final fallback.
 */
async function openPreviewFallback(templateId: number | string, body: Record<string, unknown>): Promise<boolean> {
  try {
    const uploadId = body?.upload_id;
    if (uploadId && typeof window !== 'undefined') {
      window.open(templatePreviewUrl(templateId, String(uploadId)), '_blank');
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

/** Try to download — uses GET /preview (reliable) when upload_id is available. */
export async function downloadTemplatePdf(
  templateId: number | string,
  body: Record<string, unknown>,
  filename = 'Resume.pdf',
): Promise<void> {
  try {
    await downloadPdf(templateId, body, filename);
  } catch {
    const ok = await openPreviewFallback(templateId, body);
    if (!ok) throw new Error('PDF generation unavailable');
  }
}

/** Alias kept for compatibility — delegates to downloadTemplatePdf */
export async function printTemplate(
  templateId: number | string,
  body: Record<string, unknown>,
): Promise<boolean> {
  try {
    await downloadPdf(templateId, body);
    return true;
  } catch {
    return openPreviewFallback(templateId, body);
  }
}

/** Get the configured base URL */
export function getBaseUrl(): string {
  return RESUME_API_BASE_URL;
}

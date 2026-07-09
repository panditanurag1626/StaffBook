import axios from 'axios';

/**
 * Base URL for the standalone Flask "resume-api" service (template rendering,
 * resume parsing/upload, live HTML preview).
 *
 * This is a SEPARATE backend from the main StaffBook API (see ./config.ts).
 * Configure it with NEXT_PUBLIC_RESUME_API_URL; defaults to local dev server.
 */
const isServer = typeof window === 'undefined';

export const RESUME_API_URL = (
  isServer 
    ? (process.env.NEXT_PUBLIC_RESUME_API_URL || 'https://resume.codekrafters.co.in')
    : '/resume-api'
).replace(/\/$/, '');

// Dedicated axios instance for the resume-api (different origin from apiClient).
export const resumeApiClient = axios.create({
  baseURL: RESUME_API_URL,
  headers: {
    Accept: 'application/json',
    // Lets the requests pass through ngrok/localtunnel without the warning page.
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000,
  withCredentials: false,
});

/** A resume payload in the grouped form-structure the templates understand. */
export type GroupedResumeData = Record<string, unknown>;

/** Shape returned by /api/upload-resume (ats_scores) and /api/ats-score. */
export interface AtsScore {
  overall_score: number;
  breakdown: {
    contact_info: number;
    summary: number;
    work_experience: number;
    quantification: number;
    skills: number;
    education: number;
    projects: number;
    certifications: number;
  };
  feedback: string[];
  stats: Record<string, number>;
}

/**
 * Instant, rule-based ATS score for the given resume data — same algorithm as
 * the upload response. `body` may be `{ data: grouped }` or `{ upload_id }`.
 */
export async function fetchAtsScore(
  body: Record<string, unknown>
): Promise<AtsScore | null> {
  const { data } = await resumeApiClient.post('/api/ats-score', body);
  return (data?.data as AtsScore) ?? null;
}

/**
 * Render the given template with the supplied body and return the raw HTML.
 * `body` may be `{ data: grouped }` (current form state) or `{ upload_id }`.
 */
export async function fetchTemplateHtmlRaw(
  templateId: number | string,
  body: Record<string, unknown>
): Promise<string> {
  const { data } = await resumeApiClient.post(
    `/api/templates/${templateId}/html`,
    body,
    { responseType: 'text' }
  );
  return typeof data === 'string' ? data : String(data ?? '');
}

/**
 * Render the given template with the supplied resume data and return the raw
 * HTML string. Works for both uploaded and manually-built resumes — it sends
 * the *current* form state, so it always reflects live edits.
 */
export function fetchTemplateHtml(
  templateId: number | string,
  groupedData: GroupedResumeData
): Promise<string> {
  return fetchTemplateHtmlRaw(templateId, { data: groupedData });
}

/**
 * Render resume HTML into a hidden iframe and open the browser print dialog,
 * where the user chooses "Save as PDF". Prints the EXACT same design as the
 * live preview. Uses a hidden iframe (not window.open) so it is NOT blocked by
 * popup blockers and works even when called after an await. No server-side PDF
 * engine required.
 */
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

    // Give external CSS / fonts a moment to load before printing.
    if (cw.document.readyState === 'complete') {
      setTimeout(doPrint, 500);
    } else {
      cw.onload = () => setTimeout(doPrint, 500);
    }
    // Safety net: never leave a stray iframe behind.
    setTimeout(cleanup, 60000);
    return true;
  } catch {
    return false;
  }
}

/** Open rendered resume HTML full-size in a new tab (no auto-print). */
export function openHtmlWindow(html: string): boolean {
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(withResumeApiBase(html));
  win.document.close();
  return true;
}

/**
 * Download the selected template, rendered with the given data, as a real PDF
 * file from the server's /pdf endpoint. `body` may be `{ data: grouped }`
 * (current form state) or `{ upload_id }`. Throws if the server has no PDF
 * engine (HTTP 501) or on any error — callers should fall back to printTemplate.
 */
export async function downloadTemplatePdf(
  templateId: number | string,
  body: Record<string, unknown>,
  filename = 'Resume.pdf'
): Promise<void> {
  const response = await resumeApiClient.post(
    `/api/templates/${templateId}/pdf`,
    body,
    { responseType: 'blob' }
  );
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Fetch the rendered template HTML for the given body and open it in a print
 * window. Returns false if the popup was blocked.
 */
export async function printTemplate(
  templateId: number | string,
  body: Record<string, unknown>
): Promise<boolean> {
  const html = await fetchTemplateHtmlRaw(templateId, body);
  return openHtmlPrintWindow(html);
}

/**
 * Wrap rendered template HTML so that relative/absolute asset URLs (CSS, images
 * served from /static) resolve against the Flask origin instead of the Next.js
 * app. Needed when injecting the HTML via iframe `srcDoc` or `document.write`.
 */
export function withResumeApiBase(html: string): string {
  const baseTag = `<base href="${RESUME_API_URL}/">`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
  }
  return `${baseTag}${html}`;
}

/** Absolute preview URL (GET, sample or uploaded data) for embedding in an iframe. */
export function templatePreviewUrl(
  templateId: number | string,
  uploadId?: string | number | null
): string {
  const base = `${RESUME_API_URL}/api/templates/${templateId}/preview`;
  return uploadId ? `${base}?upload_id=${uploadId}` : base;
}

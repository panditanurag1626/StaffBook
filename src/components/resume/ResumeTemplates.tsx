import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { resumeApiClient, templatePreviewUrl, printTemplate, downloadTemplatePdf } from '@/services/resumeApi';
import { FALLBACK_TEMPLATES } from '@/lib/api/templates-fallback';
import { THEME } from '../../styles/theme';
import Card from '../shared/Card';
import PremiumUpgradeModal from '../shared/PremiumUpgradeModal';
import { FiStar, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  is_premium: boolean;
  preview_url: string;
  render_url: string;
  thumbnail: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  slug: string;
  tags: string[];
}

const ResumeTemplates: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const uploadId = searchParams.get('upload_id') || searchParams.get('resume_id'); // Fallback if needed
  const templateIdParam = searchParams.get('template_id');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { user } = useAuth();
  const TEMPLATES_PER_PAGE = 12;

  const hasPremiumAccess = user?.user_balance_job_seeker?.premium_designs_available === 1 || (user?.userBalance?.no_of_resume ?? 0) > 0;

  // Resolve a deep-linked template_id, even if it's not on the current page.
  useEffect(() => {
    if (!templateIdParam) return;
    if (selectedTemplate?.id.toString() === templateIdParam) return;

    const found = templates.find((t) => t.id.toString() === templateIdParam);
    if (found) {
      setSelectedTemplate(found);
      return;
    }
    resumeApiClient
      .get(`/api/templates/${templateIdParam}`)
      .then((res) => {
        if (res.data?.data) setSelectedTemplate(res.data.data);
      })
      .catch(() => { /* fall back to grid */ });
  }, [templates, templateIdParam]);

  const handleTemplateSelect = (template: Template) => {
    if (template.is_premium && !hasPremiumAccess) {
      setShowPremiumModal(true);
      return;
    }
    if (!uploadId) {
      router.push(`/profile/jobs?tab=resume&resumeTab=builder&template_id=${template.id}`);
    } else {
      setSelectedTemplate(template);
      const params = new URLSearchParams(searchParams.toString());
      params.set('template_id', template.id.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handlePreview = () => {
    if (selectedTemplate && uploadId) {
      window.open(templatePreviewUrl(selectedTemplate.id, uploadId), "_blank");
    }
  };

  const handleDownload = async () => {
    if (!selectedTemplate || !uploadId) return;
    const filename = `${selectedTemplate.name.replace(/\s+/g, '_')}_Resume.pdf`;
    try {
      // Real PDF from the server.
      await downloadTemplatePdf(selectedTemplate.id, { upload_id: uploadId }, filename);
    } catch (err) {
      // No server PDF engine (501) or error — fall back to browser print-to-PDF.
      console.error('Download error:', err);
      try {
        await printTemplate(selectedTemplate.id, { upload_id: uploadId });
      } catch {
        window.open(templatePreviewUrl(selectedTemplate.id, uploadId), '_blank');
      }
    }
  };

  const handleChangeTemplate = () => {
    setSelectedTemplate(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('template_id');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchTemplates = useCallback(async (retries = 2) => {
    try {
      setLoading(true);
      setError(null);
      const response = await resumeApiClient.get('/api/templates', {
        params: { page: currentPage, limit: TEMPLATES_PER_PAGE },
      });
      const payload = response.data?.data;
      if (payload && Array.isArray(payload.templates)) {
        setTemplates(payload.templates);
        setTotalCount(payload.total ?? payload.templates.length);
        setTotalPages(payload.pages ?? 1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      if (retries > 0 && err?.response?.status === 429) {
        const delay = (3 - retries) * 2000;
        await new Promise(r => setTimeout(r, delay));
        return fetchTemplates(retries - 1);
      }
      console.error('Error fetching templates:', err);
      // Fallback: load hardcoded templates so the page is never empty
      setTemplates(FALLBACK_TEMPLATES as any);
      setTotalCount(FALLBACK_TEMPLATES.length);
      setTotalPages(Math.max(1, Math.ceil(FALLBACK_TEMPLATES.length / TEMPLATES_PER_PAGE)));
      setError('offline');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <FiLoader className="text-purple-600 animate-spin" size={40} />
        <p className="text-gray-500 font-medium">Loading templates...</p>
      </div>
    );
  }

  if (selectedTemplate) {
    return (
      <div className={`space-y-6 ${THEME.layout.spacing.xl}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={THEME.components.typography.sectionTitle}>
              Selected Template
            </h2>
            <p className={THEME.components.typography.body}>
              {selectedTemplate.name}
            </p>
          </div>
          <button
            onClick={handleChangeTemplate}
            className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Change Template
          </button>
        </div>

        <div className="flex flex-col items-center max-w-4xl mx-auto">
          <Card className="w-full flex flex-col h-full" noPadding>
            <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden bg-gray-50 flex justify-center">
              <div
                className="origin-top"
                style={{
                  width: '1000px',
                  height: '1414px',
                  transform: 'scale(0.42)',
                  flexShrink: 0
                }}
              >
                {error ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{backgroundColor:selectedTemplate.color_scheme?.secondary||'#f3f4f6'}}>
                    <div className="text-5xl font-bold mb-2" style={{color:selectedTemplate.color_scheme?.primary||'#6366f1'}}>{selectedTemplate.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
                    <div className="text-base font-semibold" style={{color:selectedTemplate.color_scheme?.text||'#374151'}}>{selectedTemplate.name}</div>
                    <div className="mt-2 text-sm text-gray-400">Template preview unavailable</div>
                  </div>
                ) : (
                  <iframe
                    src={templatePreviewUrl(selectedTemplate.id)}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    title={`${selectedTemplate.name} Preview`}
                    className="pointer-events-none"
                    scrolling="no"
                  />
                )}
              </div>

              <PremiumUpgradeModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                title="Unlock Premium Templates"
                description="Premium templates are available exclusively for Premium members. Upgrade to access professional designs that make your resume stand out."
              />
            </div>

            {uploadId && (
              <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-4 bg-white">
                <button
                  onClick={handlePreview}
                  className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors"
                >
                  Preview with Data
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
                >
                  Download PDF
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${THEME.layout.spacing.xl}`}>
      <div className="flex items-center justify-end">
        <div className="text-sm text-gray-500">
          Total: {totalCount}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {templates.map((template) => (
          <Card
            key={template.id}
            hoverEffect
            className="group cursor-pointer overflow-hidden flex flex-col h-full"
            noPadding
            onClick={() => handleTemplateSelect(template)}
          >
            {/* Preview Section - Compact (lazy loaded) */}
            <div className="relative h-[260px] w-full overflow-hidden bg-gray-50 border-b border-gray-100 flex justify-center">
              <div
                className="origin-top"
                style={{
                  width: '1000px',
                  height: '1414px',
                  transform: 'scale(0.22)',
                  flexShrink: 0
                }}
              >
                <LazyIframe
                  src={templatePreviewUrl(template.id)}
                  title={`${template.name} Preview`}
                  colorScheme={template.color_scheme}
                />
              </div>

              {template.is_premium && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-yellow-600 shadow-lg flex items-center gap-1 z-10">
                  <FiStar size={10} fill="currentColor" /> Premium
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
            </div>

            <div className="p-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                {template.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTemplateSelect(template);
                }}
                className="flex-shrink-0 text-[10px] font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Use
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${currentPage === page
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

function LazyIframe({ src, title, colorScheme, previewFailed: _pf }: { src: string; title: string; colorScheme?: { primary: string; secondary: string; accent: string; }; previewFailed?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showPlaceholder = (loaded && iframeError) || _pf;

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {showPlaceholder ? (
        <div
          className="flex flex-col items-center justify-center h-full p-4 text-center"
          style={{ backgroundColor: colorScheme?.secondary || '#f3f4f6' }}
        >
          <div className="text-3xl font-bold mb-1" style={{ color: colorScheme?.primary || '#6366f1' }}>
            {title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="text-xs font-semibold" style={{ color: colorScheme?.text || '#374151' }}>
            {title}
          </div>
          <div className="mt-2 text-[10px] text-gray-400">Preview unavailable</div>
        </div>
      ) : loaded ? (
        <iframe
          src={src}
          onError={() => setIframeError(true)}
          style={{ width: '100%', height: '100%', border: 0 }}
          title={title}
          className="pointer-events-none"
          scrolling="no"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <FiLoader className="animate-spin text-purple-400" size={20} />
        </div>
      )}
    </div>
  );
}

export default ResumeTemplates;

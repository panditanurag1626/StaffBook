"use client";

import React, { useState, useEffect } from "react";
import { findCMSBySlug, CMSContent } from "@/lib/api/services/cmsService";
import { Loader2, AlertCircle } from "lucide-react";
import { THEME } from "@/styles/theme";

interface LegalPageProps {
  slug: string;
  fallbackTitle: string;
}

const LegalPage: React.FC<LegalPageProps> = ({ slug, fallbackTitle }) => {
  const [content, setContent] = useState<CMSContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await findCMSBySlug(slug);
        if (response?.data?.success && response?.data?.data) {
          setContent(response.data.data);
        } else {
          setError(response?.data?.message || "Failed to load content.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading {fallbackTitle}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-bold shadow-lg hover:bg-purple-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {content?.title || fallbackTitle}
          </h1>
          <div className="h-1.5 w-24 bg-purple-600 mx-auto rounded-full" />
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12 animate-slideUp">
          <div
            className="cms-content text-gray-700 leading-relaxed 
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-gray-900
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-gray-900
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-gray-900
              [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
              [&_li]:mb-1
              [&_strong]:font-bold [&_strong]:text-gray-900"
            dangerouslySetInnerHTML={{ __html: content?.content || "" }}
          />
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Staffbook. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;

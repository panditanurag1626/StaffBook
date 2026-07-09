'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProfileLayout from '../../../../components/shared/ProfileLayout';
import Card from '../../../../components/shared/Card';
import { THEME } from '@/styles/theme';
import {
  FiUpload,
  FiEdit3,
  FiArrowLeft,
  FiCheck,
} from 'react-icons/fi';

export default function CreateNewResume() {
  const [selectedOption, setSelectedOption] = useState<'upload' | 'custom' | null>(null);

  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <div className={`min-h-screen ${THEME.colors.background.page} p-2 md:p-4 -mt-[10px]`}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
            <Link
              href="/profile/resume"
              className={`flex items-center ${THEME.components.typography.body} hover:text-purple-600 transition-colors`}
            >
              <FiArrowLeft className="mr-2" size={16} />
              Back to Resume
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className={`${THEME.components.typography.body} font-medium text-gray-900`}>Create New Resume</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="text-center">
              <h1 className={`${THEME.components.typography.sectionTitle} text-2xl md:text-3xl mb-3`}>
                Create New Resume
              </h1>
              <p className={`${THEME.components.typography.subheading} max-w-2xl mx-auto`}>
                Choose how you'd like to create your resume. Upload an existing one to get started quickly, 
                or build a custom resume from scratch.
              </p>
            </div>
          </div>

          {/* Main Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            {/* Upload Resume Option */}
            <Link href="/profile/resume/create/upload" onClick={() => setSelectedOption('upload')}>
              <Card 
                hoverEffect={true}
                className={`h-full border-2 transition-all duration-300 ${
                  selectedOption === 'upload'
                    ? 'border-purple-600 shadow-lg transform scale-102'
                    : 'border-transparent hover:border-purple-600'
                }`}
              >
                <div className="text-center p-2">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-all duration-300 ${
                    selectedOption === 'upload'
                      ? 'bg-gradient-to-br from-purple-600 to-purple-400'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-600 group-hover:to-purple-400'
                  }`}>
                    <FiUpload size={24} className={`transition-colors duration-300 ${
                      selectedOption === 'upload'
                        ? 'text-white'
                        : 'text-gray-600 group-hover:text-white'
                    }`} />
                  </div>
                  
                  <h3 className={`${THEME.components.typography.cardTitle} mb-3`}>
                    Upload Resume
                  </h3>
                  
                  <p className={`${THEME.components.typography.body} mb-4 leading-relaxed`}>
                    Have an existing resume? Upload it and we'll automatically extract 
                    all the information to create an editable version.
                  </p>
                  
                  <div className={`space-y-2 text-xs ${THEME.components.typography.caption}`}>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <FiCheck size={14} className="text-green-500 flex-shrink-0" />
                      <span>Supports PDF, DOC, DOCX formats</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <FiCheck size={14} className="text-green-500 flex-shrink-0" />
                      <span>AI-powered data extraction</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <FiCheck size={14} className="text-green-500 flex-shrink-0" />
                      <span>Editable after processing</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Custom Resume Option */}
            <Link href="/profile/jobs?tab=resume&resumeTab=builder" onClick={() => setSelectedOption('custom')}>
              <Card 
                hoverEffect={true}
                className={`h-full border-2 transition-all duration-300 ${
                  selectedOption === 'custom'
                    ? 'border-purple-600 shadow-lg transform scale-102'
                    : 'border-transparent hover:border-purple-600'
                }`}
              >
                <div className="text-center p-2">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-all duration-300 ${
                    selectedOption === 'custom'
                      ? 'bg-gradient-to-br from-purple-600 to-purple-400'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-600 group-hover:to-purple-400'
                  }`}>
                    <FiEdit3 size={24} className={`transition-colors duration-300 ${
                      selectedOption === 'custom'
                        ? 'text-white'
                        : 'text-gray-600 group-hover:text-white'
                    }`} />
                  </div>
                  
                  <h3 className={`${THEME.components.typography.cardTitle} mb-3`}>
                    Build Custom Resume
                  </h3>
                  
                  <p className={`${THEME.components.typography.body} mb-4 leading-relaxed`}>
                    Start from scratch with our comprehensive resume builder. 
                    Create a professional resume with guided sections and tips.
                  </p>
                  
                  <div className={`space-y-2 text-xs ${THEME.components.typography.caption}`}>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <FiCheck size={14} className="text-green-500 flex-shrink-0" />
                      <span>Step-by-step guidance</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <FiCheck size={14} className="text-green-500 flex-shrink-0" />
                      <span>Professional templates</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <FiCheck size={14} className="text-green-500 flex-shrink-0" />
                      <span>Real-time preview</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiChevronDown, FiChevronUp, FiBriefcase, FiLoader } from 'react-icons/fi';

export interface AccordionJobPost {
  id: string | number;
  title: string;
  company: string;
  location: string;
  status: 'active' | 'paused' | 'closed';
  views: number;
  applicants: number;
}

interface JobPostAccordionProps {
  jobs: AccordionJobPost[];
  selectedJobId: string | number | null;
  onSelectJob: (jobId: string | number | null) => void;
  isLoading?: boolean;
}

export default function JobPostAccordion({ jobs, selectedJobId, onSelectJob, isLoading }: JobPostAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeJob = jobs.find(job => String(job.id) === String(selectedJobId));

  return (
    <div className="w-full mb-8 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Section Heading */}
      <div className="px-5 py-4 border-b border-purple-50 bg-purple-50/30">
        <h2 className="text-[15px] font-black text-purple-900 tracking-tight flex items-center gap-2">
          <FiBriefcase className="text-purple-600" size={18} />
          Posted Jobs &amp; Responses
        </h2>
      </div>

      {/* Accordion Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-purple-50/20 transition-all group"
      >
        <div className="min-w-0">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <FiLoader className="text-purple-400 animate-spin" size={14} />
              <span className="text-sm font-semibold text-gray-400">Loading your job posts...</span>
            </div>
          ) : activeJob ? (
            <>
              <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                Results shown for: <span className="text-purple-700">{activeJob.title}</span>
                {activeJob.location && <span className="text-gray-500">, {activeJob.location}</span>}
                <span className="text-gray-400 ml-1">({activeJob.applicants} applicants)</span>
              </h3>
              <p className="text-[11px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                Click to switch between your {jobs.length} job post{jobs.length !== 1 ? 's' : ''}
              </p>
            </>
          ) : jobs.length > 0 ? (
            <>
              <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                Results shown for: <span className="text-purple-700">All Jobs</span>
              </h3>
              <p className="text-[11px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                Select one of your {jobs.length} job post{jobs.length !== 1 ? 's' : ''} to filter results
              </p>
            </>
          ) : (
            <h3 className="text-sm font-bold text-gray-500">No job posts found. Create one to find candidates.</h3>
          )}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm ${isOpen ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
          {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 animate-fadeIn grid grid-cols-1 md:grid-cols-3 gap-3">
          {isLoading ? (
            <div className="col-span-3 flex items-center justify-center py-8 gap-3">
              <FiLoader className="text-purple-400 animate-spin" size={20} />
              <span className="text-gray-400 font-medium">Loading job posts...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-400 font-medium">No job posts yet.</p>
              <Link href="/profile/create-job" className="text-purple-600 font-bold text-sm hover:underline mt-1 inline-block">
                Create your first job post →
              </Link>
            </div>
          ) : (
            jobs.map((job) => {
              const isSelected = String(selectedJobId) === String(job.id);
              const statusColor = job.status === 'active' ? 'bg-green-500' : job.status === 'paused' ? 'bg-yellow-400' : 'bg-gray-400';
              const statusLabel = job.status === 'active' ? 'Active' : job.status === 'paused' ? 'Paused' : 'Closed';

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(isSelected ? null : job.id)}
                  className={`bg-white border rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group h-full
                    ${isSelected ? 'border-purple-500 ring-1 ring-purple-500 bg-purple-50/10' : 'border-gray-50 hover:border-purple-200 hover:shadow-md'}
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500 to-transparent opacity-10 pointer-events-none" />
                  )}

                  <div className="flex flex-col min-w-0">
                    <h4 className={`text-[15px] font-black truncate transition-colors leading-tight mb-1 ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
                      {job.title}
                    </h4>
                    <div className="flex flex-col gap-1 text-[11px] font-semibold text-gray-500">
                      <span className="flex items-center gap-1 truncate mb-2">
                        <FiBriefcase size={12} className="text-gray-400 shrink-0" />
                        {job.company}
                      </span>

                      <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                          <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Status: {statusLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Views: {job.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  <div className={`absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full border transition-all ${isSelected ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-200' : 'border-gray-200 group-hover:border-purple-300'}`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* View Responses Button */}
                  <Link
                    href={`/profile/manage-jobs/responses/${job.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 py-1.5 px-4 rounded-full border border-purple-200 bg-white flex items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all active:scale-95 group/link shadow-sm"
                  >
                    <span className="text-[10px] font-black text-purple-600 tracking-widest text-nowrap">View Applications</span>
                    <span className="text-[10px] font-black text-purple-500 bg-gray-50/80 px-1.5 py-0.5 rounded-md min-w-[20px] text-center border border-purple-50/50">
                      ({job.applicants})
                    </span>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

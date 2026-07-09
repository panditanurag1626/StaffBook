'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProfileLayout from '@/components/shared/ProfileLayout';
import { THEME } from '@/styles/theme';
import Button from '@/components/shared/Button';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiUsers,
  FiMapPin,
  FiDollarSign,
  FiBriefcase,
  FiClock,
  FiTrendingUp,
  FiX,
} from 'react-icons/fi';
import { formatDateTime } from '@/lib/utils';

interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  postedDate: string;
  applicants: number;
  views: number;
  status: 'active' | 'paused' | 'closed';
}

const mockJobs: JobPost[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'Bangalore, IN',
    salary: '₹15-20 LPA',
    type: 'Full-time',
    description: 'Looking for an experienced frontend developer with React and TypeScript skills.',
    postedDate: '2024-01-15',
    applicants: 45,
    views: 320,
    status: 'active',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'Mumbai, IN',
    salary: '₹12-18 LPA',
    type: 'Full-time',
    description: 'Seeking a creative UI/UX designer to join our design team.',
    postedDate: '2024-01-10',
    applicants: 32,
    views: 250,
    status: 'active',
  },
  {
    id: '3',
    title: 'Backend Engineer',
    company: 'DataSystems',
    location: 'Hyderabad, IN',
    salary: '₹18-25 LPA',
    type: 'Full-time',
    description: 'Backend engineer with Node.js and database expertise needed.',
    postedDate: '2024-01-05',
    applicants: 28,
    views: 180,
    status: 'paused',
  },
];

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>(mockJobs);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'closed'>('all');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
  });

  const handleCreateJob = () => {
    const newJob: JobPost = {
      id: Date.now().toString(),
      ...formData,
      postedDate: new Date().toISOString().split('T')[0],
      applicants: 0,
      views: 0,
      status: 'active',
    };
    setJobs([newJob, ...jobs]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateJob = () => {
    if (!editingJob) return;
    setJobs(jobs.map(job => job.id === editingJob.id ? { ...editingJob, ...formData } : job));
    setEditingJob(null);
    setShowCreateModal(false);
    resetForm();
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  const handleEditJob = (job: JobPost) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      description: job.description,
    });
    setShowCreateModal(true);
  };

  const toggleJobStatus = (id: string) => {
    setJobs(jobs.map(job => {
      if (job.id === id) {
        return {
          ...job,
          status: job.status === 'active' ? 'paused' : 'active'
        };
      }
      return job;
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      salary: '',
      type: 'Full-time',
      description: '',
    });
  };

  const filteredJobs = filterStatus === 'all'
    ? jobs
    : jobs.filter(job => job.status === filterStatus);

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    totalApplicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
    totalViews: jobs.reduce((sum, j) => sum + j.views, 0),
  };

  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 -mt-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${THEME.colors.text.heading} mb-2`}>Manage Job Posts</h1>
              <p className={`${THEME.components.typography.body}`}>Create, edit, and manage your job postings</p>
            </div>
            <Button
              onClick={() => {
                setEditingJob(null);
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 shadow-md hover:shadow-lg"
            >
              <FiPlus size={20} />
              Post New Job
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E4FF]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiBriefcase size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#222]">{stats.total}</p>
                  <p className="text-sm text-[#666]">Total Jobs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E4FF]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiTrendingUp size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#222]">{stats.active}</p>
                  <p className="text-sm text-[#666]">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E4FF]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiClock size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#222]">{stats.paused}</p>
                  <p className="text-sm text-[#666]">Paused</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E4FF]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiUsers size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#222]">{stats.totalApplicants}</p>
                  <p className="text-sm text-[#666]">Applicants</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E4FF]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiEye size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#222]">{stats.totalViews}</p>
                  <p className="text-sm text-[#666]">Total Views</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl p-2 shadow-sm border border-[#E8E4FF] mb-6">
            <div className="flex gap-2">
              {(['all', 'active', 'paused', 'closed'] as const).map(status => (
                <Button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  variant={filterStatus === status ? 'primary' : 'ghost'}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === status
                      ? 'rounded-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-bold ${THEME.colors.text.heading}`}>{job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'active' ? 'bg-green-100 text-green-600' :
                          job.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-[#666] mb-3">
                      <span className="flex items-center gap-1">
                        <FiBriefcase size={14} />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMapPin size={14} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiDollarSign size={14} />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock size={14} />
                        Posted: {formatDateTime(job.postedDate)}
                      </span>
                    </div>

                    <p className={`${THEME.components.typography.body} mb-4`}>{job.description}</p>

                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <FiUsers size={16} className={`text-[${THEME.colors.primary}]`} />
                        <span className={`text-sm font-semibold ${THEME.colors.text.heading}`}>{job.applicants} Applicants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiEye size={16} className={`text-[${THEME.colors.primary}]`} />
                        <span className={`text-sm font-semibold ${THEME.colors.text.heading}`}>{job.views} Views</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => toggleJobStatus(job.id)}
                      variant={job.status === 'active' ? 'warning' : 'success'}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${job.status === 'active'
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                    >
                      {job.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditJob(job)}
                      className={`p-2 border ${THEME.colors.border} rounded-lg hover:bg-gray-50 transition-colors w-auto h-auto`}
                    >
                      <FiEdit3 size={18} className={`text-[${THEME.colors.primary}]`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors w-auto h-auto"
                    >
                      <FiTrash2 size={18} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div className={`text-center py-12 bg-white rounded-2xl border ${THEME.colors.border}`}>
              <FiBriefcase size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-2`}>No job posts found</h3>
              <p className={`${THEME.components.typography.body} mb-4`}>Start by creating your first job posting</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 shadow-md hover:shadow-lg"
              >
                <FiPlus size={20} />
                Post New Job
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowCreateModal(false);
                setEditingJob(null);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-auto h-auto p-0"
            >
              <FiX size={24} />
            </Button>

            <h2 className={`${THEME.components.typography.sectionTitle} text-2xl mb-6`}>
              {editingJob ? 'Edit Job Post' : 'Create New Job Post'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block ${THEME.components.typography.subheading} mb-2`}>Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`${THEME.components.input.default}`}
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>

              <div>
                <label className={`block ${THEME.components.typography.subheading} mb-2`}>Company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={`${THEME.components.input.default}`}
                  placeholder="Company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${THEME.components.typography.subheading} mb-2`}>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`${THEME.components.input.default}`}
                    placeholder="e.g., Bangalore, IN"
                  />
                </div>

                <div>
                  <label className={`block ${THEME.components.typography.subheading} mb-2`}>Salary Range *</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className={`${THEME.components.input.default}`}
                    placeholder="e.g., ₹15-20 LPA"
                  />
                </div>
              </div>

              <div>
                <label className={`block ${THEME.components.typography.subheading} mb-2`}>Job Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`${THEME.components.input.default}`}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>

              <div>
                <label className={`block ${THEME.components.typography.subheading} mb-2`}>Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className={`${THEME.components.input.default}`}
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={editingJob ? handleUpdateJob : handleCreateJob}
                  className="flex-1 px-6 py-3 shadow-md hover:shadow-lg"
                >
                  {editingJob ? 'Update Job' : 'Post Job'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingJob(null);
                    resetForm();
                  }}
                  className={`px-6 py-3 border ${THEME.colors.border} ${THEME.components.typography.body} rounded-xl font-semibold hover:bg-gray-50 transition-colors`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
}

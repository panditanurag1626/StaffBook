'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProfileLayout from '../../../../..//components/shared/ProfileLayout';
import Card from '../../../../../components/shared/Card';
import { THEME } from '@/styles/theme';
import {
  FiUser,
  FiBriefcase,
  FiBook,
  FiTool,
  FiAward,
  FiFileText,
  FiArrowLeft,
  FiSave,
  FiEye,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiX,
  FiLayout,
  FiLock,
  FiCheckCircle,
  FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
}

interface ResumeTemplate {
  id: string;
  name: string;
  category: 'classic' | 'modern';
  isPremium: boolean;
  preview: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  template?: string;
  color?: string;
}

const sections = [
  { id: 'personal', name: 'Personal Info', icon: FiUser, required: true },
  { id: 'summary', name: 'Summary', icon: FiFileText, required: false },
  { id: 'experience', name: 'Experience', icon: FiBriefcase, required: true },
  { id: 'education', name: 'Education', icon: FiBook, required: true },
  { id: 'skills', name: 'Skills', icon: FiTool, required: true },
  { id: 'certifications', name: 'Certifications', icon: FiAward, required: false },
  { id: 'template', name: 'Choose Template', icon: FiLayout, required: true }
];

const resumeTemplates: ResumeTemplate[] = [
  // Classic Templates
  { id: 'classic-1', name: 'Professional', category: 'classic', isPremium: false, preview: '/templates/classic-1.png' },
  { id: 'classic-2', name: 'Executive', category: 'classic', isPremium: false, preview: '/templates/classic-2.png' },
  { id: 'classic-3', name: 'Traditional', category: 'classic', isPremium: true, preview: '/templates/classic-3.png' },
  { id: 'classic-4', name: 'Corporate', category: 'classic', isPremium: true, preview: '/templates/classic-4.png' },
  { id: 'classic-5', name: 'Elegant', category: 'classic', isPremium: true, preview: '/templates/classic-5.png' },

  // Modern Templates
  { id: 'modern-1', name: 'Minimalist', category: 'modern', isPremium: false, preview: '/templates/modern-1.png' },
  { id: 'modern-2', name: 'Creative', category: 'modern', isPremium: true, preview: '/templates/modern-2.png' },
  { id: 'modern-3', name: 'Bold', category: 'modern', isPremium: true, preview: '/templates/modern-3.png' },
  { id: 'modern-4', name: 'Tech', category: 'modern', isPremium: true, preview: '/templates/modern-4.png' },
  { id: 'modern-5', name: 'Designer', category: 'modern', isPremium: true, preview: '/templates/modern-5.png' },
  { id: 'modern-6', name: 'Startup', category: 'modern', isPremium: true, preview: '/templates/modern-6.png' },
];

const resumeColors = [
  { id: 'purple', name: 'Royal Purple', value: '#8B2AE2' },
  { id: 'blue', name: 'Professional Blue', value: '#5B5BE7' },
  { id: 'teal', name: 'Modern Teal', value: '#14B8A6' },
  { id: 'green', name: 'Fresh Green', value: '#10B981' },
  { id: 'orange', name: 'Vibrant Orange', value: '#F97316' },
  { id: 'red', name: 'Bold Red', value: '#EF4444' },
  { id: 'indigo', name: 'Deep Indigo', value: '#6366F1' },
  { id: 'pink', name: 'Creative Pink', value: '#EC4899' },
  { id: 'gray', name: 'Classic Gray', value: '#6B7280' },
];

// Component that uses useSearchParams
function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');

  const [activeSection, setActiveSection] = useState('personal');
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false); // TODO: Get from user context
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#8B2AE2');
  const [templateCategory, setTemplateCategory] = useState<'classic' | 'modern'>('classic');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load parsed data if coming from upload
  useEffect(() => {
    if (source === 'upload') {
      const parsedData = localStorage.getItem('parsedResumeData');
      if (parsedData) {
        try {
          const parsed = JSON.parse(parsedData);
          setResumeData({
            personalInfo: parsed.personalInfo || resumeData.personalInfo,
            summary: parsed.summary || '',
            experience: parsed.experience?.map((exp: any, index: number) => ({
              ...exp,
              id: `exp-${index}`,
              current: exp.endDate === 'Present'
            })) || [],
            education: parsed.education?.map((edu: any, index: number) => ({
              ...edu,
              id: `edu-${index}`
            })) || [],
            skills: parsed.skills || [],
            certifications: parsed.certifications?.map((cert: any, index: number) => ({
              ...cert,
              id: `cert-${index}`
            })) || []
          });
          localStorage.removeItem('parsedResumeData');
        } catch (error) {
          console.error('Error parsing resume data:', error);
        }
      }
    }
  }, [source]);

  const validateSection = (sectionId: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionId) {
      case 'personal':
        if (!resumeData.personalInfo.name.trim()) {
          newErrors['personal.name'] = 'Name is required';
        }
        if (!resumeData.personalInfo.email.trim()) {
          newErrors['personal.email'] = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(resumeData.personalInfo.email)) {
          newErrors['personal.email'] = 'Invalid email format';
        }
        if (!resumeData.personalInfo.phone.trim()) {
          newErrors['personal.phone'] = 'Phone is required';
        }
        break;

      case 'experience':
        if (resumeData.experience.length === 0) {
          newErrors['experience'] = 'At least one work experience is required';
        }
        resumeData.experience.forEach((exp, index) => {
          if (!exp.company.trim()) {
            newErrors[`experience.${index}.company`] = 'Company name is required';
          }
          if (!exp.position.trim()) {
            newErrors[`experience.${index}.position`] = 'Position is required';
          }
          if (!exp.startDate) {
            newErrors[`experience.${index}.startDate`] = 'Start date is required';
          }
        });
        break;

      case 'education':
        if (resumeData.education.length === 0) {
          newErrors['education'] = 'At least one education entry is required';
        }
        resumeData.education.forEach((edu, index) => {
          if (!edu.institution.trim()) {
            newErrors[`education.${index}.institution`] = 'Institution is required';
          }
          if (!edu.degree.trim()) {
            newErrors[`education.${index}.degree`] = 'Degree is required';
          }
        });
        break;

      case 'skills':
        if (resumeData.skills.length === 0) {
          newErrors['skills'] = 'At least one skill is required';
        }
        break;

      case 'template':
        if (!selectedTemplate) {
          newErrors['template'] = 'Please select a resume template';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const handleSave = async () => {
    // Validate all required sections
    const requiredSections = sections.filter(s => s.required).map(s => s.id);
    let isValid = true;

    for (const sectionId of requiredSections) {
      if (!validateSection(sectionId)) {
        isValid = false;
      }
    }

    if (!isValid) {
      toast.error('Please fix all validation errors before saving.');
      return;
    }

    setIsSaving(true);

    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store in localStorage for now
      localStorage.setItem('resumeData', JSON.stringify(resumeData));

      toast.success('Resume saved successfully!');
      router.push('/profile/resume');
    } catch (error) {
      toast.error('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className={`${THEME.components.typography.sectionTitle} text-2xl mb-6`}>Personal Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
            Full Name *
          </label>
          <input
            type="text"
            value={resumeData.personalInfo.name}
            onChange={(e) => updatePersonalInfo('name', e.target.value)}
            className={`${THEME.components.input.default} ${errors['personal.name'] ? 'border-red-300' : ''
              }`}
            placeholder="Enter your full name"
          />
          {errors['personal.name'] && (
            <p className="text-red-500 text-sm mt-1">{errors['personal.name']}</p>
          )}
        </div>

        <div>
          <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
            Email Address *
          </label>
          <input
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            className={`${THEME.components.input.default} ${errors['personal.email'] ? 'border-red-300' : ''
              }`}
            placeholder="your.email@example.com"
          />
          {errors['personal.email'] && (
            <p className="text-red-500 text-sm mt-1">{errors['personal.email']}</p>
          )}
        </div>

        <div>
          <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
            Phone Number *
          </label>
          <input
            type="tel"
            value={resumeData.personalInfo.phone}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            className={`${THEME.components.input.default} ${errors['personal.phone'] ? 'border-red-300' : ''
              }`}
            placeholder="+1 (555) 123-4567"
          />
          {errors['personal.phone'] && (
            <p className="text-red-500 text-sm mt-1">{errors['personal.phone']}</p>
          )}
        </div>

        <div>
          <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
            Address
          </label>
          <input
            type="text"
            value={resumeData.personalInfo.address}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
            className={THEME.components.input.default}
            placeholder="City, State/Country"
          />
        </div>

        <div>
          <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={resumeData.personalInfo.linkedin}
            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
            className={THEME.components.input.default}
            placeholder="linkedin.com/in/yourprofile"
          />
        </div>

        <div>
          <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
            Website/Portfolio
          </label>
          <input
            type="url"
            value={resumeData.personalInfo.website}
            onChange={(e) => updatePersonalInfo('website', e.target.value)}
            className={THEME.components.input.default}
            placeholder="yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <h2 className={`${THEME.components.typography.sectionTitle} text-2xl mb-6`}>Professional Summary</h2>

      <div>
        <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
          Summary
        </label>
        <textarea
          value={resumeData.summary}
          onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
          rows={6}
          className={THEME.components.input.default}
          placeholder="Write a brief summary of your professional background, key skills, and career objectives..."
        />
        <p className={`${THEME.components.typography.caption} mt-2`}>
          Tip: Keep it concise (2-3 sentences) and highlight your most relevant qualifications.
        </p>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>Work Experience</h2>
        <button
          onClick={addExperience}
          className={THEME.components.button.primary}
        >
          <FiPlus size={16} className="mr-2" />
          Add Experience
        </button>
      </div>

      {errors['experience'] && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <FiAlertCircle size={16} className="text-red-500" />
          <p className="text-red-600 text-sm">{errors['experience']}</p>
        </div>
      )}

      <div className="space-y-6">
        {resumeData.experience.map((exp, index) => (
          <div key={exp.id} className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Experience #{index + 1}</h3>
              <button
                onClick={() => removeExperience(exp.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Company *
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  className={`${THEME.components.input.default} ${errors[`experience.${index}.company`] ? 'border-red-300' : ''
                    }`}
                  placeholder="Company name"
                />
                {errors[`experience.${index}.company`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`experience.${index}.company`]}</p>
                )}
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Position *
                </label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  className={`${THEME.components.input.default} ${errors[`experience.${index}.position`] ? 'border-red-300' : ''
                    }`}
                  placeholder="Job title"
                />
                {errors[`experience.${index}.position`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`experience.${index}.position`]}</p>
                )}
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Start Date *
                </label>
                <input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  className={`${THEME.components.input.default} ${errors[`experience.${index}.startDate`] ? 'border-red-300' : ''
                    }`}
                />
                {errors[`experience.${index}.startDate`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`experience.${index}.startDate`]}</p>
                )}
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  End Date
                </label>
                <input
                  type="month"
                  value={exp.current ? '' : exp.endDate}
                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                  disabled={exp.current}
                  className={`${THEME.components.input.default} disabled:bg-gray-100`}
                />
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                  />
                  <span className={`${THEME.components.typography.caption}`}>Currently working here</span>
                </label>
              </div>
            </div>

            <div>
              <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                Description
              </label>
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                rows={4}
                className={THEME.components.input.default}
                placeholder="Describe your responsibilities, achievements, and key contributions..."
              />
            </div>
          </div>
        ))}

        {resumeData.experience.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiBriefcase size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No work experience added yet.</p>
            <p className="text-sm">Click "Add Experience" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>Education</h2>
        <button
          onClick={addEducation}
          className={THEME.components.button.primary}
        >
          <FiPlus size={16} className="mr-2" />
          Add Education
        </button>
      </div>

      {errors['education'] && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <FiAlertCircle size={16} className="text-red-500" />
          <p className="text-red-600 text-sm">{errors['education']}</p>
        </div>
      )}

      <div className="space-y-6">
        {resumeData.education.map((edu, index) => (
          <div key={edu.id} className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Education #{index + 1}</h3>
              <button
                onClick={() => removeEducation(edu.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Institution *
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  className={`${THEME.components.input.default} ${errors[`education.${index}.institution`] ? 'border-red-300' : ''
                    }`}
                  placeholder="University/School name"
                />
                {errors[`education.${index}.institution`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`education.${index}.institution`]}</p>
                )}
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Degree *
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  className={`${THEME.components.input.default} ${errors[`education.${index}.degree`] ? 'border-red-300' : ''
                    }`}
                  placeholder="Bachelor's, Master's, etc."
                />
                {errors[`education.${index}.degree`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`education.${index}.degree`]}</p>
                )}
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Field of Study
                </label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                  className={THEME.components.input.default}
                  placeholder="Computer Science, Business, etc."
                />
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  GPA (Optional)
                </label>
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                  className={THEME.components.input.default}
                  placeholder="3.8/4.0"
                />
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Start Date
                </label>
                <input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  className={THEME.components.input.default}
                />
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  End Date
                </label>
                <input
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  className={THEME.components.input.default}
                />
              </div>
            </div>
          </div>
        ))}

        {resumeData.education.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiBook size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No education added yet.</p>
            <p className="text-sm">Click "Add Education" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <h2 className={`${THEME.components.typography.sectionTitle} text-2xl mb-6`}>Skills</h2>

      {errors['skills'] && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <FiAlertCircle size={16} className="text-red-500" />
          <p className="text-red-600 text-sm">{errors['skills']}</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          className={`${THEME.components.input.default} flex-1`}
          placeholder="Add a skill (e.g., JavaScript, Project Management)"
        />
        <button
          onClick={addSkill}
          className={THEME.components.button.primary}
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {resumeData.skills.map((skill, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-2 rounded-full text-sm"
          >
            <span>{skill}</span>
            <button
              onClick={() => removeSkill(skill)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>

      {resumeData.skills.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FiTool size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No skills added yet.</p>
          <p className="text-sm">Add your technical and soft skills above.</p>
        </div>
      )}
    </div>
  );

  const handleTemplateSelect = (templateId: string, isPremium: boolean) => {
    if (isPremium && !hasSubscription) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedTemplate(templateId);
    setResumeData(prev => ({ ...prev, template: templateId, color: selectedColor }));
  };

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>Choose Resume Template</h2>
        {!hasSubscription && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            <FiAward size={16} />
            Upgrade to Premium
          </button>
        )}
      </div>

      {errors['template'] && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <FiAlertCircle size={16} className="text-red-500" />
          <p className="text-red-600 text-sm">{errors['template']}</p>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTemplateCategory('classic')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${templateCategory === 'classic'
              ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-600'
            }`}
        >
          Classic Templates
        </button>
        <button
          onClick={() => setTemplateCategory('modern')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${templateCategory === 'modern'
              ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-600'
            }`}
        >
          Modern Templates
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {resumeTemplates
          .filter(template => template.category === templateCategory)
          .map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template.id, template.isPremium)}
              className={`relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedTemplate === template.id
                  ? 'border-purple-600 shadow-lg'
                  : 'border-gray-200 hover:border-purple-600'
                }`}
            >
              {/* Template Preview */}
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <FiFileText size={48} className="text-gray-400" />

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                    {hasSubscription ? (
                      <>
                        <FiCheckCircle size={12} />
                        Premium
                      </>
                    ) : (
                      <>
                        <FiLock size={12} />
                        Premium
                      </>
                    )}
                  </div>
                )}

                {/* Selected Indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute inset-0 bg-purple-600/10 flex items-center justify-center">
                    <div className="bg-purple-600 text-white rounded-full p-3">
                      <FiCheck size={24} />
                    </div>
                  </div>
                )}

                {/* Lock Overlay for Premium Templates */}
                {template.isPremium && !hasSubscription && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <FiLock size={32} className="text-white" />
                  </div>
                )}
              </div>

              {/* Template Name */}
              <div className="p-3 text-center">
                <p className="font-semibold text-gray-900">{template.name}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Color Selection */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Resume Color</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a color theme for your resume. This will be applied to headings and accents.
        </p>

        <div className="grid grid-cols-9 gap-3">
          {resumeColors.map((color) => (
            <button
              key={color.id}
              onClick={() => {
                setSelectedColor(color.value);
                setResumeData(prev => ({ ...prev, color: color.value }));
              }}
              className={`relative p-2 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${selectedColor === color.value
                  ? 'border-gray-900 shadow-lg'
                  : 'border-gray-200'
                }`}
            >
              <div
                className="w-full h-8 rounded-md mb-1"
                style={{ backgroundColor: color.value }}
              />
              <p className="text-[10px] font-medium text-gray-900 text-center truncate">{color.name}</p>

              {selectedColor === color.value && (
                <div className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full p-0.5">
                  <FiCheck size={10} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      {selectedTemplate && (
        <div className="bg-gradient-to-br from-purple-50 to-[#F3EFFF] p-6 rounded-xl border border-purple-600/20">
          <div className="flex items-center gap-3 mb-4">
            <FiEye size={20} className="text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Selected Template</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                {resumeTemplates.find(t => t.id === selectedTemplate)?.name}
              </p>
              <p className="text-sm text-gray-600 capitalize">
                {resumeTemplates.find(t => t.id === selectedTemplate)?.category} Style
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Color:</span>
              <div
                className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiX size={24} />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock size={32} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Premium</h3>
              <p className="text-gray-600 mb-6">
                Unlock all premium templates and advanced features to create stunning resumes that stand out.
              </p>

              <div className="bg-gradient-to-br from-purple-50 to-[#F3EFFF] p-4 rounded-xl mb-6">
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2 text-sm text-gray-900">
                    <FiCheckCircle size={16} className="text-green-500" />
                    Access to all premium templates
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-900">
                    <FiCheckCircle size={16} className="text-green-500" />
                    Unlimited color customization
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-900">
                    <FiCheckCircle size={16} className="text-green-500" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-900">
                    <FiCheckCircle size={16} className="text-green-500" />
                    Export in multiple formats
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    // TODO: Navigate to subscription page
                    router.push('/subscription');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`${THEME.components.typography.sectionTitle} text-2xl`}>Certifications</h2>
        <button
          onClick={addCertification}
          className={THEME.components.button.primary}
        >
          <FiPlus size={16} className="mr-2" />
          Add Certification
        </button>
      </div>

      <div className="space-y-6">
        {resumeData.certifications.map((cert, index) => (
          <div key={cert.id} className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Certification #{index + 1}</h3>
              <button
                onClick={() => removeCertification(cert.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Certification Name
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                  className={THEME.components.input.default}
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Issuing Organization
                </label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                  className={THEME.components.input.default}
                  placeholder="Amazon Web Services"
                />
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Issue Date
                </label>
                <input
                  type="month"
                  value={cert.date}
                  onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                  className={THEME.components.input.default}
                />
              </div>

              <div>
                <label className={`${THEME.components.typography.body} block font-medium mb-2`}>
                  Expiry Date (Optional)
                </label>
                <input
                  type="month"
                  value={cert.expiryDate || ''}
                  onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                  className={THEME.components.input.default}
                />
              </div>
            </div>
          </div>
        ))}

        {resumeData.certifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiAward size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No certifications added yet.</p>
            <p className="text-sm">Click "Add Certification" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfo();
      case 'summary':
        return renderSummary();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      case 'certifications':
        return renderCertifications();
      case 'template':
        return renderTemplateSelection();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
      <div className={`min-h-screen ${THEME.colors.background.page} pt-4 md:pt-6 lg:pt-8 mt-[50px]`}>
        <div className="w-full px-3 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
            <Link
              href="/profile/resume/create"
              className={`flex items-center ${THEME.components.typography.body} hover:text-purple-600 transition-colors`}
            >
              <FiArrowLeft className="mr-2" size={16} />
              Back to Options
            </Link>
            <FiChevronRight className="mx-2 text-gray-400" size={14} />
            <span className={`${THEME.components.typography.body} font-medium text-gray-900`}>Resume Builder</span>
          </nav>

          {/* Main Layout - 2 Column Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Navigation Sidebar */}
            <div className="col-span-3">
              <Card className="sticky top-6 flex flex-col h-[calc(100vh-120px)]" noPadding={true}>
                <div className="flex-1 p-6 overflow-y-auto">
                  <h2 className={`${THEME.components.typography.sectionTitle} text-xl mb-6`}>Sections</h2>

                  <nav className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      const hasError = Object.keys(errors).some(key => key.startsWith(section.id));

                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                              ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'
                              : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                            }`}
                        >
                          <Icon size={20} />
                          <span className="font-medium text-sm">{section.name}</span>
                          {section.required && (
                            <span className="text-xs">*</span>
                          )}
                          {hasError && !isActive && (
                            <FiAlertCircle size={16} className="text-red-500 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Save Button */}
                <div className="p-6 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <FiLoader size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave size={20} />
                        Save Resume
                      </>
                    )}
                  </button>
                </div>
              </Card>
            </div>

            {/* Right Column - Main Content */}
            <div className="col-span-9">
              <Card className="p-8">
                {renderSection()}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

// Main component with Suspense boundary
export default function ResumeBuilder() {
  return (
    <Suspense fallback={
      <div className={`min-h-screen ${THEME.colors.background.page} flex items-center justify-center`}>
        <div className="text-center">
          <FiLoader size={48} className="mx-auto mb-4 text-purple-600 animate-spin" />
          <p className="text-gray-600 text-lg">Loading Resume Builder...</p>
        </div>
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  );
}
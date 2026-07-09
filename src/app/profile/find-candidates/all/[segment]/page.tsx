'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileLayout from '@/components/shared/ProfileLayout';
import Card from '@/components/shared/Card';
import CandidateCard from '@/components/shared/CandidateCard';
import { THEME } from '@/styles/theme';
import {
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiX,
  FiMapPin,
  FiNavigation
} from 'react-icons/fi';
import { Candidate } from '@/types/candidate';
import { useCandidateFilters } from '@/hooks/useCandidateFilters';
import { CANDIDATE_FILTER_OPTIONS } from '@/constants/candidateFilterOptions';
import Button from '@/components/shared/Button';
import toast from 'react-hot-toast';

// Mock data (in a real app, this would be fetched based on the segment or from a global state/API)
const allCandidatesData: Record<string, Candidate[]> = {
  'ready-to-join': [
    {
      id: '1',
      name: 'Sourabh Patidar',
      title: 'Senior Frontend Developer',
      location: 'Bangalore, IN',
      experience: '5 years',
      skills: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
      education: 'B.Tech in Computer Science',
      distance_display: "2.5",
      image: '/images/user_profile_placeholder.jpeg',
      lastActive: '2 hours ago',
      isOnline: true,
      email: 'sourabh@example.com',
      phone: '9876543210',
      salary: '₹ 15.00 Lacs',
      views: 45
    },
    {
      id: '2',
      name: 'Anjali Sharma',
      title: 'Product Designer',
      location: 'Mumbai, IN',
      experience: '3 years',
      skills: ['UI/UX', 'Figma', 'Adobe XD', 'Prototyping'],
      education: 'B.Des in Interaction Design',
      distance_display: "4.8",
      image: '/images/user_profile_placeholder.jpeg',
      lastActive: '5 hours ago',
      isOnline: false,
      email: 'anjali@example.com',
      phone: '9876543211',
      salary: '₹ 12.00 Lacs',
      views: 32
    },
  ],
  'nearby': [
    {
      id: 'n1',
      name: 'Rajeev Tripathi',
      title: 'UI/UX Designer',
      location: 'Bangalore, IN',
      experience: '4 years',
      skills: ['Figma', 'User Research', 'Prototyping'],
      education: 'B.Des in Interaction Design',
      distance_display: "2.3",
      image: '/images/user_profile_placeholder.jpeg',
      lastActive: '1 hour ago',
      isOnline: true,
      email: 'rajeev@example.com',
      phone: '9876543210',
      salary: '₹ 10.00 Lacs',
      views: 28
    },
  ],
  'same-skills': [
    {
      id: 's1',
      name: 'Amit Kumar',
      title: 'Full Stack Engineer',
      location: 'Bangalore, IN',
      experience: '6 years',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      education: 'M.Tech in Software Engineering',
      distance_display: "8.1",
      image: '/images/user_profile_placeholder.jpeg',
      lastActive: '30 mins ago',
      isOnline: true,
      email: 'amit@example.com',
      phone: '9876543210',
      salary: '₹ 22.00 Lacs',
      views: 64
    },
  ]
};

const segmentTitles: Record<string, string> = {
  'ready-to-join': 'Ready To Join Candidates',
  'nearby': 'Candidates in Your Area',
  'same-skills': 'Candidates Having Same Skills'
};

export default function AllCandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const segment = params.segment as string;

  const { filters, setters, helpers } = useCandidateFilters();
  const [openSection, setOpenSection] = useState<string | null>("radius");

  const candidatesData = allCandidatesData[segment] || [];
  const title = segmentTitles[segment] || 'Candidates';

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const filteredCandidates = candidatesData.filter(candidate => {
    // Search query
    if (filters.searchQuery &&
      !candidate.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
      !candidate.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }

    // Experience
    if (filters.selectedExperience.length > 0) {
      const match = filters.selectedExperience.some(exp => {
        if (exp === "Fresher" && candidate.experience.includes("0")) return true;
        if (exp === "1-3 Years" && (candidate.experience.includes("1") || candidate.experience.includes("2") || candidate.experience.includes("3"))) return true;
        if (exp === "3-5 Years" && (candidate.experience.includes("3") || candidate.experience.includes("4") || candidate.experience.includes("5"))) return true;
        if (exp === "5-10 Years" && candidate.experience.includes("5")) return true;
        return false;
      });
      if (!match) return false;
    }

    // Radius
    if (candidate.distance_display !== undefined && parseFloat(candidate.distance_display) > filters.radiusValue) {
      return false;
    }

    return true;
  });

  // Active filters for display
  const activeFilters = [
    ...(filters.selectedExperience.map(exp => ({ type: 'experience', value: exp, label: exp }))),
    ...(filters.selectedSkills ? [{ type: 'skills', value: filters.selectedSkills, label: filters.selectedSkills }] : []),
    ...(filters.city ? [{ type: 'city', value: filters.city, label: `City: ${filters.city}` }] : []),
    ...(filters.state ? [{ type: 'state', value: filters.state, label: `State: ${filters.state}` }] : []),
  ];

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'experience': setters.setSelectedExperience(filters.selectedExperience.filter(i => i !== value)); break;
      case 'skills': setters.setSelectedSkills(''); break;
      case 'city': setters.setCity(''); break;
      case 'state': setters.setState(''); break;
    }
  };




  return (
    <ProfileLayout showSidebar={false} showStories={false} showJobSearchBar={false}>
      <div className={`min-h-screen ${THEME.colors.background.page}  pb-20`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex gap-6">
            {/* Left Sidebar - Filters matching reference image */}
            <div className="w-[20%] flex-shrink-0 hidden lg:block">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide hover:scrollbar-default transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-200">
                    <FiMapPin size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#222]">Candidates Near You</h3>
                </div>

                {/* Map Placeholder - Exactly matching reference image */}
                <div className="mb-6 h-[120px] bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-200 rounded-2xl relative overflow-hidden group border border-white shadow-inner">
                  <div className="absolute inset-0 opacity-40">
                    <svg viewBox="0 0 200 100" className="w-full h-full stroke-white fill-none" strokeWidth="1" strokeDasharray="4 2">
                      <path d="M0,50 Q50,30 100,50 T200,50" />
                      <circle cx="50" cy="40" r="3" fill="white" stroke="none" />
                      <circle cx="100" cy="50" r="3" fill="white" stroke="none" />
                      <circle cx="150" cy="45" r="3" fill="white" stroke="none" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-white/50 group-hover:scale-110 transition-transform cursor-pointer">
                      <FiNavigation size={14} className="text-purple-700" />
                    </div>
                  </div>
                </div>

                {/* Filters Stack - Full set from image */}
                <div className="space-y-1">
                  {[
                    { id: 'radius', label: 'Radius' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'departments', label: 'Departments' },
                    { id: 'location', label: 'Location' },
                    { id: 'salary', label: 'Salary' },
                    { id: 'role', label: 'Role/ Category' },
                    { id: 'stipend', label: 'Salary/ Stipend' },
                    { id: 'education', label: 'Education' }
                  ].map((section) => (
                    <div key={section.id} className="border-b border-gray-50 last:border-0 py-1">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between hover:text-purple-600 transition-colors py-2 group"
                      >
                        <span className="text-sm font-bold text-gray-700 group-hover:text-purple-800">{section.label}</span>
                        <FiChevronRight className={`text-gray-400 transition-transform duration-300 ${openSection === section.id ? "rotate-90" : ""}`} size={16} />
                      </button>

                      {openSection === section.id && section.id === 'radius' && (
                        <div className="pb-4 pt-2 animate-fadeIn px-1">
                          <div className="text-center mb-3">
                            <span className="text-xl font-black text-purple-600 tracking-tight">{filters.radiusValue} <span className="text-xs">km</span></span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={filters.radiusValue}
                            onChange={(e) => setters.setRadiusValue(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-bold">
                            <span>0 km</span>
                            <span>100 km</span>
                          </div>
                        </div>
                      )}

                      {openSection === section.id && section.id !== 'radius' && (
                        <div className="pb-4 pt-2 animate-fadeIn px-1">
                          <p className="text-[11px] text-gray-400 italic">Expand options for {section.label}...</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={helpers.clearAllFilters}
                  className="w-full text-xs text-purple-600 font-bold hover:bg-purple-50 rounded-xl py-3 mt-4 border border-purple-50"
                >
                  Reset All Filters
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-0 pt-2">
                <nav className="flex items-center text-xs font-bold text-gray-400 mb-6 gap-2">
                  <button onClick={() => router.push('/profile/find-candidates')} className="hover:text-purple-600 flex items-center gap-1.5 transition-colors">
                    <FiArrowLeft size={14} /> Back to Find Candidates
                  </button>
                  <span className="text-gray-200">/</span>
                  <span className="text-gray-600 font-black">{title}</span>
                </nav>

                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
                    {title} <span className="text-gray-400 font-medium ml-1">({filteredCandidates.length})</span>
                  </h1>
                </div>
              </div>

              {/* Candidates List - Matching main dashboard */}
              <div className="space-y-4">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onDownloadResume={(name) => toast.success(`Downloading resume for ${name}...`)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center border-dashed border-2 border-gray-200 bg-gray-50/50 rounded-3xl">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-gray-100 mx-auto mb-6 border border-gray-100">
                      <FiSearch size={32} className="text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No matching talent found</h3>
                    <p className="text-gray-400 font-bold max-w-sm mx-auto">Try broadening your search criteria or changing your location filters</p>
                    <Button
                      variant="outline"
                      onClick={helpers.clearAllFilters}
                      className="mt-8 border-purple-200 text-purple-700 hover:bg-purple-50 font-black h-12 rounded-2xl shadow-none"
                    >
                      Browse All Candidates
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

import React from "react";
import { FiSearch, FiFilter, FiChevronDown, FiX } from "react-icons/fi";
import { CANDIDATE_FILTER_OPTIONS } from "@/constants/candidateFilterOptions";
import { CandidateFilters } from "@/hooks/useCandidateFilters";
import CityMultiSelect from "./CityMultiSelect";

interface CandidateFilterProps {
  filters: CandidateFilters;
  setters: {
    setSearchQuery: (value: string) => void;
    setSelectedSkills: React.Dispatch<React.SetStateAction<string>>;
    setSelectedExperience: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedAvailability: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedEducation: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedIndustry: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedLastActive: (value: string) => void;
    setRadiusValue: React.Dispatch<React.SetStateAction<number>>;
    setSalaryRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    setAgeRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    setGender: (value: string) => void;
    setPreferredShift: (value: string) => void;
    setWorkStatus: (value: string) => void;
    setEmploymentType: (value: string) => void;
    setNoticePeriod: (value: string) => void;
    setHasResume: (value: boolean | null) => void;
    setCity: (value: string) => void;
    setState: (value: string) => void;
    setShowFilters: (value: boolean) => void;
  };
  helpers: {
    toggleFilter: (
      value: string,
      selected: string[],
      setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => void;
    clearAllFilters: () => void;
    activeFiltersCount: number;
  };
  onApply?: () => void;
}

export default function CandidateFilter({ filters, setters, helpers, onApply }: CandidateFilterProps) {
  const [localSearch, setLocalSearch] = React.useState(filters.searchQuery);

  React.useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        setters.setSearchQuery(localSearch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, filters.searchQuery, setters]);

  const {
    searchQuery,
    selectedSkills,
    selectedExperience,
    selectedAvailability,
    selectedEducation,
    selectedIndustry,
    selectedLastActive,
    radiusValue,
    salaryRange,
    ageRange,
    gender,
    preferredShift,
    workStatus,
    employmentType,
    noticePeriod,
    hasResume,
    city,
    state,
    showFilters,
  } = filters;

  const {
    setSearchQuery,
    setSelectedSkills,
    setSelectedExperience,
    setSelectedAvailability,
    setSelectedEducation,
    setSelectedIndustry,
    setSelectedLastActive,
    setRadiusValue,
    setSalaryRange,
    setAgeRange,
    setGender,
    setPreferredShift,
    setWorkStatus,
    setEmploymentType,
    setNoticePeriod,
    setHasResume,
    setCity,
    setState,
    setShowFilters,
  } = setters;

  const { toggleFilter, activeFiltersCount } = helpers;

  const handleApply = () => {
    setSearchQuery(localSearch);
    setShowFilters(false);
    if (onApply) onApply();
  };

  return (
    <div className="space-y-4">
      {/* Horizontal Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E4FF]">
        {/* Search and Filter Toggle */}
        <div className="flex flex-row gap-2 md:gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search candidates by role or skills..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-10 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-xs text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 h-9 rounded-full font-semibold text-xs transition-all duration-300 whitespace-nowrap bg-purple-700 hover:bg-purple-800 text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50"
          >
            <FiFilter size={16} />
            Filters
            <FiChevronDown
              size={16}
              className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
            />
            {activeFiltersCount > 0 && (
              <span className="bg-white text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn space-y-6">
            {/* Row 1: Radius, Salary, Last Active */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radius Filter */}
              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Radius</label>
                <div className="text-center mb-2">
                  <span className="text-lg font-bold text-purple-600">{radiusValue} km</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={radiusValue}
                  onChange={(e) => setRadiusValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 km</span>
                  <span>100 km</span>
                </div>
              </div> */}

              {/* Salary Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Expected Salary (LPA)</label>
                <div className="text-center mb-2">
                  <span className="text-lg font-bold text-purple-600">₹{salaryRange[0]}-{salaryRange[1]} LPA</span>
                </div>
                <div className="relative h-8">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full"
                    style={{
                      background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${(salaryRange[0] / 50) * 100}%, #7c3aed ${(salaryRange[0] / 50) * 100}%, #7c3aed ${(salaryRange[1] / 50) * 100}%, #e5e7eb ${(salaryRange[1] / 50) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={salaryRange[0]}
                    onChange={(e) => setSalaryRange([Math.min(parseInt(e.target.value), salaryRange[1] - 1), salaryRange[1]])}
                    className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-track]:bg-transparent z-10"
                    style={{ zIndex: salaryRange[0] > 48 ? 20 : 10 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={salaryRange[1]}
                    onChange={(e) => setSalaryRange([salaryRange[0], Math.max(parseInt(e.target.value), salaryRange[0] + 1)])}
                    className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-track]:bg-transparent"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹0 LPA</span>
                  <span>₹50+ LPA</span>
                </div>
              </div>

              {/* Last Active Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Last Active</label>
                <select
                  value={selectedLastActive}
                  onChange={(e) => setSelectedLastActive(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700"
                >
                  <option value="">Any time</option>
                  {CANDIDATE_FILTER_OPTIONS.lastActive.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Skills (Text Field), Experience, Availability */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Skills Filter - full width on mobile, first col on desktop */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                <input
                  type="text"
                  value={selectedSkills}
                  onChange={(e) => setSelectedSkills(e.target.value)}
                  placeholder="Enter skills (e.g. React, Node.js)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                <select
                  value={selectedExperience.length === 1 ? selectedExperience[0] : ''}
                  onChange={(e) => setSelectedExperience(e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700"
                >
                  <option value="">Select Experience</option>
                  {CANDIDATE_FILTER_OPTIONS.experienceLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                <select
                  value={selectedAvailability.length === 1 ? selectedAvailability[0] : ''}
                  onChange={(e) => setSelectedAvailability(e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700"
                >
                  <option value="">Select Availability</option>
                  {CANDIDATE_FILTER_OPTIONS.availability.map((av) => (
                    <option key={av} value={av}>{av}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Education, Industry, City, State */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Education Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
                <select
                  value={selectedEducation.length === 1 ? selectedEducation[0] : ''}
                  onChange={(e) => setSelectedEducation(e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700"
                >
                  <option value="">Select Education</option>
                  {CANDIDATE_FILTER_OPTIONS.education.map((edu) => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                </select>
              </div>

              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                <select
                  value={selectedIndustry.length === 1 ? selectedIndustry[0] : ''}
                  onChange={(e) => setSelectedIndustry(e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700"
                >
                  <option value="">Select Industry</option>
                  {CANDIDATE_FILTER_OPTIONS.industry.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="col-span-2 md:col-span-2 lg:col-span-2 relative z-[20]">
                <CityMultiSelect
                  selectedCities={city ? city.split(',').filter(Boolean) : []}
                  onChange={(cities) => setCity(cities.join(','))}
                  label="City"
                  placeholder="Select cities..."
                />
              </div>

              {/* State Filter */}
              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div> */}
            </div>

            {/* Row 4: Extra Filters (Gender, Shift, Work Status, etc.) */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700">
                  <option value="">Select Gender</option>
                  {CANDIDATE_FILTER_OPTIONS.gender.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Shift</label>
                <select value={preferredShift} onChange={(e) => setPreferredShift(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700">
                  <option value="">Select Shift</option>
                  {CANDIDATE_FILTER_OPTIONS.preferredShift.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Status</label>
                <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700">
                  <option value="">Select Status</option>
                  {CANDIDATE_FILTER_OPTIONS.workStatus.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700">
                  <option value="">All Types</option>
                  {CANDIDATE_FILTER_OPTIONS.employmentType.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Row 5: Notice Period, Age, Has Resume + Submit Button */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Period (Months)</label>
                <select value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700">
                  <option value="">Any</option>
                  {[0, 1, 2, 3, 4, 5, 6].map(m => <option key={m} value={m}>{m} {m === 1 ? 'Month' : 'Months'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="18"
                    max="60"
                    value={ageRange[0]}
                    onChange={(e) => setAgeRange([parseInt(e.target.value) || 18, ageRange[1]])}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="18"
                    max="60"
                    value={ageRange[1]}
                    onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value) || 60])}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 py-2">
                <label className="text-sm font-semibold text-gray-700">Has Resume</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHasResume(hasResume === true ? null : true)}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${hasResume === true ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >Yes</button>
                  <button
                    onClick={() => setHasResume(hasResume === false ? null : false)}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${hasResume === false ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >No</button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleApply}
                  className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
            {searchQuery && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                <span>"{searchQuery}"</span>
                <button onClick={() => setSearchQuery("")}><FiX size={14} /></button>
              </div>
            )}
            {selectedSkills && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                <span>Skills: {selectedSkills}</span>
                <button onClick={() => setSelectedSkills("")}><FiX size={14} /></button>
              </div>
            )}
            <button
              onClick={helpers.clearAllFilters}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



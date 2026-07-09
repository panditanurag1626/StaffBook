import React from "react";
import { FiSearch, FiX, FiFilter, FiChevronDown } from "react-icons/fi";
import { FILTER_OPTIONS } from "@/constants/jobFilterOptions";
import { JobFilters } from "@/hooks/useJobFilters";
import CityMultiSelect from "./CityMultiSelect";

interface JobFilterProps {
  filters: JobFilters;
  setters: {
    setSearchQuery: (value: string) => void;
    setSelectedLocation: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedWorkMode: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedExperience: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedIndustry: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedJobType: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedCompanySize: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedSkills: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedEducation: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedBenefits: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedJobRole: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedPostedBy: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedPostedDate: (value: string) => void;
    setSalaryRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    setExperienceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    setRadiusValue: React.Dispatch<React.SetStateAction<number>>;
    setShowTopCompanies: (value: boolean) => void;
    setShowVerifiedOnly: (value: boolean) => void;
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
  onApply: (overrides?: any) => void;
  sidebar?: boolean;
  hideSearch?: boolean;
}

export default function JobFilter({ filters, setters, helpers, onApply, sidebar, hideSearch }: JobFilterProps) {
  const {
    searchQuery,
    selectedLocation,
    selectedWorkMode,
    selectedExperience,
    selectedIndustry,
    selectedJobType,
    selectedCompanySize,
    selectedSkills,
    selectedEducation,
    selectedBenefits,
    selectedJobRole,
    selectedDepartments,
    selectedPostedBy,
    selectedPostedDate,
    salaryRange,
    experienceRange,
    radiusValue,
    showTopCompanies,
    showVerifiedOnly,
    showFilters,
  } = filters;

  const {
    setSearchQuery,
    setSelectedLocation,
    setSelectedWorkMode,
    setSelectedExperience,
    setSelectedIndustry,
    setSelectedJobType,
    setSelectedCompanySize,
    setSelectedSkills,
    setSelectedEducation,
    setSelectedBenefits,
    setSelectedJobRole,
    setSelectedDepartments,
    setSelectedPostedBy,
    setSelectedPostedDate,
    setSalaryRange,
    setExperienceRange,
    setRadiusValue,
    setShowTopCompanies,
    setShowVerifiedOnly,
    setShowFilters,
  } = setters;

  const { toggleFilter, activeFiltersCount } = helpers;

  const salaryOptions = [
    { value: 0, label: "0 LPA" },
    { value: 3, label: "3 LPA" },
    { value: 6, label: "6 LPA" },
    { value: 10, label: "10 LPA" },
    { value: 15, label: "15 LPA" },
    { value: 25, label: "25 LPA" },
    { value: 50, label: "50 LPA" },
    { value: 99, label: "99 LPA" },
  ];

  const experienceOptions = [
    { value: 0, label: "0 yrs" },
    { value: 2, label: "2 yrs" },
    { value: 5, label: "5 yrs" },
    { value: 10, label: "10 yrs" },
    { value: 15, label: "15 yrs" },
    { value: 20, label: "20 yrs" },
    { value: 30, label: "30 yrs" },
    { value: 50, label: "50 yrs" },
  ];

  // For max dropdown: replace last option with "+" variant
  const salaryMaxOptions = salaryOptions.map(o => o.value === 99 ? { value: 99, label: "99 LPA+" } : o);
  const experienceMaxOptions = experienceOptions.map(o => o.value === 50 ? { value: 50, label: "50+ yrs" } : o);

  const handleClearAll = () => {
    helpers.clearAllFilters();
    onApply({
      searchQuery: "",
      selectedLocation: [],
      selectedWorkMode: [],
      selectedExperience: [],
      selectedIndustry: [],
      selectedJobType: [],
      selectedCompanySize: [],
      selectedSkills: [],
      selectedEducation: [],
      selectedBenefits: [],
      selectedJobRole: [],
      selectedDepartments: [],
      selectedPostedBy: [],
      selectedPostedDate: "",
      salaryRange: [0, 99],
      experienceRange: [0, 50],
      radiusValue: 25,
      showTopCompanies: false,
      showVerifiedOnly: false,
    });
  };

  const searchBar = !hideSearch && (
    <div className="flex flex-row gap-2">
      <div className="flex-1 relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search jobs by title, company, or keyword…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
          className="w-full h-9 pl-10 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-xs text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <button
        onClick={onApply}
        className="flex items-center gap-2 px-4 h-9 rounded-xl font-semibold text-xs transition-all duration-300 bg-purple-100 text-purple-700 hover:bg-purple-200"
      >
        Search
      </button>
    </div>
  );

  const filterSections = (
    <div className="space-y-5">

      {/* Preferred Location */}
      <div>
        <CityMultiSelect
          selectedCities={selectedLocation}
          onChange={(cities) => setSelectedLocation(cities)}
          label="Preferred Location"
          placeholder="e.g. Mumbai, Delhi"
        />
      </div>

      {/* Work Mode */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Work Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.workModes.map((mode) => (
            <label
              key={mode}
              className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedWorkMode.includes(mode)}
                onChange={() =>
                  toggleFilter(mode, selectedWorkMode, setSelectedWorkMode)
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-xs text-gray-700">{mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Employment Type
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.jobTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedJobType.includes(type)}
                onChange={() =>
                  toggleFilter(type, selectedJobType, setSelectedJobType)
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-xs text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Salary Range (LPA)
        </label>
        <div className="flex items-center gap-2">
          <select
            value={salaryRange[0]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSalaryRange([val, Math.max(val, salaryRange[1])]);
            }}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            {salaryOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value > salaryRange[1]}>{opt.label}</option>
            ))}
          </select>
          <span className="text-[10px] text-gray-400 font-medium">to</span>
          <select
            value={salaryRange[1]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSalaryRange([Math.min(val, salaryRange[0]), val]);
            }}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            {salaryMaxOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value < salaryRange[0]}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Experience Years */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Experience (Years)
        </label>
        <div className="flex items-center gap-2">
          <select
            value={experienceRange[0]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setExperienceRange([val, Math.max(val, experienceRange[1])]);
            }}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            {experienceOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value > experienceRange[1]}>{opt.label}</option>
            ))}
          </select>
          <span className="text-[10px] text-gray-400 font-medium">to</span>
          <select
            value={experienceRange[1]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setExperienceRange([Math.min(val, experienceRange[0]), val]);
            }}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            {experienceMaxOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value < experienceRange[0]}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={() => onApply()}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
      >
        Apply Filters
      </button>

      {/* Clear All */}
      {activeFiltersCount > 0 && (
        <button
          onClick={handleClearAll}
          className="w-full text-xs font-semibold text-purple-600 hover:text-purple-700 underline text-center"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  if (sidebar) {
    return (
      <div className="p-3">
        {searchBar}
        {filterSections}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 md:mt-14">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E4FF]">
        {/* Search + Filter Toggle Row */}
        <div className="flex flex-row gap-2 md:gap-4">
          <div className="flex-1 relative">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search jobs by title, company, or keyword…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onApply()}
              className="w-full h-9 pl-10 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-xs text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={onApply}
            className="flex items-center gap-2 px-4 h-9 rounded-xl font-semibold text-xs transition-all duration-300 bg-purple-100 text-purple-700 hover:bg-purple-200 hidden md:flex"
          >
            Search
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 h-9 rounded-full font-semibold text-xs transition-all duration-300 whitespace-nowrap bg-purple-700 hover:bg-purple-800 text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50"
          >
            <FiFilter size={16} />
            Filter Jobs
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

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {filterSections}
          </div>
        )}

        {/* Active Filters Pills - only in non-sidebar mode */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-700">
              Active Filters:
            </span>

            {searchQuery && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Search: "{searchQuery}"</span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    onApply({ searchQuery: "" });
                  }}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {[
              { label: "", value: selectedLocation, setter: setSelectedLocation, paramName: "selectedLocation" },
              { label: "", value: selectedWorkMode, setter: setSelectedWorkMode, paramName: "selectedWorkMode" },
              { label: "Type: ", value: selectedJobType, setter: setSelectedJobType, paramName: "selectedJobType" },
              { label: "Exp: ", value: selectedExperience, setter: setSelectedExperience, paramName: "selectedExperience" },
              { label: "Ind: ", value: selectedIndustry, setter: setSelectedIndustry, paramName: "selectedIndustry" },
              { label: "Size: ", value: selectedCompanySize, setter: setSelectedCompanySize, paramName: "selectedCompanySize" },
              { label: "Skill: ", value: selectedSkills, setter: setSelectedSkills, paramName: "selectedSkills" },
              { label: "Edu: ", value: selectedEducation, setter: setSelectedEducation, paramName: "selectedEducation" },
              { label: "Benefit: ", value: selectedBenefits, setter: setSelectedBenefits, paramName: "selectedBenefits" },
              { label: "Role: ", value: selectedJobRole, setter: setSelectedJobRole, paramName: "selectedJobRole" },
              { label: "Dept: ", value: selectedDepartments, setter: setSelectedDepartments, paramName: "selectedDepartments" },
              { label: "By: ", value: selectedPostedBy, setter: setSelectedPostedBy, paramName: "selectedPostedBy" },
            ].map(({ label, value, setter, paramName }) =>
              value.map((item) => (
                <div
                  key={`${paramName}-${item}`}
                  className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  <span>{label}{item}</span>
                  <button
                    onClick={() => {
                      const newItems = value.filter((i) => i !== item);
                      setter(newItems);
                      onApply({ [paramName]: newItems });
                    }}
                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))
            )}

            {selectedPostedDate && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Posted: {FILTER_OPTIONS.postedDateOptions?.find((opt) => opt.value === selectedPostedDate)?.label || selectedPostedDate}</span>
                <button
                  onClick={() => {
                    setSelectedPostedDate("");
                    onApply({ selectedPostedDate: "" });
                  }}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {(salaryRange[0] > 0 || salaryRange[1] < 50) && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Salary: ₹{salaryRange[0]}-{salaryRange[1]} LPA</span>
                <button
                  onClick={() => {
                    setSalaryRange([0, 50]);
                    onApply({ salaryRange: [0, 50] });
                  }}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {(experienceRange[0] > 0 || experienceRange[1] < 35) && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Exp: {experienceRange[0]}-{experienceRange[1]} Yrs</span>
                <button
                  onClick={() => {
                    setExperienceRange([0, 35]);
                    onApply({ experienceRange: [0, 35] });
                  }}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {radiusValue !== 25 && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Radius: {radiusValue}km</span>
                <button
                  onClick={() => {
                    setRadiusValue(25);
                    onApply({ radiusValue: 25 });
                  }}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {showTopCompanies && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Top Companies</span>
                <button
                  onClick={() => {
                    setShowTopCompanies(false);
                    onApply({ showTopCompanies: false });
                  }}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {showVerifiedOnly && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Verified Employers</span>
                <button
                  onClick={() => {
                    setShowVerifiedOnly(false);
                    onApply({ showVerifiedOnly: false });
                  }}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {(activeFiltersCount > 0) && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 underline ml-2"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

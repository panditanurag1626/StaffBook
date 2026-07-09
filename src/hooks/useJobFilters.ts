import { useState } from "react";

export interface JobFilters {
  searchQuery: string;
  selectedLocation: string[];
  selectedWorkMode: string[];
  selectedExperience: string[];
  selectedIndustry: string[];
  selectedJobType: string[];
  selectedCompanySize: string[];
  selectedSkills: string[];
  selectedEducation: string[];
  selectedBenefits: string[];
  selectedJobRole: string[];
  selectedDepartments: string[];
  selectedPostedBy: string[];
  selectedPostedDate: string;
  salaryRange: [number, number];
  experienceRange: [number, number];
  radiusValue: number;
  showTopCompanies: boolean;
  showVerifiedOnly: boolean;
  showFilters: boolean;
}

export function useJobFilters() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string[]>([]);
  const [selectedCompanySize, setSelectedCompanySize] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPostedBy, setSelectedPostedBy] = useState<string[]>([]);
  const [selectedPostedDate, setSelectedPostedDate] = useState("");
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 50]);
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 35]);
  const [radiusValue, setRadiusValue] = useState(25);
  const [showTopCompanies, setShowTopCompanies] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<JobFilters>({
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
    salaryRange: [0, 50],
    experienceRange: [0, 35],
    radiusValue: 25,
    showTopCompanies: false,
    showVerifiedOnly: false,
    showFilters: false,
  });

  const applyFilters = (overrides?: Partial<JobFilters>) => {
    setAppliedFilters({
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
      ...overrides,
    });
  };

  // Filter helper functions
  const toggleFilter = (
    value: string,
    selected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedLocation([]);
    setSelectedWorkMode([]);
    setSelectedExperience([]);
    setSelectedIndustry([]);
    setSelectedJobType([]);
    setSelectedCompanySize([]);
    setSelectedSkills([]);
    setSelectedEducation([]);
    setSelectedBenefits([]);
    setSelectedJobRole([]);
    setSelectedDepartments([]);
    setSelectedPostedBy([]);
    setSelectedPostedDate("");
    setSalaryRange([0, 50]);
    setExperienceRange([0, 35]);
    setRadiusValue(25);
    setShowTopCompanies(false);
    setShowVerifiedOnly(false);
    setAppliedFilters({
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
      salaryRange: [0, 50],
      experienceRange: [0, 35],
      radiusValue: 25,
      showTopCompanies: false,
      showVerifiedOnly: false,
      showFilters: showFilters, // Keep showFilters state
    });
  };

  const activeFiltersCount =
    selectedLocation.length +
    selectedWorkMode.length +
    selectedExperience.length +
    selectedIndustry.length +
    selectedJobType.length +
    selectedCompanySize.length +
    selectedSkills.length +
    selectedEducation.length +
    selectedBenefits.length +
    selectedJobRole.length +
    selectedDepartments.length +
    selectedPostedBy.length +
    (searchQuery ? 1 : 0) +
    (selectedPostedDate ? 1 : 0) +
    (showTopCompanies ? 1 : 0) +
    (showVerifiedOnly ? 1 : 0) +
    (salaryRange[0] > 0 || salaryRange[1] < 50 ? 1 : 0) +
    (experienceRange[0] > 0 || experienceRange[1] < 35 ? 1 : 0) +
    (radiusValue !== 25 ? 1 : 0);

  return {
    filters: {
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
    },
    appliedFilters,
    applyFilters,
    setters: {
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
    },
    helpers: {
      toggleFilter,
      clearAllFilters,
      activeFiltersCount,
    },
  };
}

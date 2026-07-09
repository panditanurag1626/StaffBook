import { useState } from "react";

export interface CandidateFilters {
  searchQuery: string;
  selectedSkills: string;
  selectedExperience: string[];
  selectedAvailability: string[];
  selectedEducation: string[];
  selectedIndustry: string[];
  selectedLastActive: string;
  radiusValue: number;
  salaryRange: [number, number];
  ageRange: [number, number];
  gender: string;
  preferredShift: string;
  workStatus: string;
  employmentType: string;
  noticePeriod: string;
  hasResume: boolean | null;
  city: string;
  state: string;
  showFilters: boolean;
}

export function useCandidateFilters() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string[]>([]);
  const [selectedLastActive, setSelectedLastActive] = useState("");
  const [radiusValue, setRadiusValue] = useState(25);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 50]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [gender, setGender] = useState("");
  const [preferredShift, setPreferredShift] = useState("");
  const [workStatus, setWorkStatus] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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
    setSelectedSkills("");
    setSelectedExperience([]);
    setSelectedAvailability([]);
    setSelectedEducation([]);
    setSelectedIndustry([]);
    setSelectedLastActive("");
    setRadiusValue(25);
    setSalaryRange([0, 50]);
    setAgeRange([18, 60]);
    setGender("");
    setPreferredShift("");
    setWorkStatus("");
    setEmploymentType("");
    setNoticePeriod("");
    setHasResume(null);
    setCity("");
    setState("");
  };

  const activeFiltersCount =
    (selectedSkills ? 1 : 0) +
    selectedExperience.length +
    selectedAvailability.length +
    selectedEducation.length +
    selectedIndustry.length +
    (searchQuery ? 1 : 0) +
    (selectedLastActive ? 1 : 0) +
    (radiusValue !== 25 ? 1 : 0) +
    (salaryRange[0] > 0 || salaryRange[1] < 50 ? 1 : 0) +
    (ageRange[0] > 18 || ageRange[1] < 60 ? 1 : 0) +
    (gender ? 1 : 0) +
    (preferredShift ? 1 : 0) +
    (workStatus ? 1 : 0) +
    (employmentType ? 1 : 0) +
    (noticePeriod ? 1 : 0) +
    (hasResume !== null ? 1 : 0) +
    (city ? 1 : 0) +
    (state ? 1 : 0);

  return {
    filters: {
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
    },
    setters: {
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
    },
    helpers: {
      toggleFilter,
      clearAllFilters,
      activeFiltersCount,
    },
  };
}




export interface FilterOption {
  label: string;
  value: string;
  placeholder?: string;
  type: "input" | "dropdown" | "slider";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const jobFilters: FilterOption[] = [
  {
    label: "Job Title",
    value: "jobTitle",
    placeholder: "Enter Skills or company name",
    type: "input",
  },
  {
    label: "Location",
    value: "location",
    placeholder: "All Location",
    type: "dropdown",
    options: [
      { label: "All Location", value: "all" },
      { label: "Mumbai", value: "mumbai" },
      { label: "Delhi", value: "delhi" },
      { label: "Bangalore", value: "bangalore" },
      { label: "Remote", value: "remote" },
    ],
  },
  {
    label: "Categorise",
    value: "category",
    placeholder: "Select Categories",
    type: "dropdown",
    options: [
      { label: "Select Categories", value: "" },
      { label: "Technology", value: "technology" },
      { label: "Healthcare", value: "healthcare" },
      { label: "Finance", value: "finance" },
      { label: "Education", value: "education" },
    ],
  },
  {
    label: "Job Types",
    value: "jobType",
    placeholder: "Job Type",
    type: "dropdown",
    options: [
      { label: "Job Type", value: "" },
      { label: "Full-time", value: "full-time" },
      { label: "Part-time", value: "part-time" },
      { label: "Contract", value: "contract" },
      { label: "Internship", value: "internship" },
    ],
  },
  {
    label: "Map Location",
    value: "mapLocation",
    placeholder: "City or Postcode",
    type: "input",
  },
  {
    label: "Radius",
    value: "radius",
    type: "slider",
    min: 0,
    max: 100,
    step: 5,
    unit: "kms",
  },
  {
    label: "Salary",
    value: "salary",
    type: "slider",
    min: 0,
    max: 100000,
    step: 1000,
    unit: "$",
  },
  {
    label: "Industry",
    value: "industry",
    placeholder: "Industry",
    type: "dropdown",
    options: [
      { label: "Industry", value: "" },
      { label: "Technology", value: "technology" },
      { label: "Healthcare", value: "healthcare" },
      { label: "Finance", value: "finance" },
      { label: "Education", value: "education" },
    ],
  },
  {
    label: "Career Level",
    value: "careerLevel",
    placeholder: "Career Level",
    type: "dropdown",
    options: [
      { label: "Career Level", value: "" },
      { label: "Entry Level", value: "entry" },
      { label: "Mid Level", value: "mid" },
      { label: "Senior Level", value: "senior" },
      { label: "Executive", value: "executive" },
    ],
  },
  {
    label: "Experience",
    value: "experience",
    placeholder: "Experience",
    type: "dropdown",
    options: [
      { label: "Experience", value: "" },
      { label: "0-1 years", value: "0-1" },
      { label: "1-3 years", value: "1-3" },
      { label: "3-5 years", value: "3-5" },
      { label: "5+ years", value: "5+" },
    ],
  },
  {
    label: "Distance",
    value: "distance",
    placeholder: "Distance",
    type: "dropdown",
    options: [
      { label: "Within 5 km", value: "5" },
      { label: "Within 10 km", value: "10" },
      { label: "Within 25 km", value: "25" },
      { label: "Within 50 km", value: "50" },
      { label: "Within 100 km", value: "100" },
    ],
  },
];

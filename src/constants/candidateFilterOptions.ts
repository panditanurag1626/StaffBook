export const CANDIDATE_FILTER_OPTIONS = {
  locations: ["Bangalore", "Mumbai", "Hyderabad", "Pune", "Chennai", "Delhi", "Gurgaon", "Noida"],
  skills: ["React", "JavaScript", "Python", "Java", "Node.js", "AWS", "Docker", "TypeScript", "Angular", "Vue.js", "UI/UX Design", "Product Management"],
  experienceLevels: ["Fresher", "1-3 Years", "3-5 Years", "5-10 Years", "10+ Years"],
  availability: ["Immediate", "15 Days", "1 Month", "2 Months", "3 Months"],
  education: ["Bachelor's", "Master's", "PhD", "Certification"],
  industry: ["Technology", "E-commerce", "IT Services", "Finance", "Healthcare", "Education"],
  lastActive: [
    { label: "Active Today", value: "today" },
    { label: "Last 3 Days", value: "3d" },
    { label: "Last Week", value: "1w" },
    { label: "Last Month", value: "1m" },
    { label: "Any time", value: "any" }
  ],
  gender: ["Male", "Female", "Other"],
  preferredShift: ["Day", "Night", "Flexible"],
  workStatus: ["Actively looking", "Open to offers", "Not looking"],
  employmentType: ["Full-time", "Part-time", "Contract", "Freelance"],
  connectionFilter: [
    { label: "Not Connected", value: "not_connected" },
    { label: "Connected", value: "connected" }
  ],
  sortBy: [
    { label: "Experience", value: "experience" },
    { label: "Salary", value: "salary" },
    { label: "Match Score", value: "match_score" },
    { label: "Distance", value: "distance" }
  ],
  sortOrder: [
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" }
  ]
};


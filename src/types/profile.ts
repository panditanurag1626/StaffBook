export interface PersonalInfo {
  personal: string;
  dob: string;
  category: string;
  workPermit: string;
  address: string;
  gender: string;
  maritalStatus: string;
  languages: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

// resumeFile: string 

export interface BasicDetails {
  preferredRole: string;
  preferredLocation: string;
  email: string;
  workEmail: string;
  personalContact: string;
  workContact?: string;
  preferredSalary?: string;
  preferredShift?: string;
  jobType?: string;
  workStatus?: string;
  experience?: string;
  currentSalary?: string;
  noticePeriod?: string;
  linkedin_profile?: string;
}


export interface Experience {
  companyLogo: string;
  companyLogoFile?: File;
  role: string;
  company: string;
  location: string;
  employmentType: string;
  isCurrent: boolean;
  joiningYear: string;
  joiningMonth: string;
  leavingYear?: string;
  leavingMonth?: string;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  institution: string;
  course: string;
  specialization: string;
  courseType: string;
  startYear: string;
  endYear: string;
  is_pursuing?: number;
  grade: string;
  degree: string;
  location: string;
  duration: string;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Project {
  id?: number;
  title: string;
  role: string;
  startYear: string;
  startMonth: string;
  endYear?: string;
  endMonth?: string;
  isOngoing?: boolean;
  description: string;
  achievements: string[];
  skills: string[];
  softwares: string[];
  link: string;
  githubLink?: string;
  duration?: string;
}

export interface Certification {
  id?: number;
  name: string;
  role: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
  description: string;
  skills: string[];
  credentialId: string;
  url: string;
  institution: string;
  location: string;
  issued: string;
  expires: string;
  credentialIdOld: string;
  descriptionOld: string;
  urlOld: string;
}

export interface ProfileCompletion {
  label: string;
  skill: string;
  percent: number;
  helper: string;
}

export interface ProfilePerformanceStat {
  label: string;
  value: number;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
} 
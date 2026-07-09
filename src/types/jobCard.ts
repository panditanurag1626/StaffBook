export interface JobCard {
  company: string;
  logo: string;
  role: string;
  tags: string[];
  location: string;
  salary: string;
  distance?: string;
  position: { top?: string; left?: string; bottom?: string; right?: string };
} 
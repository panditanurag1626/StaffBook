export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  education: string;
  image: string;
  lastActive: string;
  isOnline?: boolean;
  distance_display?: string;
  company?: string;
  email?: string;
  phone?: string;
  salary?: string;
  views?: number;
  mediaCount?: number;
  hasReel?: boolean;
  resumeUrl?: string;
  coverLetter?: string;
  screeningAnswers?: Array<{ question: string; answer: string }>;
  appliedAt?: string;
  status?: string;
  matchScore?: number
  userId?: string
  is_premium?: boolean
  is_invited?: boolean
  invite?: {
    is_invited: boolean;
    invite_id?: number | null;
    job_post_id?: number | null;
    status?: string | null;
    status_text?: string | null;
    status_badge?: string | null;
    sent_at?: string | null;
    viewed_at?: string | null;
    responded_at?: string | null;
  } | null;
  user_mode_type?: string | null
  lat?: number
  lng?: number
  timeline?: Array<{
    status_code: number;
    status_text: string;
    is_completed: boolean;
    is_current: boolean;
    is_pending: boolean;
    event_date_relative?: string | null;
    event_date_formatted?: string | null;
    notes?: string | null;
  }>;
}



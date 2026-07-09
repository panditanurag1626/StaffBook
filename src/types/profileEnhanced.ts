// Enhanced Profile Types for LinkedIn + Naukri.com Mixed Features

export interface ProfileMetrics {
  profileViews: number;
  searchAppearances: number;
  profileStrength: number;
  completionPercentage: number;
  industryRanking: number;
}

export interface VisibilityInsights {
  weeklyViews: number[];
  topSearchKeywords: string[];
  viewerIndustries: { industry: string; count: number }[];
  profileOptimizationTips: string[];
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'viewed' | 'interview' | 'rejected' | 'offered';
  appliedDate: Date;
  lastUpdate: Date;
  location: string;
  salary: string;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  salary: string;
  isBookmarked: boolean;
  postedDate: Date;
  description: string;
}

export interface Connection {
  id: string;
  name: string;
  title: string;
  company: string;
  profileImage: string;
  connectionDate: Date;
  mutualConnections: number;
  isOnline: boolean;
}

export interface ProfileVisitor {
  id: string;
  name: string;
  title: string;
  company: string;
  visitDate: Date;
  isRecruiter: boolean;
  profileImage: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderTitle: string;
  subject: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  type: 'recruiter' | 'network' | 'interview';
  senderImage: string;
}

export interface SkillAssessment {
  id: string;
  skillName: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score: number;
  completedDate: Date;
  certificateUrl?: string;
}

export interface CareerRecommendation {
  id: string;
  type: 'course' | 'certification' | 'skill' | 'job_role';
  title: string;
  description: string;
  provider: string;
  duration: string;
  rating: number;
  isBookmarked: boolean;
}

export interface ResumeVersion {
  id: string;
  name: string;
  uploadDate: Date;
  downloadCount: number;
  viewCount: number;
  fileUrl: string;
  isActive: boolean;
}

export interface RecruiterInsight {
  id: string;
  recruiterName: string;
  company: string;
  searchKeywords: string[];
  interestLevel: 'low' | 'medium' | 'high';
  contactAttempts: number;
  lastActivity: Date;
  profileImage: string;
}

export interface Notification {
  id: string;
  type: 'job_match' | 'profile_view' | 'message' | 'connection' | 'interview' | 'application_update';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export interface EnhancedCardItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  route: string;
  color: string;
  isNew?: boolean;
}

export interface ProfileAnalytics {
  metrics: ProfileMetrics;
  insights: VisibilityInsights;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

export interface JobManagement {
  applications: JobApplication[];
  recommendations: JobRecommendation[];
  savedJobs: JobRecommendation[];
  applicationStats: {
    totalApplied: number;
    responseRate: number;
    interviewRate: number;
  };
}

export interface NetworkManagement {
  connections: Connection[];
  visitors: ProfileVisitor[];
  connectionRequests: Connection[];
  networkStats: {
    totalConnections: number;
    weeklyGrowth: number;
    industryBreakdown: { industry: string; count: number }[];
  };
}
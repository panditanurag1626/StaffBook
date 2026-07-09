export interface ConnectionRequest {
  id: string;
  name: string;
  avatar: string;
  title: string;
  mutualConnections: number;
  timestamp: string;
  distance_display?: string;
  mutual_count?: number;
}

export interface Connection {
  id: string;
  name: string;
  picture?: string;
  avatar?: string;
  title: string;
  company?: string;
  mutualConnections: number;
  isFollowing?: boolean;
  connectedDate?: string;
  distance_display?: string;
  email?: string;
  media?: any
}

export interface PeopleYouMayKnow {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company?: string;
  mutualConnections?: number;
  mutual_count?: number;
  distance_display?: string;
  reason?: string;
  media?: any
}

export const connectionRequests: ConnectionRequest[] = [
  {
    id: 'req-1',
    name: 'Priya Sharma',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Senior Product Manager at Google',
    mutualConnections: 12,
    timestamp: '2 days ago',
  },
  {
    id: 'req-2',
    name: 'Rahul Verma',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Full Stack Developer at Microsoft',
    mutualConnections: 8,
    timestamp: '3 days ago',
  },
  {
    id: 'req-3',
    name: 'Anjali Mehta',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'UX Designer at Amazon',
    mutualConnections: 15,
    timestamp: '5 days ago',
  },
  {
    id: 'req-4',
    name: 'Vikram Singh',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Data Scientist at Meta',
    mutualConnections: 6,
    timestamp: '1 week ago',
  },
];

export const myConnections: Connection[] = [
  {
    id: 'conn-1',
    name: 'Riya Goyal',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'HR Manager',
    company: 'appxone.com',
    mutualConnections: 45,
    isFollowing: true,
    connectedDate: 'October 30, 2025',
  },
  {
    id: 'conn-2',
    name: 'Amit Kumar',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Software Engineer',
    company: 'Tech Solutions Inc',
    mutualConnections: 23,
    isFollowing: true,
    connectedDate: 'October 29, 2025',
  },
  {
    id: 'conn-3',
    name: 'Neha Patel',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Marketing Director',
    company: 'Digital World',
    mutualConnections: 67,
    isFollowing: false,
    connectedDate: 'October 29, 2025',
  },
  {
    id: 'conn-4',
    name: 'Karan Malhotra',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Product Designer',
    company: 'Creative Studios',
    mutualConnections: 34,
    isFollowing: true,
    connectedDate: 'October 28, 2025',
  },
  {
    id: 'conn-5',
    name: 'Pooja Reddy',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Business Analyst',
    company: 'Finance Corp',
    mutualConnections: 28,
    isFollowing: false,
    connectedDate: 'October 27, 2025',
  },
  {
    id: 'conn-6',
    name: 'Arjun Nair',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'DevOps Engineer',
    company: 'Cloud Systems',
    mutualConnections: 41,
    isFollowing: true,
    connectedDate: 'October 26, 2025',
  },
];

export const peopleYouMayKnow: PeopleYouMayKnow[] = [
  {
    id: 'sugg-1',
    name: 'Sneha Gupta',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Frontend Developer',
    company: 'Web Innovations',
    mutualConnections: 18,
    reason: 'Works at Web Innovations',
  },
  {
    id: 'sugg-2',
    name: 'Rohit Sharma',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Sales Manager',
    company: 'Global Trade',
    mutualConnections: 9,
    reason: 'You both know Riya Goyal',
  },
  {
    id: 'sugg-3',
    name: 'Divya Iyer',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Content Writer',
    company: 'Creative Content',
    mutualConnections: 14,
    reason: 'Works in your industry',
  },
  {
    id: 'sugg-4',
    name: 'Manish Tiwari',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Backend Developer',
    company: 'Tech Giants',
    mutualConnections: 22,
    reason: 'You both know Amit Kumar',
  },
  {
    id: 'sugg-5',
    name: 'Kavya Reddy',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'HR Specialist',
    company: 'People First',
    mutualConnections: 11,
    reason: 'Works at People First',
  },
  {
    id: 'sugg-6',
    name: 'Sanjay Pillai',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Project Manager',
    company: 'Agile Solutions',
    mutualConnections: 16,
    reason: 'Studied at IIT Delhi',
  },
];

export const sentRequests: Connection[] = [
  {
    id: 'sent-1',
    name: 'Meera Krishnan',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Engineering Manager',
    company: 'Tech Startups Inc',
    mutualConnections: 7,
  },
  {
    id: 'sent-2',
    name: 'Aditya Joshi',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Product Owner',
    company: 'Innovation Labs',
    mutualConnections: 13,
  },
  {
    id: 'sent-3',
    name: 'Simran Kaur',
    avatar: '/images/user_profile_placeholder.jpeg',
    title: 'Data Analyst',
    company: 'Analytics Pro',
    mutualConnections: 5,
  },
];


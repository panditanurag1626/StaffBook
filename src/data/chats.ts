export interface Chat {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  participantId?: string;
  timestamp?: number;
  isNewUser?: boolean;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
  isRead?: boolean;
}

export const mockChats: Chat[] = [
  {
    id: '1',
    name: 'John Doee',
    role: 'Software engg',
    avatar: '/images/user_profile_placeholder.jpeg',
    lastMessage: 'Is there any opening for UI/UX designer position',
    lastMessageTime: '11:11 PM',
    unreadCount: 0,
  },
  {
    id: '2',
    name: 'John Doee',
    role: 'Software engg',
    avatar: '/images/user_profile_placeholder.jpeg',
    lastMessage: 'Thanks for the opportunity',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
  },
  {
    id: '3',
    name: 'John Doee',
    role: 'Software engg',
    avatar: '/images/user_profile_placeholder.jpeg',
    lastMessage: 'When can I expect the interview?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: '4',
    name: 'John Doee',
    role: 'Software engg',
    avatar: '/images/user_profile_placeholder.jpeg',
    lastMessage: 'I have sent my resume',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
  },
  {
    id: '5',
    name: 'John Doee',
    role: 'Software engg',
    avatar: '/images/user_profile_placeholder.jpeg',
    lastMessage: 'Looking forward to working with you',
    lastMessageTime: '1 week ago',
    unreadCount: 0,
  },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      sender: 'John Doee',
      text: 'Is there any opening for UI/UX designer position',
      time: '11:11 PM',
      isOwn: false,
      isRead: true,
    },
    {
      id: '2',
      sender: 'You',
      text: 'Yes, there is. Please check the job posting below',
      time: '11:11 PM',
      isOwn: true,
      isRead: true,
    },
    {
      id: '3',
      sender: 'You',
      text: 'This is the link. Please click on the link below. Jhsdfk jbsdjhvld sjvjdnvlj dfhvkdsh lkvnsdal kflkdn',
      time: '11:11 PM',
      isOwn: true,
      isRead: true,
    },
    {
      id: '4',
      sender: 'John Doee',
      text: 'Oh, Thanks a lot',
      time: '11:11 PM',
      isOwn: false,
      isRead: true,
    },
  ],
}; 
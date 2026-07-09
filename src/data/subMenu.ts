import { Briefcase, Home, MessageSquare, Search, User, Save, Bell, Monitor } from 'lucide-react';


export const menuItems = [
  { icon: Briefcase, label: 'Get Hired', href: '/gethire' },
  { icon: User, label: 'Hire', href: '/hire' },
  { icon: MessageSquare, label: 'Live Chat', href: '/livechat' },
  { icon: Save, label: 'Saved Jobs', href: '/saved-jobs' },
  { icon: Bell, label: 'Subscribe', href: '/subscribe' },
  { icon: Monitor, label: 'Ads', href: '/ads' },
];

export const inputLabels = [
  'Job Title/ Role',
  'Skills',
  'Experience',
  'Company',
  'Location',
  'Date Posted',
]; 
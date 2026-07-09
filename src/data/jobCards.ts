import { JobCard } from '../types/jobCard';

export const jobCards: JobCard[] = [
  {
    company: 'Myntra',
    logo: '/homePage/myntra.png',
    role: 'Marketing Executive',
    tags: ['Design', 'Full Time'],
    location: 'Norway, EU',
    salary: '$100K~120K',
    position: { top: '10%', right: '10%' },
  },
  {
    company: 'Microsoft',
    logo: '/homePage/microsoft.png',
    role: 'UI/UX Designer',
    tags: ['Design', 'Full Time'],
    location: 'New York, US',
    salary: '$100K~120K',
    position: { top: '35%', left: '15%' },
  },
  {
    company: 'Webflow',
    logo: '/homePage/webflow.png',
    role: 'Software Engineer',
    tags: ['Finance', 'Full Time'],
    location: 'New Delhi, India',
    salary: '$100K~120K',
    position: { top: '55%', left: '40%' },
  },
]; 
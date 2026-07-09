export interface JobListing {
  id: string;
  company: string;
  title: string;
  tags: string[];
  location: string;
  postedDate: string;
  salary: string;
  recruiter: {
    name: string;
    avatar: string;
  };
  isBookmarked: boolean;
}

export const jobListings: JobListing[] = [
  {
    id: '1',
    company: 'It & Networking',
    title: 'Full Stack Developer',
    tags: ['Remote', 'Internship'],
    location: 'Mumbai',
    postedDate: 'May 14, 2025',
    salary: '3000-55000 / Month',
    recruiter: {
      name: 'Alex Jue',
      avatar: '/avatars/alex.jpg'
    },
    isBookmarked: false
  },
  {
    id: '2',
    company: 'It & Networking',
    title: 'Full Stack Developer',
    tags: ['Remote', 'Internship'],
    location: 'Mumbai',
    postedDate: 'May 14, 2025',
    salary: '3000-55000 / Month',
    recruiter: {
      name: 'Alex Jue',
      avatar: '/avatars/alex.jpg'
    },
    isBookmarked: true
  },
  {
    id: '3',
    company: 'It & Networking',
    title: 'Full Stack Developer',
    tags: ['Remote', 'Internship'],
    location: 'Mumbai',
    postedDate: 'May 14, 2025',
    salary: '3000-55000 / Month',
    recruiter: {
      name: 'Alex Jue',
      avatar: '/avatars/alex.jpg'
    },
    isBookmarked: false
  },
  {
    id: '4',
    company: 'It & Networking',
    title: 'Full Stack Developer',
    tags: ['Remote', 'Internship'],
    location: 'Mumbai',
    postedDate: 'May 14, 2025',
    salary: '3000-55000 / Month',
    recruiter: {
      name: 'Alex Jue',
      avatar: '/avatars/alex.jpg'
    },
    isBookmarked: true
  },
  {
    id: '5',
    company: 'It & Networking',
    title: 'Full Stack Developer',
    tags: ['Remote', 'Internship'],
    location: 'Mumbai',
    postedDate: 'May 14, 2025',
    salary: '3000-55000 / Month',
    recruiter: {
      name: 'Alex Jue',
      avatar: '/avatars/alex.jpg'
    },
    isBookmarked: false
  },
  {
    id: '6',
    company: 'It & Networking',
    title: 'Full Stack Developer',
    tags: ['Remote', 'Internship'],
    location: 'Mumbai',
    postedDate: 'May 14, 2025',
    salary: '3000-55000 / Month',
    recruiter: {
      name: 'Alex Jue',
      avatar: '/avatars/alex.jpg'
    },
    isBookmarked: false
  },
  {
    id: '7',
    company: 'It & Networking',
    title: 'Full Stack Developer',
    tags: ['Remote', 'Internship'],
    location: 'Mumbai',
    postedDate: 'May 14, 2025',
    salary: '3000-55000 / Month',
    recruiter: {
      name: 'Alex Jue',
      avatar: '/avatars/alex.jpg'
    },
    isBookmarked: true
  },
  {
    id: '8',
    company: 'It & Networking',
    title: 'Full Stack Developer',
    tags: ['Remote', 'Internship'],
    location: 'Mumbai',
    postedDate: 'May 14, 2025',
    salary: '3000-55000 / Month',
    recruiter: {
      name: 'Alex Jue',
      avatar: '/avatars/alex.jpg'
    },
    isBookmarked: false
  }
]; 
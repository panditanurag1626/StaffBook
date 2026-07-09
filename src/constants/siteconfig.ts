export const SITE_CONFIG = {
  name: 'Staff Book',
  homepage: {
    heroTitle: 'India First AI-Powered Job Portal with Real-Time Hiring Near You.',
    heroHighlight: 'Job Portal',
    heroSubtitle: 'Real-Time Hiring Near You.',
    companiesTitle: 'Top companies Hiring',
    premiumTitle: 'Unlock Premium Access',
    premiumSubtitle: 'Get exclusive features and enhanced visibility with our premium membership.',
    resumeTitleGradient: 'ATS-Friendly',
    resumeTitleRest: 'Resume Builder',
    resumeSubtitle: 'Create a professional, Applicant Tracking System (ATS)-friendly CV that increases your chances of getting shortlisted.',
    liveChatTitle: 'Live Chat with Recruiters',
    liveChatSubtitle: 'Connect instantly with recruiters for quicker hiring decisions.',
    postJobTitle: 'Post a Job and Hire faster',
    postJobSubtitle: 'Post jobs and find suitable candidates quickly.',
    exploreNow: 'Explore Now',
    seeAll: 'See All',
    newsTitle: 'Professional media and industry news',
    newsDescription: 'Stay updated with the latest trends, updates, and news shared by industry experts.',
    connectionTitle: 'Nurture your professional relationships with industry experts',
  },
  services: {
    recruiterPlans: {
      title: 'Plans for Employers',
      plans: [
        {
          title: 'Starter',
          features: [
            'Launch offer for 15 days',
            'Job posting - Unlimited',
            'Live chat - Unlimited',
            'Searching NearBy Range',
            'Candidates - 25-50kms',
            'Networking - 25-50kms'
          ],
          price: '₹666 Free',
          image: '/homePage/professional.png',
          popular: true
        },
        {
          title: 'Growth',
          features: [
            'Launch offer for 15 days',
            'Job posting - Unlimited',
            'Live chat - Unlimited',
            'Searching NearBy Range',
            'Candidates - 10-50kms',
            'Networking - 10-50kms',
            'Reach Candidates',
            'Show Contact - 20',
            'Send Invite - 30',
            'Schedule Meeting - 5',
            'Email - 50',
            'Download CV - 20',
            'Ad Banners',
            'Slider banners - 1month'
          ],
          price: '₹2000 999/ month',
          image: '/homePage/premium.png',
          popular: true
        },
        {
          title: 'Enterprise',
          features: [
            'Launch offer for 15 days',
            'Job posting - Unlimited',
            'Live chat - Unlimited',
            'Searching NearBy Range',
            'Candidates - 0-50kms',
            'Networking - 0-50kms',
            'Reach Candidates',
            'Show Contact - 20',
            'Send Invite - 30',
            'Schedule Meeting - 5',
            'Email - 50',
            'Download CV - 20',
            'Bulk Hiring Mode',
            'Bulk Download - Included',
            'Bulk Actions - Included',
            'Ad Banners',
            'Bottom page banner - 3months',
            'Slider banners - 3months'
          ],
          price: '₹8000 4000/ month',
          image: '/homePage/premium (2).png',
          popular: true
        }
      ]
    },
    jobSeekerPlans: {
      title: 'Plans for Job Seekers',
      plans: [
        {
          title: 'Starter',
          features: [
            'Launch offer for 15 days',
            'Live chat - Unlimited',
            'Searching NearBy Range',
            'Employers - 25-50kms',
            'Networking - 25-50kms',
            'Reach Employers',
            'Send Invite - 5',
            'Show Contact - 2',
            'Schedule Meeting - 1',
            'Emails - 7'
          ],
          price: '₹666 Free',
          image: '/images/dummy.png',
          popular: true
        },
        {
          title: 'Growth',
          features: [
            'Launch offer for 15 days',
            'Live chat - Unlimited',
            'Searching NearBy Range',
            'Employers - 0-50kms',
            'Networking - 0-50kms',
            'Reach Employers',
            'Send Invite - 10',
            'Show Contact - 5',
            'Schedule Meeting - 2',
            'Email - 20',
            'Search Appears',
            'Recommended section - Top results'
          ],
          price: '₹1500 ₹300',
          image: '/homePage/priority.png',
          popular: true
        },
        {
          title: 'Enterprise',
          features: [
            'Launch offer for 15 days',
            'Live chat - Unlimited',
            'Searching NearBy Range',
            'Employers - 0-50kms',
            'Networking - 0-50kms',
            'Reach Employers',
            'Send Invite - 10',
            'Show Contact - 5',
            'Schedule Meeting - 2',
            'Email - 20',
            'Search Appears',
            'Recommended section - Top results',
            'Portfolio Management',
            'ATS friendly resume - Included',
            'Premium designs - Included'
          ],
          price: '₹1750 ₹350',
          image: '/homePage/atsresume.jpg',
          popular: true
        }
      ]
    },
    additionalPlans: {
      plans: []
    },
    resumeWriting: {
      title: 'Need help with Resume Writing?',
      subtitle: 'Standout from the crowd with our professionally written Resume by expert.',
      features: [
        'Feature 1',
        'Feature 1',
        'Feature 1',
        'Feature 1'
      ],
      price: 'Rs. 300 only',
      image: '/images/resume_accepted.svg'
    },
    contactUs: {
      title: 'Contact Us',
      form: {
        name: 'Name',
        email: 'Email ID',
        phone: 'Phone no.',
        query: 'Your Query',
        button: 'Call Me Back'
      },
      image: '/homePage/chat1.png'
    }
  },
  footer: {
    tagline: 'Nearby Jobs, Live Chat with Recruiters & Networking',
    policies: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Location Policy', href: '/location-policy' },
      { label: 'Branding Policy', href: '/branding-policy' },
      { label: 'Fraud Alert Policy', href: '/fraud-alert' },
    ],
    menu: [
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/premium-services' },
      { label: 'FAQs', href: '/faqs' },
    ],
    email: 'info@staffbook.in',
    phone: '+91 9009222192',
    social: {
      facebook: 'https://www.facebook.com/STAFFB00k.in',
      instagram: 'https://www.instagram.com/staffbook.in/',
      linkedin: 'https://www.linkedin.com/company/staffbook-dot-in/',
      google: 'https://g.co/kgs/xESJSp',
      playstore: 'https://play.google.com/store/apps/details?id=com.app.staffbook',
    },
  },
  navbar: {
    navLinks: [
      { label: 'Jobs', href: '#' },
      { label: 'Networking', href: '#' },
      { label: 'Connections', href: '#' },
      { label: 'Services', href: '/premium-services' },
    ],
    signUp: 'Sign up',
  },
  subMenu: {
    inputPlaceholder: 'Enter preferred Role',
  },
  featuredJobsSection: {
    title: 'Featured Jobs',
    seeAll: 'See All',
  },
  profileHeader: {
    preferredRole: 'Preferred Role',
    preferredSalary: 'Preferred Salary',
    preferredLocation: 'Preferred Location',
    preferredShift: 'Preferred Shift',
    jobType: 'Job Type',
    workStatus: 'Work Status',
    progressLabel: 'Profile Completion',
  },
  profileSummary: {
    section: 'Professional Summary',
  },
  savedJobs: {
    title: 'Saved Jobs',
    subtitle: 'Your saved job opportunities',
    emptyState: {
      title: 'No saved jobs yet',
      subtitle: 'Start saving jobs you\'re interested in to see them here',
      buttonText: 'Browse Jobs',
    },
  },
  networking: {
    title: 'Networking',
    subtitle: 'Connect with professionals',
    writePost: 'Write a post',
    postTypes: {
      blog: 'Blog',
      image: 'Image',
      video: 'Video',
      reel: 'Reel',
    },
    reels: {
      title: 'Reels',
      refresh: 'Refresh',
      createReel: 'Create Reel',
      uploadVideo: 'Upload Video',
      recordVideo: 'Record Video',
      addCaption: 'Add caption...',
      addHashtags: 'Add hashtags...',
      publish: 'Publish',
      cancel: 'Cancel',
    },
    suggestedForYou: 'Suggested for networking',
    connect: 'Connect',
    viewProfile: 'View Profile',
    postActions: {
      editPost: 'Edit post',
      sharePost: 'Share post',
      muteNotifications: 'Mute Notifications',
      insights: 'Insights',
      deletePost: 'Delete Post',
    },
    recruitersOnline: {
      title: 'Recruiters Online',
      viewAll: 'View all',
      chat: 'Chat',
    },
  },
  personalInfo: {
    section: 'Personal Information',
    personal: 'Personal',
    dob: 'Date of Birth',
    category: 'Cateogry',
    workPermit: 'Work Permit',
    address: 'Address',
    addMore: 'Add more details',
    gender: 'Gender',
    languages: 'Languages',
  },
  resume: {
    section: 'Resume',
    required: '*',
    upload: 'Upload Resume',
    helper: 'Upload Resume to auto fetch the details to automatically fill your profile',
  },
  skills: {
    section: 'Skills',
  },
  signup: {
    heading: 'Create your profile',
    subheading: "+Join india's no. 1 job portal",
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'Enter your full name',
    fullNameHelper: 'Enter your full name here. This will be visible to recruiters',
    emailLabel: 'Enter Email ID',
    emailPlaceholder: 'Enter your E-Mail Address',
    emailHelper: 'Enter Email ID for job updates',
    passwordLabel: 'Enter password',
    passwordPlaceholder: 'Enter new password',
    passwordHelper: 'Enter a strong password to stay protected',
    phoneLabel: 'Phone number',
    phonePlaceholder: '+91-0000000000',
    phoneHelper: 'Recruiters will reach out to you on this no.',
    workStatusLabel: 'Work Status',
    workStatusFresher: 'I am a fresher',
    workStatusFresherHelper: '(Experience might include internships)',
    workStatusExperienced: 'I am experienced',
    workStatusExperiencedHelper: '(this excludes internships)',
    resumeLabel: 'Resume',
    resumeButton: 'Upload Resume',
    resumeFileTypes: 'DOC, DOCX, PDF, RTF',
    resumeHelper: 'Maximum size of PDF 2mb',
    jobUpdatesLabel: 'Send job updates me through mail, whatsapp',
    registerButton: 'Register now',
  },
  basicDetails: {
    section: 'Basic Details',
    totalExperience: 'Total Experience',
    location: 'Location',
    currentSalary: 'Current Salary',
    noticePeriod: 'Notice Period',
    socialMedia: 'Social Media Links',
    personalEmail: 'Personal Email ID',
    workEmail: 'Work Email ID',
    personalContact: 'Personal Contact',
    workNoticePeriod: 'Notice Period',
  },
  experienceSection: {
    section: 'Work Experience',
  },
  educationSection: {
    section: 'Academic Background',
  },
  projectsSection: {
    section: 'Projects',
  },
  certificationsSection: {
    section: 'Certifications',
  },
};
export const LOGGED_IN_LINKS = [
  { label: 'Networking', href: '/networking' },
  {
    label: 'Jobs',
    href: '/profile/jobs',
    submenu: [
      {
        label: 'Job Seeking Mode',
        href: '/profile/jobs?mode=seeker',
        submenu: [
          { label: "Find Job", href: "/profile/jobs", icon: "FiBriefcase" },
          { label: 'Recruiter Invitations', href: '/profile/insights', icon: "FiEye" },
          { label: 'Career Growth', href: '/profile/development', icon: "FiTrendingUp" }
        ]
      },
      {
        label: 'Employer Mode',
        href: '/profile/jobs?mode=employer',
        submenu: [
          { label: 'Find Candidates', href: '/profile/find-candidates', icon: "FiUsers" },
          { label: 'Manage Job Posts', href: '/profile/manage-jobs', icon: "FiFileText" },
          { label: 'Candidate Interest', href: '/profile/candidate-insights', icon: "FiUserCheck" }
        ]
      },
    ]
  },
  { label: 'My Connections', href: '/connections' },
  { label: 'Services', href: '/premium-services' },
];

export const PROFILE_PERFORMANCE_TITLE = 'Profile Performance';

export const PROFILE_MODAL = {
  title: 'Profile',
  viewUpdateProfile: 'View & Update Profile',
  profilePerformance: 'Profile performance',
  lastDays: 'Last 60 days',
  whoSearchedYou: 'See who searched you',
  connections: 'Connections',
  myAccount: 'My Account',
  downloads: 'Downloads',
  exploreSubscriptions: 'Explore Subscriptions',
  settings: 'Settings',
  faqs: 'FAQ\'s',
  logOut: 'Log Out',
};
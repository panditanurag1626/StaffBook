export interface ServicePlan {
  title: string;
  features: string[];
  price: string;
  image: string;
  popular?: boolean;
  badgeText?: string;
  badgeColor?: string;
}

export interface ServiceSection {
  title: string;
  plans: ServicePlan[];
}

export interface ResumeWritingService {
  title: string;
  subtitle: string;
  features: string[];
  price: string;
  image: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  query: string;
  button: string;
}

export interface ContactUsService {
  title: string;
  form: ContactForm;
  image: string;
}

export interface ServicesConfig {
  recruiterPlans: ServiceSection;
  jobSeekerPlans: ServiceSection;
  additionalPlans: {
    plans: ServicePlan[];
  };
  resumeWriting: ResumeWritingService;
  contactUs: ContactUsService;
} 
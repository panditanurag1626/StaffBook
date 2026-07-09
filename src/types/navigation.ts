export interface NavLink {
  label: string;
  href: string;
  icon?: string;
  submenu?: NavLink[];
}

export interface SiteConfig {
  navbar: {
    navLinks: NavLink[];
    signUp: string;
  };
  // Add other config sections as needed
}

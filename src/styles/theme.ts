export const colors = {
  primary: '#a5b4fc',
  primaryLight: '#e0e7ff',
  gradient: {
    start: '#a5b4fc',
    end: '#d8b4fe',
    sky: 'from-indigo-300 to-purple-300', // Theme gradient (Centralized)
    light: 'from-purple-50 to-purple-50', // Light purple gradient
  },
  purple_text_class: 'text-custom-purple',
  purple_button: "#8200db",
  text: {
    main: 'text-gray-900', // Default for headings
    heading: 'text-gray-900',
    subheading: 'text-gray-700',
    body: 'text-gray-600',
    secondary: 'text-gray-600', // Deprecated, use body
    muted: 'text-gray-500',
    placeholder: 'placeholder-gray-500',
    link: 'text-purple-600',
  },
  border: 'border-gray-200',
  background: {
    card: 'bg-white',
    page: 'bg-[#f3f2ed]',
    input: 'bg-[#f7f7fa]',
  }
};

export const layout = {
  spacing: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
  },
  padding: {
    card: 'p-4 sm:p-5', // Standard card padding
    section: 'py-6',
  },
  radius: {
    default: 'rounded-xl',
    sm: 'rounded-lg',
    full: 'rounded-full',
  }
};

export const components = {
  card: {
    base: 'bg-white border border-gray-200 shadow-sm rounded-xl', // Clean white card
    radius: 'rounded-xl',
    padding: 'p-4 sm:p-5',
    // Composite for convenience
    default: 'bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-5',
  },
  button: {
    icon: 'w-10 sm:w-9 h-10 sm:h-9 rounded-full bg-light-bg flex items-center justify-center cursor-pointer',
    iconSmall: 'w-9 sm:w-8 h-9 sm:h-8 rounded-full bg-light-bg flex items-center justify-center cursor-pointer',
    primary: 'font-semibold py-2.5 sm:py-2 px-7 sm:px-6 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg hover:shadow-xl text-white bg-purple-700 hover:bg-purple-800 focus:ring-purple-400',
    secondary: 'bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition-colors',
    outline: 'border border-indigo-200 bg-transparent hover:bg-indigo-50 text-indigo-600 rounded-full font-semibold px-7 sm:px-6 py-2.5 sm:py-2 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors',
    success: 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg font-medium transition-colors',
    warning: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 rounded-lg font-medium transition-colors',
  },
  icon: {
    default: 'text-gray-500',
    primary: 'text-indigo-300',
    gradient: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300',
  },
  typography: {
    sectionTitle: `font-semibold text-xs sm:text-sm text-gray-700`,
    cardTitle: `font-semibold text-xs sm:text-sm text-gray-700`,
    subheading: `font-medium ${colors.text.subheading} text-sm`,
    body: `text-sm ${colors.text.body}`,
    caption: `text-xs ${colors.text.muted}`, 
    meta: `text-xs ${colors.text.muted}`,
    link: `text-sm ${colors.text.link} hover:underline`,
  },
  badge: {
    skill: 'bg-[#ede6fa] text-[#18181b] px-3 py-1 rounded-full text-sm font-medium',
  },
  input: {
    default: `w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a259e6] focus:border-transparent ${colors.background.input} ${colors.text.main} ${colors.text.placeholder} text-sm transition-all outline-none`,
    search: `w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a259e6] focus:border-transparent bg-white ${colors.text.main} ${colors.text.placeholder} text-sm transition-all outline-none`,
  },
  glass: 'bg-white/80 backdrop-blur-md border border-white/60 shadow-lg', // Restored glass effect
};

export const THEME = {
  colors,
  layout,
  components
};

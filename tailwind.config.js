module.exports = {
  theme: {
    extend: {
      animation: {
        'infinite-scroll': 'scroll 25s linear infinite',
        'infinite-scroll-reverse': 'scroll-reverse 25s linear infinite',
      },
      colors: {
        primary: '#a5b4fc',
        'gradient-start': '#a5b4fc',
        'gradient-end': '#d8b4fe',
        secondary: '#7C58E6',
        purple_button: '#8200db',
        dark: '#18192B',
        'light-bg': '#F3EFFF',
        'theme-bg-start': 'var(--theme-bg-start)',
        'theme-bg-end': 'var(--theme-bg-end)',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% - 1rem))' },
        },
        'scroll-reverse': {
          '0%': { transform: 'translateX(calc(-100% - 1rem))' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
}
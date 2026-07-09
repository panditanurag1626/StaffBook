import React from 'react';
import { THEME } from '@/styles/theme';
import { cn } from '@/lib/utils';
import { FiLoader } from 'react-icons/fi';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: THEME.components.button.primary,
      secondary: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      outline: `border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700`,
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
      success: 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
      warning: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200',
    };

    const sizes = {
      sm: 'px-4 sm:px-3 py-2 sm:py-1.5 text-sm sm:text-xs',
      md: 'px-5 sm:px-4 py-2.5 sm:py-2 text-sm',
      lg: 'px-7 sm:px-6 py-3.5 sm:py-3 text-base',
      icon: 'p-2.5 sm:p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <FiLoader className={`mr-2 h-4 w-4 animate-spin ${variant === 'outline' || variant === 'ghost' ? THEME.components.icon.primary : ''}`} />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

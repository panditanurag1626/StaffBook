import React from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { THEME } from '@/styles/theme';

interface ConnectButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'default' | 'compact' | 'minimal';
}

// Predefined button style configurations
export const CONNECT_BUTTON_STYLES = {
  default: {
    className: "h-12 sm:h-10 w-36 sm:w-32 px-6 text-sm",
    iconSize: 16,
  },
  compact: {
    // Used in PostCard and similar compact layouts
    className: "h-10 sm:h-8 w-32 sm:w-28 px-3 text-xs",
    iconSize: 14,
  },
  minimal: {
    className: "h-9 sm:h-7 w-24 sm:w-20 px-2 text-xs",
    iconSize: 12,
  }
} as const;

const ConnectButton: React.FC<ConnectButtonProps> = ({ 
  label = "Connect", 
  icon, 
  className = "", 
  variant = 'primary',
  size = 'default',
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600",
    outline: "border border-indigo-200 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-indigo-600 hover:bg-indigo-50 shadow-none hover:shadow-none"
  };

  const sizeConfig = CONNECT_BUTTON_STYLES[size];

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizeConfig.className} ${className}`}
      {...props}
    >
      {icon || <FiUserPlus size={sizeConfig.iconSize} />}
      <span>{label}</span>
    </button>
  );
};

export default ConnectButton;

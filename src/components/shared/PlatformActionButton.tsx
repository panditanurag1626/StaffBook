import React from 'react';
import { cn } from '@/lib/utils';
import { FiLoader, FiLock } from 'react-icons/fi';

interface PlatformActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
  label?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'compact' | 'minimal';
  showLabelBelow?: boolean;
  isSaved?: boolean;
  isRevealed?: boolean;
  isLocked?: boolean;
  labelClassName?: string;
}

/**
 * PlatformActionButton - A unified button component for action actions (Connect, Email, Contact, etc.)
 * 
 * Design requirements:
 * - Normal: Dark gray border and icon/text
 * - Hover: Theme gradient border and darker icon/text
 * - No solid filled backgrounds (transparent/white bg)
 */
const PlatformActionButton: React.FC<PlatformActionButtonProps> = ({
  icon: Icon,
  label,
  isLoading = false,
  size = 'md',
  showLabelBelow = false,
  isSaved = false,
  isRevealed = false,
  isLocked = false,
  labelClassName,
  className,
  disabled,
  children,
  ...props
}) => {
  const sizeConfigs = {
    sm: { button: 'h-9 sm:h-8 px-3', icon: 14, text: 'text-[11px] sm:text-[10px]' },
    md: { button: 'h-11 sm:h-10 px-4', icon: 16, text: 'text-sm sm:text-xs' },
    lg: { button: 'h-14 sm:h-12 px-6', icon: 18, text: 'text-sm' },
    compact: { button: 'h-9 sm:h-8 px-3', icon: 14, text: 'text-[11px] sm:text-[10px]' },
    minimal: { button: 'h-8 sm:h-7 px-2', icon: 12, text: 'text-[10px] sm:text-[9px]' },
  };

  const config = sizeConfigs[size as keyof typeof sizeConfigs] || sizeConfigs.md;

  // If showLabelBelow is true, it's typically a round icon button (like in Map or Candidate Cards)
  const isIconButton = showLabelBelow && !children;

  const isDisabled = disabled || isLocked;

  const buttonClasses = cn(
    "group/pab relative flex items-center justify-center transition-all duration-300 transform",
    "p-[1px] rounded-full",
    // Border color: locked → gray-300, revealed → green-400, saved → purple focus, default → gray-700
    isLocked ? "bg-gray-300" : isRevealed ? "bg-green-400" : isSaved ? "bg-purple-400" : "bg-gray-700",
    // Hover: only when not locked/disabled
    !isLocked && !disabled && "hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:scale-110 shadow-sm hover:shadow-md",
    "disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
    isIconButton ? "w-12 h-12" : config.button,
    isLocked && "cursor-not-allowed",
    className
  );

  const innerClasses = cn(
    "w-full h-full rounded-full bg-white flex items-center justify-center gap-2 px-1 transition-colors",
    !isLocked && !disabled && "group-hover/pab:bg-white/95"
  );

  const iconClasses = cn(
    "transition-all duration-300",
    isLocked ? "text-gray-300" : isRevealed ? "text-green-600" : isSaved ? "text-purple-600" : "text-gray-700"
  );

  const textClasses = cn(
    "font-bold transition-colors leading-none",
    config.text
  );

  return (
    <div className={cn("flex flex-col items-center gap-1", isIconButton ? "min-w-0 flex-1" : "w-fit shrink-0")}>
      <button
        className={buttonClasses}
        disabled={isDisabled || isLoading}
        type="button"
        {...props}
      >
        <div className={innerClasses}>
          {isLoading ? (
            <FiLoader className="animate-spin text-gray-400" size={config.icon} />
          ) : isLocked ? (
            <>
              <FiLock size={config.icon} className="text-gray-300" />
              {children ? (
                <div className={textClasses}>{children}</div>
              ) : (
                label && !showLabelBelow && <span className={cn(textClasses, "text-gray-300")}>{label}</span>
              )}
            </>
          ) : (
            <>
              {Icon && <Icon size={config.icon} className={iconClasses} fill={isSaved ? "currentColor" : "none"} />}
              {children ? (
                <div className={textClasses}>{children}</div>
              ) : (
                label && !showLabelBelow && <span className={textClasses}>{label}</span>
              )}
            </>
          )}
        </div>
      </button>
      {label && showLabelBelow && (
        <span className={cn(
            "text-[9px] font-bold uppercase tracking-normal transition-colors text-center whitespace-nowrap",
            isLocked ? "text-gray-300" : isRevealed ? "text-green-600" : "text-gray-700",
          labelClassName
        )}>
          {label}
        </span>
      )}
    </div>
  );
};

export default PlatformActionButton;

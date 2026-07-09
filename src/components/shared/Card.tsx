import React from 'react';
import { THEME } from '../../styles/theme';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Content: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Footer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  ImageContainer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
} = ({ children, className = '', hoverEffect = false, noPadding = false, ...props }) => {
  return (
    <div
      className={`
        ${THEME.components.card.base}
        ${hoverEffect ? 'hover:shadow-lg transition-all duration-300' : ''}
        ${noPadding ? 'p-0' : THEME.components.card.padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`pt-4 border-t border-gray-100 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

const CardImageContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mb-4 overflow-hidden ${THEME.layout.radius.sm} ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.ImageContainer = CardImageContainer;

export default Card;

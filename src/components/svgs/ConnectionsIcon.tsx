import React from 'react';
const ConnectionsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" {...props}>
    <circle cx="7" cy="7" r="3" fill="currentColor" />
    <circle cx="17" cy="7" r="3" fill="currentColor" />
    <rect x="2" y="15" width="10" height="6" rx="3" fill="currentColor" />
    <rect x="12" y="15" width="10" height="6" rx="3" fill="currentColor" />
  </svg>
);
export default ConnectionsIcon; 
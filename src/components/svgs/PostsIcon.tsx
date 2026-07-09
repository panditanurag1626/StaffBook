import React from 'react';
const PostsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
    <rect x="7" y="7" width="10" height="2" fill="#fff" />
    <rect x="7" y="11" width="10" height="2" fill="#fff" />
    <rect x="7" y="15" width="6" height="2" fill="#fff" />
  </svg>
);
export default PostsIcon; 
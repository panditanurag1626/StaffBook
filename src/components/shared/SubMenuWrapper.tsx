'use client';

import JobSearchBar from './SubMenu';
import MobileSubMenu from './MobileSubMenu';

export default function SubMenuWrapper() {
  return (
    <>
      {/* Desktop/Tablet Version */}
      <JobSearchBar />
      
      {/* Mobile Version */}
      <MobileSubMenu />
    </>
  );
} 
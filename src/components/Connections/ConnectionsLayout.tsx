'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Connections from './Connections';
import ConnectionsSidebar from './ConnectionsSidebar';
import { THEME } from '@/styles/theme';

const ConnectionsLayout: React.FC = () => {
  const pathname = usePathname();
  const showSidebar = !pathname.includes('/connections');
  
  return (
    <div className={`min-h-screen w-full ${THEME.colors.background.page}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className={showSidebar ? "lg:col-span-8" : "lg:col-span-12"}>
            <Connections />
          </div>
          
          {/* Right Sidebar */}
          {showSidebar && (
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                <ConnectionsSidebar />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsLayout;


'use client'
import React, { useState } from 'react';
import Networking from './Networking';
import NetworkingRightSidebar from './NetworkingRightSidebar';
import MobileMapBottomSheet from './MobileMapBottomSheet';

const NetworkingLayout: React.FC = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  return (
    <div className='pt-0'>
      {/* Mobile: Bottom sheet map modal */}
      <MobileMapBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-0 pb-30">
        {/* Main Content Area */}
        <div className="lg:col-span-8 w-full">
          <Networking onToggleSidebar={() => setIsBottomSheetOpen(true)} />
        </div>

        {/* Right Sidebar (Desktop only) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-hide">
            <NetworkingRightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkingLayout;
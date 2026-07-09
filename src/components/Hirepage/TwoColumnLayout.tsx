import React from "react";

interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function TwoColumnLayout({ left, right }: TwoColumnLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-[#f3f2ed] flex justify-center items-center px-4">
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-[1413px] items-center md:items-start">
        {/* Left Side */}
        <aside className="w-[273px]  flex-shrink-0 bg-white md:rounded-r-2xl shadow md:h-[calc(100vh-64px)]">
          {left}
        </aside>

        {/* Right Side */}
        <main className="flex-grow w-full max-w-full md:max-w-[calc(100%-273px-1rem)] px-2 sm:px-4 md:px-0">
          {right}
        </main>
      </div>
    </div>
  );
}

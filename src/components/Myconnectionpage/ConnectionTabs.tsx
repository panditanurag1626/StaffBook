"use client";

import React from "react";

interface ConnectionTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: "connection-request", label: "Connection Request" },
  { id: "my-connection", label: "My Connection" },
  { id: "sent-invitation", label: "Sent Invitation" },
  { id: "people-you-may-know", label: "People You May Know" },
];

const ConnectionTabs: React.FC<ConnectionTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === tab.id
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConnectionTabs;

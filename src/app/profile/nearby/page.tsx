"use client";

import React from "react";
import ModernNavbar from "@/components/shared/ModernNavbar";
import ModernSidebar from "@/components/shared/ModernSidebar";
import ProximityMapView from "@/components/map/ProximityMapView";

export default function NearbyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      
      <div className="flex pt-16">
        <ModernSidebar mode="seeker" />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <ProximityMapView mode="seeker" />
          </div>
        </main>
      </div>
    </div>
  );
}

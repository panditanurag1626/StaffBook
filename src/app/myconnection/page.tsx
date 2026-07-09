'use client'
import { useState } from "react";
import TwoColumnLayout from "@/components/Hirepage/TwoColumnLayout";
import ConnectionRequest from "@/components/Myconnectionpage/ConnectionRequestSection";
import ConnectionTabs from "@/components/Myconnectionpage/ConnectionTabs";
import NetworkSection from "@/components/Myconnectionpage/NetworkSection";
import MapFilterSection from "@/components/shared/MapFilterSection";
import ProfileSidebar from "@/components/shared/ProfileSidebar";
import RecruiterConnectSection from "@/components/shared/RecruiterConnectSection";
import StorySection from "@/components/shared/StorySection";

export default function Page() {
    const [activeTab, setActiveTab] = useState("connection-request");

    const renderTabContent = () => {
        switch (activeTab) {
            case "connection-request":
                return <ConnectionRequest />;
            case "my-connection":
                return (
                    <div className="p-10 bg-white rounded-xl shadow-sm text-center">
                        <h2 className="text-2xl font-bold text-gray-800">My Connections</h2>
                        <p className="text-gray-500 mt-2">You don't have any connections yet.</p>
                    </div>
                );
            case "sent-invitation":
                return (
                    <div className="p-10 bg-white rounded-xl shadow-sm text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Sent Invitations</h2>
                        <p className="text-gray-500 mt-2">You haven't sent any invitations yet.</p>
                    </div>
                );
            case "people-you-may-know":
                return (
                    <>
                        <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left"> People You may know</div>
                        <RecruiterConnectSection />
                        <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left">Connect With people who are hiring for profiles like you</div>
                        <RecruiterConnectSection />
                    </>
                );
            default:
                return <ConnectionRequest />;
        }
    };

    return(
        <>
         <TwoColumnLayout
              left={<ProfileSidebar/>}
              right={
              <div className="flex flex-col gap-4">
                  <StorySection/>
                  <ConnectionTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                  
                  {renderTabContent()}

                  {activeTab === "connection-request" && (
                    <>
                        <MapFilterSection/>
                        <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left"> People You may know</div>
                        <RecruiterConnectSection/>
                        <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left">Connect With people who are hiring for profiles like you</div>
                        <RecruiterConnectSection/>
                        <NetworkSection/>
                        <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left">Connect with people who recently reviewed your profile</div>
                        <RecruiterConnectSection/>
                    </>
                  )}
              </div>
              }
              /> 
        </>
    );
}
"use client";
import HeroAndMakesDiff from "../components/Homepage/HeroAndMakesDiff";
import CategoriesWithNews from "../components/Homepage/merge2and3";
import ExpertsSection from "../components/Homepage/connection";
import ResumeSection from "../components/Homepage/resume";
import CompanyLogoSection from "../components/Homepage/company-logo";
import CombinedChatJobSection from "../components/Homepage/liveAndchatSection";
import PremiumSection from "../components/Homepage/PremiumSection";

export default function Home() {
  return (
    <div className="bg-[#0D001A]">
      <HeroAndMakesDiff />
      <CategoriesWithNews />
      <ExpertsSection />
      <ResumeSection />
      <CompanyLogoSection />
      <CombinedChatJobSection />
      <PremiumSection />
    </div>
  );
}

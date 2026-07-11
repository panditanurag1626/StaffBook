"use client";
import HeroSection from "../components/Homepage/HeroSection";
import CompanyLogoSection from "../components/Homepage/company-logo";
import Categories from "../components/Homepage/section2";
import ResumeSection from "../components/Homepage/resume";
import PremiumSection from "../components/Homepage/PremiumSection";
import CombinedChatJobSection from "../components/Homepage/liveAndchatSection";
import ExpertsSection from "../components/Homepage/connection";

export default function RootPage() {
  return (
    <div>
      <HeroSection />
      <CompanyLogoSection />
      <Categories />
      <ResumeSection />
      <PremiumSection />
      <CombinedChatJobSection />
      <ExpertsSection />
    </div>
  );
}

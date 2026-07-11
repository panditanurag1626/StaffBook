"use client";
import HeroAndMakesDiff from "../components/Homepage/HeroAndMakesDiff";
import FeatureCards from "../components/Homepage/FeatureCards";
import JobSeekerJourney from "../components/Homepage/JobSeekerJourney";
import EmployerJourney from "../components/Homepage/EmployerJourney";
import CategoriesWithNews from "../components/Homepage/merge2and3";

export default function RootPage() {
  return (
    <div className="bg-[#0D001A]">
      <HeroAndMakesDiff />
      <FeatureCards />
      <JobSeekerJourney />
      <EmployerJourney />
      <CategoriesWithNews />
    </div>
  );
}

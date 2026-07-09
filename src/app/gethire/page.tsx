import AdBannerSection from "@/components/shared/AdBannerSection";
import FeaturedJobsSection from "@/components/shared/FeatureSection";
import MapFilterSection from "@/components/shared/MapFilterSection";
import MiniFeaturedJobCards from "@/components/shared/MiniFeatureJobCard";
import ProfileLayout from "@/components/shared/ProfileLayout";
import RecruiterConnectSection from "@/components/shared/RecruiterConnectSection";
import SearchButton from "@/components/shared/SearchButton";
import TwoBannerSection from "@/components/shared/TwoRowBannerSection";


export default function Page() {
  return (
    <>
      <ProfileLayout >
        <SearchButton />
        <div className="w-full">
          <FeaturedJobsSection width={false} />
        </div>
        <div className="w-full">
          <MiniFeaturedJobCards title=""  width={false} />
        </div>
        <AdBannerSection />
        <MapFilterSection />
        <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left">Recruiters Online</div>
        <RecruiterConnectSection />
        <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left">Recruiters according to your requirements</div>
        <RecruiterConnectSection />

        <div className="w-full">
          <FeaturedJobsSection width={false} />
        </div>
        <div className="w-full">
          <MiniFeaturedJobCards title="" width={false} />
        </div>
        <TwoBannerSection />
      </ProfileLayout>
    </>

  );
}
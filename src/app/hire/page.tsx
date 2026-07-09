import PostJobSection from "@/components/Hirepage/PostJobSection";
import ManageJobPostSection from "@/components/Hirepage/ManageJobPostSection";
import ResumeDownloadSection from "@/components/shared/ResumeDownloadSection";
import MapFilterSection from "@/components/shared/MapFilterSection";
import ProfileLayout from "@/components/shared/ProfileLayout";

export default function Page() {
    return(
        <>
            {/* <TwoColumnLayout
              left={<ProfileSidebar/>}
              right={
              <>
              <StorySection/>
              <JobSearchBar/>
               
                </>
              }
            /> */}
            <ProfileLayout >
            <PostJobSection/>
                <ManageJobPostSection/>
                <MapFilterSection/>
                <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left">Ready To Join Candidates</div>
                  <ResumeDownloadSection/>
                  <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] mb-3 font-Montserrat font-semibold text-[#18192B] text-center sm:text-left">Ready To Join Candidates</div>
                  <ResumeDownloadSection/>
            </ProfileLayout>
        </>
    );
}
'use client'
import TwoColumnLayout from "@/components/Hirepage/TwoColumnLayout";
import JobFormSection from "@/components/Jobformpage/JobFormSection";
import ProfileSidebar from "@/components/shared/ProfileSidebar";
import StorySection from "@/components/shared/StorySection";
import JobSearchBar from "@/components/shared/SubMenu";

export default function Page() {
    return (
        <>
            <TwoColumnLayout
                left={<ProfileSidebar />}
                right={
                    <>
                        <JobSearchBar />
                        <JobFormSection />
                    </>
                }
            />
        </>
    );
}
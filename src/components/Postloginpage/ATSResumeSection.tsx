import Image from "next/image";

export default function ATSResumeSection() {
  return (
    <section className="w-full flex justify-center py-8 px-2 bg-[#f6f6f8]">
      <div className="bg-white rounded-2xl shadow flex flex-col md:flex-row items-center md:items-stretch w-full max-w-[1232px] min-h-[515px] p-6 md:p-12">
        {/* Left Side */}
        <div className="flex-1 flex flex-col justify-center md:pl-8 md:pr-4 mb-8 md:mb-0">
          <h2 className="text-[32px] text-[#101022] md:text-[40px] font-bold mb-4">
          <span className="bg-gradient-to-r from-primary to-[#9D13B0] bg-clip-text text-transparent">
           ATS-Friendly</span> Resume Builder
          </h2>
          <p className="text-[18px] md:text-[24px] text-[#222] mb-8 max-w-[500px]">
            Create a professional, Applicant Tracking System (ATS)-friendly CV that increases your chances of getting shortlisted.
          </p>
          <button className="w-full mt-8 max-w-[442px] h-[56px] md:h-[68px] bg-gradient-to-r from-[#5b5be7] to-[#b14be4] text-white text-[18px] md:text-[20px] font-semibold rounded-full shadow transition hover:scale-105">
            Build Resume Now!
          </button>
        </div>
        {/* Right Side */}
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/homePage/ats.png"
            alt="ATS Resume Illustration"
            width={322}
            height={371}
            style={{ width: 'auto', height: 'auto' }}
            className="w-[180px] md:w-[322px] object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
} 
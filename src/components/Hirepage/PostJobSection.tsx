import React from "react";
import { THEME } from "@/styles/theme";

const PostJobSection = () => {
  return (
    <div className="w-full mt-0 px-[1rem] md:px-[1.5rem] lg:px-0 max-w-[71.25rem] mx-auto flex flex-col items-center">
      {/* Background image container */}
      <div
        className="relative w-full max-w-[52.25rem] h-[17.5rem] xs:h-[20rem] sm:h-[22.5rem] md:h-[25rem] lg:h-[27rem] rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden flex items-end"
        style={{
          backgroundImage: 'url("/homePage/post-job-cover.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* White overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`w-full h-full bg-gradient-to-br ${THEME.colors.gradient.sky} opacity-80 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem]`} />
        </div>

        {/* Bottom section with text + button */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center px-[0.5rem] sm:px-[1rem]">
          <div className="w-full max-w-[52.25rem] h-[5.625rem] xs:h-[6.25rem] sm:h-[6.875rem] md:h-[7.625rem] bg-gradient-to-r from-orange-500 to-orange-400 rounded-[2rem] sm:rounded-[3.25rem] lg:rounded-[3.875rem] flex flex-col sm:flex-row items-center justify-between px-[1rem] sm:px-[2rem] gap-[0.75rem] sm:gap-[1.25rem]">
            {/* Text Section */}
            <div className="text-center sm:text-left">
              <p className="text-[0.625rem] xs:text-xs sm:text-sm text-white font-medium mb-[0.25rem]">
                New To Staff book?
              </p>
              {/* <p className="text-sm xs:text-base sm:text-lg md:text-2xl text-white font-bold leading-snug">
                Post a standard job for free
              </p> */}
            </div>

            {/* Button Section */}
            <button className="w-[8.75rem] cursor-pointer mb-[0.5rem] sm:w-[11.25rem] md:w-[13.75rem] h-[2.75rem] xs:h-[3.125rem] sm:h-[3.25rem] md:h-[3.875rem] bg-white text-orange-500 font-semibold rounded-full shadow-md text-[1rem] transition hover:bg-orange-50">
              Post a free job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobSection;

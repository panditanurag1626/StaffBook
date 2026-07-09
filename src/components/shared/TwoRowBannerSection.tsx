import React from "react";

const TwoBannerSection = () => {
  return (
    <section className="w-full flex justify-center py-[1rem]">
      <div className="w-full max-w-full px-[1rem]">
        <div className="flex flex-nowrap justify-between gap-[1rem] overflow-x-auto">
          {/* Banner 1 */}
          <div className="w-[33.75rem] h-[9.8125rem] rounded-[0.5rem] overflow-hidden bg-gray-100 shrink-0">
            <img
              src="/homePage/ad-banner.png"
              alt="Ad Banner 1"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Banner 2 */}
          <div className="w-[33.75rem] h-[9.8125rem] rounded-[0.5rem] overflow-hidden bg-gray-100 shrink-0">
            <img
              src="/homePage/ad-banner.png"
              alt="Ad Banner 2"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoBannerSection;

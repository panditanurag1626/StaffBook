import React from "react";

const AdBannerSection = () => {
  return (
    <section className="w-full flex justify-center py-4">
      <div
        className="w-full max-w-[68.125rem] h-[9.8125rem] px-4 sm:px-6 md:px-8 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden"
      >
        <img
          src="/homePage/ad-banner.png"
          alt="Ad Banner"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </section>
  );
};

export default AdBannerSection;

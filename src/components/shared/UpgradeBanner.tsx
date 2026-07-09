import React from 'react';

const UpgradeBanner = () => {
  return (
    <div className="w-full mt-6 mb-8">
      <div className="relative overflow-hidden rounded-[1.25rem] bg-purple-700 p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-lg">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl pointer-events-none"></div>

        <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 relative z-10">
          Find your perfect job match
        </h2>
        <p className="text-white/90 text-sm md:text-base mb-6 max-w-lg relative z-10 font-medium">
          Discover opportunities tailored to your skills and preferences
        </p>
        <button className="bg-white text-[#6C5DD3] font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 active:scale-95 relative z-10">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default UpgradeBanner;

import React from "react";

const resumes = [
  {
    name: "Ashish Malhotra",
    role: "Figma Designer",
    distance: "3.1 Km",
    experience: "6 Yrs",
    img: "/images/user_profile_placeholder.jpeg",
    isOnline: true,
  },
  {
    name: "Ashish Malhotra",
    role: "Figma Designer",
    distance: "3.1 Km",
    experience: "6 Yrs",
    img: "/images/user_profile_placeholder.jpeg",
    isOnline: false,
  },
  {
    name: "Ashish Malhotra",
    role: "Figma Designer",
    distance: "3.1 Km",
    experience: "6 Yrs",
    img: "/images/user_profile_placeholder.jpeg",
    isOnline: true,
  },
  {
    name: "Ashish Malhotra",
    role: "Figma Designer",
    distance: "3.1 Km",
    experience: "6 Yrs",
    img: "/images/user_profile_placeholder.jpeg",
    isOnline: true,
  },
];

const RecruiterConnectSection = () => {
  return (
    <section className="w-full flex justify-center py-10 bg-white">
      <div className="w-full max-w-[1140px] px-4 md:px-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {resumes.map((resume, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-[#fff] to-[#f7f7fa] rounded-[1.25rem] shadow-md w-full sm:w-[48%] lg:w-[22%] flex flex-col items-center pt-6 pb-6 h-[21.25rem]"
            >
              {/* Profile with Gradient Ring */}
              <div className="relative w-[7.25rem] h-[7.25rem] mb-4">
                <svg
                  className="absolute top-0 left-0"
                  width="116"
                  height="116"
                  viewBox="0 0 116 116"
                  fill="none"
                >
                  <path
                    d="M8 58a50 50 0 0 1 100 0"
                    stroke="url(#grad)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <defs>
                    <linearGradient
                      id="grad"
                      x1="8"
                      y1="8"
                      x2="108"
                      y2="8"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#B983FF" />
                      <stop offset="1" stopColor="#7F37C9" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner Image */}
                <div className="w-[5.75rem] h-[5.75rem] rounded-full bg-white flex items-center justify-center absolute top-[0.75rem] left-[0.75rem]">
                  <img
                    src={resume.img}
                    alt={resume.name}
                    className="w-[5.25rem] h-[5.25rem] rounded-full object-cover"
                  />

                  {/* Online Green Dot */}
                  {resume.isOnline && (
                    <div className="absolute bottom-[0.1rem] right-[0.1rem] w-[0.8rem] h-[0.8rem] bg-green-500 border-[2px] border-white rounded-full z-20"></div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-center space-y-1 mb-4">
                <div className="text-base font-bold text-[#7F37C9]">
                  {resume.name}
                </div>
                <div className="text-sm font-medium text-[#222]">
                  {resume.role}
                </div>
                <div className="text-sm font-medium text-[#8B8B8B] mt-2">
                  Distance: {resume.distance}
                </div>
                <div className="text-sm font-medium text-[#8B8B8B]">
                  Experience: {resume.experience}
                </div>
              </div>

              {/* Button */}
              <button className="mt-auto w-[12.5rem] h-[2.5rem] bg-gradient-to-r from-primary to-gradient-end text-white rounded-full text-sm font-semibold shadow hover:scale-105 transition">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecruiterConnectSection;

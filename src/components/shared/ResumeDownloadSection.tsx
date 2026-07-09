import React from "react";

const resumes = [
  {
    name: "Ashish Malhotra",
    role: "Figma Designer",
    distance: "3.1 Km",
    experience: "6 Yrs",
    img: "/images/user_profile_placeholder.jpeg",
  },
  {
    name: "Ashish Malhotra",
    role: "Figma Designer",
    distance: "3.1 Km",
    experience: "6 Yrs",
    img: "/images/user_profile_placeholder.jpeg",
  },
  {
    name: "Ashish Malhotra",
    role: "Figma Designer",
    distance: "3.1 Km",
    experience: "6 Yrs",
    img: "/images/user_profile_placeholder.jpeg",
  },
  {
    name: "Ashish Malhotra",
    role: "Figma Designer",
    distance: "3.1 Km",
    experience: "6 Yrs",
    img: "/images/user_profile_placeholder.jpeg",
  },
];

const ResumeDownloadSection = () => {
  return (
    <section className="w-full flex justify-center mb-8 py-10 bg-white">
      <div className="w-full max-w-[1140px] px-4 md:px-6">
        <div className="flex gap-6 md:gap-8 overflow-x-auto pb-4">
          {resumes.map((resume, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-[#fff] to-[#f7f7fa] rounded-[20px] shadow-md w-[280px] flex-shrink-0 flex flex-col items-center pt-6 pb-6 h-[340px]"
            >
              {/* Profile with Gradient Ring */}
              <div className="relative w-[116px] h-[116px] mb-4">
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
                <div className="w-[92px] h-[92px] rounded-full bg-white flex items-center justify-center z-10 absolute top-[12px] left-[12px]">
                  <img
                    src={resume.img}
                    alt={resume.name}
                    className="w-[84px] h-[84px] rounded-full object-cover"
                  />
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
              <button className="mt-auto w-[200px] h-[40px] bg-gradient-to-r from-primary to-gradient-end text-white rounded-full text-sm font-semibold shadow hover:scale-105 transition">
                Download Resume
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResumeDownloadSection;

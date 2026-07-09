'use client';
import { FiShare2 } from "react-icons/fi";

import React, { useRef } from "react";

const jobs = [
  {
    role: "UI/UX Designer",
    company: "Myntra",
    logo: "/homePage/google-logo.png",
    posted: "Posted 1 hour ago",
    status: "Active",
    responses: 14,
    isClosed: false,
  },
  {
    role: "UI/UX Designer",
    company: "Myntra",
    logo: "/homePage/google-logo.png",
    posted: "Posted 1 hour ago",
    status: "Closed",
    responses: 14,
    isClosed: true,
  },
  {
    role: "UI/UX Designer",
    company: "Myntra",
    logo: "/homePage/google-logo.png",
    posted: "Posted 1 hour ago",
    status: "Active",
    responses: 14,
    isClosed: false,
  },
  {
    role: "UI/UX Designer",
    company: "Myntra",
    logo: "/homePage/google-logo.png",
    posted: "Posted 1 hour ago",
    status: "Active",
    responses: 14,
    isClosed: false,
  },
  {
    role: "UI/UX Designer",
    company: "Myntra",
    logo: "/homePage/google-logo.png",
    posted: "Posted 1 hour ago",
    status: "Active",
    responses: 14,
    isClosed: false,
  },
  {
    role: "UI/UX Designer",
    company: "Myntra",
    logo: "/homePage/google-logo.png",
    posted: "Posted 1 hour ago",
    status: "Active",
    responses: 14,
    isClosed: false,
  },
];

const ManageJobPostSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  // Mouse event handlers for drag-to-scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    if (scrollRef.current) {
      scrollRef.current.classList.add("cursor-grabbing");
      startX = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft = scrollRef.current.scrollLeft;
    }
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
  };

  const handleMouseLeave = () => {
    isDown = false;
    if (scrollRef.current) scrollRef.current.classList.remove("cursor-grabbing");
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("mousemove", handleMouseMove);
  };

  const handleMouseUp = () => {
    isDown = false;
    if (scrollRef.current) scrollRef.current.classList.remove("cursor-grabbing");
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("mousemove", handleMouseMove);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="w-full flex justify-center py-8">
      <div className="w-full max-w-[71.25rem]"> {/* 1140px = 71.25rem */}
        {/* Header */}
        <div className="max-w-[68.4375rem] h-[3.875rem] p-4 flex items-center justify-between mb-4"> {/* 1095px = 68.4375rem, 62px = 3.875rem */}
          <div className="text-2xl font-Montserrat font-semibold text-[#18192B]">Manage Job Post</div>
          {/* <input
            type="text"
            placeholder="Search posts..."
            className="w-[24.875rem] h-[2.375rem] rounded-[0.5rem] border border-grey-100 px-4 text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white" // 398px = 24.875rem, 38px = 2.375rem
          /> */}
        </div>
        {/* Cards Row */}
        <div
          ref={scrollRef}
          className="w-full h-[10.625rem] flex items-start overflow-x-auto scrollbar-hide space-x-[0.625rem] cursor-grab" // 170px = 10.625rem, 10px = 0.625rem
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
        >
          {jobs.map((job, idx) => (
            <div
              key={idx}
              className="w-[17.375rem] min-w-[70vw] sm:min-w-[17.375rem] h-[10.53rem] bg-white rounded-[0.5rem] shadow-sm flex flex-col px-4 py-3" // 278px = 17.375rem, 168.5px = 10.53rem, 8px = 0.5rem
            >
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-[2.125rem] h-[2.125rem] rounded-full object-cover border-2 border-[#E5E7EB]" // 34px = 2.125rem
                  />
                  <div className="flex flex-col ml-1">
                    <span className="text-[0.875rem] font-semibold font-Montserrat text-[#18192B] leading-tight">{job.role}</span> {/* 14px = 0.875rem */}
                    <span className="text-[0.625rem] font-Montserrat text-[#8B8B8B]">{job.company}</span> {/* 10px = 0.625rem */}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Share icon */}
                  <span className="w-6 h-6 cursor-pointer flex items-center justify-center rounded-full bg-[#F3F4F6] text-[#7C3AED]">
    <FiShare2 size={16} />
  </span>
                  {/* Three dot icon */}
                  <span className="w-6 h-6 flex cursor-pointer items-center justify-center rounded-full bg-[#F3F4F6]">
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="3" cy="9" r="1.5" fill="#8B8B8B"/><circle cx="9" cy="9" r="1.5" fill="#8B8B8B"/><circle cx="15" cy="9" r="1.5" fill="#8B8B8B"/></svg>
                  </span>
                </div>
              </div>
              {/* Posted date */}
              <div className="mt-2 text-[0.625rem] font-Montserrat text-[#8B8B8B]">{job.posted}</div> {/* 10px = 0.625rem */}
              {/* Status */}
              <div className="mt-2 text-[0.875rem] font-Montserrat flex items-center gap-2"> {/* 14px = 0.875rem */}
                <span className={`w-2 h-2 rounded-full ${job.isClosed ? "bg-red-500" : "bg-green-500"}`}></span>
                <span className={job.isClosed ? "text-[#F43F5E]" : "text-[#22C55E]"}>Status: {job.isClosed ? "Closed" : "Active"}</span>
              </div>
{/* Button */}
<button
  className={`mt-2 px-3 h-[1.8125rem] text-[0.875rem] font-Montserrat font-medium rounded-[0.375rem] border
    ${job.isClosed
      ? "border-[#E5E7EB] text-[#8B8B8B] bg-[#F9FAFB] cursor-not-allowed"
      : "border-[#7C3AED] text-[#7C3AED] bg-white hover:bg-[#F3E8FF] cursor-pointer"
    } 
    whitespace-nowrap max-w-full`}
  disabled={job.isClosed}
>
  View Responses ({job.responses})
</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManageJobPostSection; 
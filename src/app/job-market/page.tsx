import React from "react";

export default function JobMarketPage() {
  return (
    <div className="min-h-screen mt-16 bg-[#f3f2ed] flex items-center justify-center">
      <div className="text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25h-13.5a2.25 2.25 0 01-2.25-2.25v-4.098M7.5 9.75h9m-9 3h9m-9-3V7.5a2.25 2.25 0 012.25-2.25h5.5a2.25 2.25 0 012.25 2.25v2.25"
          />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Job Market Page</h2>
      </div>
    </div>
  );
}

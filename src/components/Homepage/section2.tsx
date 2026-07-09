'use client'

import { categories } from '../../data/categories';
import { SITE_CONFIG } from '../../constants/siteconfig';

const Categories = () => {
  return (
    <section className="w-full px-4 md:px-8 py-16 bg-white">
      {/* Heading */}
      <div className="max-w-[1371px] w-full mx-auto text-center mb-12">
        <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-semibold text-[#101022] leading-tight">
          {SITE_CONFIG.homepage.heroTitle.split('with')[0]}
          <span className="bg-gradient-to-r from-primary to-gradient-end text-transparent bg-clip-text">Roles</span>
        </h1>
      </div>

      {/* First Row - 4 Cards */}
      <div className="max-w-[1371px] w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-5 mb-8">
        {categories.slice(0, 4).map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="h-[81px] bg-white rounded-lg px-4 md:px-6 py-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-[42px] h-[42px] bg-[#F6F6FE] rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[16px] font-medium text-[#101022]">{category.title}</h3>
                <p className="text-[14px] text-[#D9D9E2]">{category.jobs}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Second Row - 4 Cards */}
      <div className="max-w-[1371px] w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-5">
        {categories.slice(4).map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="h-[81px] bg-white rounded-lg px-4 md:px-6 py-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-[42px] h-[42px] bg-[#F6F6FE] rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[16px] font-medium text-[#101022]">{category.title}</h3>
                <p className="text-[14px] text-[#D9D9E2]">{category.jobs}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;

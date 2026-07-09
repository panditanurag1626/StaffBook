'use client'

import { firstRowLogos, secondRowLogos } from '../../data/logos';
import { SITE_CONFIG } from '../../constants/siteconfig';
import Image from 'next/image';

const CompanyLogoSection = () => {
  return (
    <section className="w-full py-16 flex flex-col items-center bg-white">
      {/* Title */}
      <h2 className="text-[48px] font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 mb-12">
        {SITE_CONFIG.homepage.companiesTitle.split(' ')[0]} <span className='text-black font-medium font-Montserrat'>{SITE_CONFIG.homepage.companiesTitle.split(' ')[1]}</span>
      </h2>
      {/* First Row */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1307px] flex flex-wrap justify-center items-center gap-15 mb-8">
          {firstRowLogos.map((logo, index) => (
            <div key={index} className="h-[42px] flex items-center">
              <Image
                src={logo}
                alt={`Company Logo ${index + 1}`}
                height={42}
                width={120}
                className="object-contain h-[42px] w-auto"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Second Row */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1307px] flex flex-wrap justify-center items-center gap-15">
          {secondRowLogos.map((logo, index) => (
            <div key={index} className="h-[42px] flex items-center">
              <Image
                src={logo}
                alt={`Company Logo ${index + 7}`}
                height={42}
                width={120}
                className="object-contain h-[42px] w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyLogoSection;

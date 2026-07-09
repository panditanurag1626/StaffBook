import Image from 'next/image';
import { SITE_CONFIG } from '../../constants/siteconfig';

export default function JobPostSection() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-12 lg:px-24 py-16 bg-[#EFF0F0] font-[Montserrat]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column - Image */}
        <div className="flex justify-center">
          <Image
          height={500}
          width={500}
            src="/homePage/job.png"
            alt="Job Card Preview"
            className="max-w-full h-auto"
          />
        </div>
        {/* Right Column - Text Content */}
        <div className="space-y-6 text-right">
          <h2 className="text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gradient-end">
              {SITE_CONFIG.homepage.postJobTitle.split(' ')[0]} {SITE_CONFIG.homepage.postJobTitle.split(' ')[1]}
            </span>{' '}
            {SITE_CONFIG.homepage.postJobTitle.split(' ').slice(2).join(' ')}
          </h2>
          <p className="text-lg text-gray-700">
            {SITE_CONFIG.homepage.postJobSubtitle}
          </p>
          <button className="bg-gradient-to-r from-primary to-gradient-end text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform">
            {SITE_CONFIG.homepage.exploreNow}
          </button>
        </div>
      </div>
    </section>
  );
}
  
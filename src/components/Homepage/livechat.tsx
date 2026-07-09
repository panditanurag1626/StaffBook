import Image from 'next/image';
import { SITE_CONFIG } from '../../constants/siteconfig';

export default function LiveChatSection() {
  return (
    <section className="w-full bg-[#EFF0F0] px-4 md:px-12 lg:px-24 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column */}
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-[28px] md:text-4xl font-bold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gradient-end">
              {SITE_CONFIG.homepage.liveChatTitle.split(' ')[0]} {SITE_CONFIG.homepage.liveChatTitle.split(' ')[1]}
            </span>{' '}
            {SITE_CONFIG.homepage.liveChatTitle.split(' ').slice(2).join(' ')}
          </h2>
          <p className="text-base md:text-lg text-gray-700">
            {SITE_CONFIG.homepage.liveChatSubtitle}
          </p>
          <div className="flex justify-center lg:justify-start">
            <button className="bg-gradient-to-r from-primary to-gradient-end text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform">
              {SITE_CONFIG.homepage.exploreNow}
            </button>
          </div>
        </div>
        {/* Right Column - Image */}
        <div className="flex justify-center">
          <Image
            height={500}
            width={500}
            src="/homePage/chat (1).png"
            alt="Live Chat UI Mockup"
            className="rounded-2xl shadow-lg w-full max-w-[400px] h-auto"
          />
        </div>
      </div>
    </section>
  );
}

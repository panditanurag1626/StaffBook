import Image from 'next/image';
import { SITE_CONFIG } from '@/constants/siteconfig';

const FooterLogo = () => {
  return (
    <div className="flex flex-col items-start gap-6 w-full">
      {/* Logo - smaller on mobile/iPad */}
      <div className="w-[140px] md:w-[160px] lg:w-[180px]">
        <Image
          src="/logo2.png"
          alt="Staff Book Logo"
          width={180}
          height={60}
          style={{ width: '100%', height: 'auto' }}
          className="object-contain"
        />
      </div>
      <span className="text-xs text-gray-500 mt-1">{SITE_CONFIG.footer.tagline}</span>
    </div>
  );
};

export default FooterLogo;

import { SITE_CONFIG } from '@/constants/siteconfig';
import FooterLogo from './footer/FooterLogo';
import FooterContact from './footer/FooterContact';

export default function Footer({ showMobile }: { showMobile?: boolean }) {
  return (
    <footer className={`${showMobile ? '' : 'hidden lg:block'} w-full bg-[#f3f2ed] border-t border-gray-200 py-16`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-8">
          {/* Column 1: Logo & Branding — full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col">
            <FooterLogo />
          </div>

          {/* Column 2: Overview / Menu */}
          <div className="flex flex-col">
            <h4 className="text-base font-bold text-gray-900 mb-6">Overview</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              {SITE_CONFIG.footer.menu.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-black transition-colors duration-200 block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="flex flex-col">
            <h4 className="text-base font-bold text-gray-900 mb-6">Policies</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              {SITE_CONFIG.footer.policies.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-black transition-colors duration-200 block"
                  >
                    {item.label} 
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact — full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col">
            <FooterContact />
          </div>
        </div>

        
      </div>
    </footer>
  );
}

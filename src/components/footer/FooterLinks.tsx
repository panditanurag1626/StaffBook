import { SITE_CONFIG } from '@/constants/siteconfig';

const FooterLinks = () => {
  return (
    <div className="flex flex-row gap-12 w-full sm:w-auto">
      {/* Policies */}
      <div className="flex-1/2 flex-row ">
        <h4 className="text-base font-bold text-gray-900 mb-4">Policies</h4>
        <ul className="space-y-3 text-sm text-gray-600">
          {SITE_CONFIG.footer.policies.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="hover:text-black transition-colors">{item.label}</a>
            </li>
          ))}
        </ul>
      </div>
      {/* Menu */}
      <div className="flex-1/2 ">
        <h4 className="text-base font-bold text-gray-900 mb-4">Menu</h4>
        <ul className="space-y-3 text-sm text-gray-600">
          {SITE_CONFIG.footer.menu.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="hover:text-black transition-colors">{item.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FooterLinks;

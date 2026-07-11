import Link from "next/link";
import { useState } from "react";
import { FiChevronDown, FiBriefcase, FiEye, FiTrendingUp, FiUsers, FiFileText, FiUserCheck } from "react-icons/fi";
import { NavLink } from "@/types/navigation";
import Button from "../shared/Button";

interface NavbarDesktopProps {
  links: NavLink[];
  currentPath: string;
  onAuthClick?: () => void;
}

const NavbarDesktop = ({ links, currentPath, onAuthClick }: NavbarDesktopProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const iconMap: { [key: string]: React.ReactNode } = {
      FiBriefcase: <FiBriefcase className="w-4 h-4 text-gray-600" />,
      FiEye: <FiEye className="w-4 h-4 text-gray-600" />,
      FiTrendingUp: <FiTrendingUp className="w-4 h-4 text-gray-600" />,
      FiUsers: <FiUsers className="w-4 h-4 text-gray-600" />,
      FiFileText: <FiFileText className="w-4 h-4 text-gray-600" />,
      FiUserCheck: <FiUserCheck className="w-4 h-4 text-gray-600" />,
    };
    return iconMap[iconName] || null;
  };

  return (
    <nav className="flex items-center gap-3 flex-shrink-0">
      {links.map((link) => {
        const isActive = (href: string) => {
          if (href === '/' || href === '') return currentPath === href;
          // Handle specific cases like /profile/jobs where we want sub-routes to be active
          return currentPath.startsWith(href);
        };

        const isLinkActive = isActive(link.href);

        return (
          <div key={link.label} className="relative">
            {link.submenu ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                  className={`text-[11px] lg:text-sm font-medium font-sans px-2 lg:px-3 py-1 lg:py-1.5 rounded-full transition-all flex items-center gap-1 whitespace-nowrap hover:scale-105 hover:shadow-md ${isLinkActive
                      ? "bg-purple-50 text-purple-700 font-semibold shadow-sm"
                      : "text-gray-600 hover:text-purple-700 hover:bg-purple-50/50"
                    }`}
                >
                  {link.label}
                  <FiChevronDown className={`transition-transform w-3 h-3 lg:w-4 lg:h-4 ${openDropdown === link.label ? 'rotate-180' : ''}`} />
                </Button>
                {openDropdown === link.label && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[70]">
                      {link.submenu.map((sublink) => (
                        <div key={sublink.label}>
                          {sublink.submenu ? (
                            <>
                              <div className="px-4 py-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50/50">
                                {sublink.label}
                              </div>
                              <div className="py-1">
                                {sublink.submenu.map((nestedLink) => {
                                  const isNestedActive = isActive(nestedLink.href);
                                  return (
                                    <Link
                                      key={nestedLink.label}
                                      href={nestedLink.href}
                                      className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${isNestedActive
                                          ? "bg-purple-50 text-purple-700"
                                          : "text-gray-600 hover:bg-gray-50 hover:text-purple-700"
                                        }`}
                                      onClick={() => setOpenDropdown(null)}
                                    >
                                      {getIcon(nestedLink.icon)}
                                      {nestedLink.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <Link
                              href={sublink.href}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${isActive(sublink.href)
                                  ? "bg-purple-50 text-purple-700"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-purple-700"
                                }`}
                              onClick={() => setOpenDropdown(null)}
                            >
                              {getIcon(sublink.icon)}
                              {sublink.label}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : link.href === '#' ? (
              <button
                onClick={onAuthClick}
                className={`text-[11px] lg:text-sm font-medium font-sans px-2 lg:px-3 py-1.5 lg:py-2 rounded-full whitespace-nowrap transition-all hover:scale-105 hover:shadow-md ${isLinkActive
                    ? "bg-purple-50 text-purple-700 font-semibold shadow-sm"
                    : "text-gray-600 hover:text-purple-700 hover:bg-purple-50/50"
                  }`}
              >
                {link.label}
              </button>
            ) : (
              <Link
                href={link.href}
                className={`text-[11px] lg:text-sm font-medium font-sans px-2 lg:px-3 py-1.5 lg:py-2 rounded-full whitespace-nowrap transition-all hover:scale-105 hover:shadow-md ${isLinkActive
                    ? "bg-purple-50 text-purple-700 font-semibold shadow-sm"
                    : "text-gray-600 hover:text-purple-700 hover:bg-purple-50/50"
                  }`}
              >
                {link.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavbarDesktop;

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { menuItems } from '../../data/subMenu';

import { THEME } from "@/styles/theme";

export default function MobileSubMenu() {
  const router = useRouter();
  const pathname = usePathname();
  console.log(pathname,"menuItems");
  return (
    <section className="w-full px-2  items-center justify-center md:hidden">
      <div className="w-full max-w-[100%] ">
        {/* Mobile Menu Bar */}
        <div className="p-0">
          <div className="flex overflow-x-auto no-scrollbar gap-2 py-4 items-center justify-start [mask-image:linear-gradient(to_right,transparent,black_10px,black_calc(100%_-_10px),transparent)] px-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.href === pathname;
              
              return (
                <div 
                  key={index} 
                  onClick={() => router.push(item.href)}
                  className={`flex shadow-lg flex-col items-center justify-center py-2 px-3 min-w-[90px] rounded-2xl cursor-pointer transition-all duration-200 h-[80px] flex-shrink-0 border border-white/20 ${
                    isActive 
                      ? 'text-[#18192B] shadow-xl' 
                      : `hover:bg-[#c9ccf8]/40 ${THEME.components.glass} text-primary`
                  }`}
                  style={isActive ? { background: 'linear-gradient(to right, #8e97f7, #c9ccf8)', flex: '0 0 auto' } : { flex: '0 0 auto' }}
                >
                  {Icon && (
                    <Icon 
                      size={18} 
                      className={`mb-1 ${isActive ? 'text-[#18192B]' : 'text-primary'}`} 
                    />
                  )}
                  <span className={`text-xs font-medium text-center leading-tight ${
                    isActive ? 'text-[#18192B]' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

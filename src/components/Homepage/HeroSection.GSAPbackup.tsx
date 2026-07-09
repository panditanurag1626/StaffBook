'use client';

import { useEffect } from 'react';

export default function Hero() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#1A0033');
    else {
      const tag = document.createElement('meta');
      tag.name = 'theme-color';
      tag.content = '#1A0033';
      document.head.appendChild(tag);
    }
    return () => {
      const tag = document.querySelector('meta[name="theme-color"]');
      if (tag) tag.setAttribute('content', '#ffffff');
    };
  }, []);

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#3b0764] via-[#5b21b6] to-[#7c3aed]">
      {/* ---- Layered atmospheric gradient glows (lighter purple family) ---- */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: 'rgba(124, 58, 237, 0.4)' }} />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'rgba(167, 139, 250, 0.3)' }} />
      <div className="absolute -bottom-32 -left-20 w-[450px] h-[450px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: 'rgba(139, 92, 246, 0.35)' }} />
      <div className="absolute -bottom-20 -right-20 w-[380px] h-[380px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'rgba(124, 58, 237, 0.3)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none"
        style={{ background: 'rgba(167, 139, 250, 0.15)' }} />

      {/* ---- Subtle grid texture ---- */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* ---- Glassmorphism container ---- */}
      <div className="relative z-10 w-[96vw] max-w-7xl mx-auto min-h-[75vh] rounded-[48px] md:rounded-[64px] p-8 md:p-16 lg:p-20 mt-16 md:mt-20 flex items-start md:items-center">
        <div
          className="absolute inset-0 rounded-[48px] md:rounded-[64px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid #8200db',
            boxShadow: '0 0 100px rgba(130, 0, 219, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        />
        <div
          className="absolute inset-0 rounded-[48px] md:rounded-[64px] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 100%)' }}
        />

        {/* ---- Content ---- */}
        <div className="relative z-10 w-full">
          {/* Eyebrow centered */}
          <p className="text-center text-sm md:text-base tracking-[0.05em] text-purple-200 font-medium mb-8 md:mb-10">
            Competitive Edge through Creativity &amp; Technology
          </p>

          {/* Zigzag: that makes a centered, jobs & difference with same left indent */}
          <h1 className="flex flex-col gap-3 md:gap-4 font-['Inter_Tight',system-ui,sans-serif] font-bold leading-[0.95] tracking-[-0.03em] text-white select-none">
            {/* Job + star next to it */}
            <span className="ml-16 md:ml-28 flex items-center gap-3 md:gap-4">
              <span className="font-medium text-[clamp(2.2rem,7vw,4.5rem)] leading-[1.1]">Job</span>
              <span className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shrink-0">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-purple-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
                </svg>
              </span>
            </span>

            {/* that makes a — video rectangle then text */}
            <span className="self-center flex items-center gap-3 md:gap-4 font-medium text-purple-200/80 text-[clamp(2.2rem,7vw,4.5rem)]">
              <video className="rounded-[15px] h-[1em] w-auto aspect-video object-cover shrink-0" autoPlay muted loop playsInline src="/Videos/staffbook.mp4" />
              <span className="inline-flex items-center">
                <span>that </span><span id="makes-spacer" className="invisible">Makes a</span>
              </span>
            </span>

            {/* Difference — D aligns with ★ */}
            <span className="ml-16 md:ml-28 flex items-center gap-3 md:gap-4">
              <span className="font-medium invisible text-[clamp(2.2rem,7vw,4.5rem)] leading-[1.1] select-none">Job</span>
              <span id="diff-spacer" className="font-medium invisible text-[clamp(2.2rem,7vw,4.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300/90 to-purple-100">
                Difference
              </span>
            </span>
          </h1>
        </div>

        {/* ---- Arrow-down merged into bottom-right edge of box ---- */}
        <div className="absolute -bottom-5 -right-5 md:-bottom-6 md:-right-6 z-20">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg animate-bounce">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-300/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* ---- Subtle animated light sweep ---- */}
      <div
        className="absolute top-0 -left-full w-[200%] h-full pointer-events-none z-0 opacity-[0.05]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(130, 0, 219, 0.4), transparent)',
          animation: 'sweep 8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes sweep {
          0%, 100% { transform: translateX(-50%); }
          50% { transform: translateX(50%); }
        }
      `}</style>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Hero() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#6d28d9');
    else {
      const tag = document.createElement('meta');
      tag.name = 'theme-color';
      tag.content = '#6d28d9';
      document.head.appendChild(tag);
    }
    return () => {
      const tag = document.querySelector('meta[name="theme-color"]');
      if (tag) tag.setAttribute('content', '#ffffff');
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/networking');
      } else {
        if (result.error?.toLowerCase().includes('gst') || result.error?.includes('not verified')) {
          setError('Please complete verification on the Sign In page.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#ddd6fe] via-[#a78bfa] to-[#8b5cf6]">
      {/* ---- Layered atmospheric gradient glows ---- */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: 'rgba(196, 181, 253, 0.3)' }} />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'rgba(221, 214, 254, 0.2)' }} />
      <div className="absolute -bottom-32 -left-20 w-[450px] h-[450px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: 'rgba(167, 139, 250, 0.25)' }} />
      <div className="absolute -bottom-20 -right-20 w-[380px] h-[380px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'rgba(196, 181, 253, 0.2)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none"
        style={{ background: 'rgba(221, 214, 254, 0.1)' }} />

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

      {/* ---- Full-width glass container ---- */}
      <div className="relative z-10 w-full max-w-none min-h-[75vh] px-[10px] mt-8 md:mt-12">
        <div className="w-full relative rounded-[48px] md:rounded-[64px] p-8 md:p-16 lg:p-20 flex items-start md:items-center">
          <div
            className="absolute inset-0 rounded-[48px] md:rounded-[64px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 0 100px rgba(130, 0, 219, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          />
          <div
            className="absolute inset-0 rounded-[48px] md:rounded-[64px] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(40,8,65,0.55) 0%, rgba(20,3,35,0.8) 100%)' }}
          />

          {/* ---- Content ---- */}
          <div className="relative z-10 w-full">
            {/* Eyebrow — divider line with centered text */}
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div className="flex-1 h-px bg-purple-300/20" />
              <span className="text-base md:text-lg tracking-[0.05em] text-purple-200 font-medium whitespace-nowrap">
                Competitive Edge through Creativity &amp; Technology
              </span>
              <div className="flex-1 h-px bg-purple-300/20" />
            </div>

            {/* Logo + zigzag | Sign-in — side by side */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 items-start">

              {/* Left block: icon + zigzag */}
              <div className="flex items-center gap-4 md:gap-6 flex-1">
                <div
                  className="overflow-hidden relative flex-shrink-0 w-[108px] md:w-[156px] aspect-square"
                  style={{
                    maskImage: 'url(/images/staffbook%20400x120.svg)',
                    maskSize: 'auto 100%',
                    maskPosition: '0% 50%',
                    maskRepeat: 'no-repeat',
                    WebkitMaskImage: 'url(/images/staffbook%20400x120.svg)',
                    WebkitMaskSize: 'auto 100%',
                    WebkitMaskPosition: '0% 50%',
                    WebkitMaskRepeat: 'no-repeat',
                  }}
                >
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    src="/Videos/staffbook.mp4"
                  />
                </div>

                <h1 className="flex flex-col gap-3 md:gap-4 font-['Inter_Tight',system-ui,sans-serif] font-bold leading-[0.95] tracking-[-0.03em] text-white select-none">
                  <span className="flex items-center gap-3 md:gap-4 ml-12 md:ml-20">
                    <span className="font-medium text-[clamp(1.6rem,5vw,3.2rem)] leading-[1.1]">Job</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shrink-0">
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-purple-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
                      </svg>
                    </span>
                  </span>

                  <span className="font-medium text-purple-200/80 text-[clamp(1.6rem,5vw,3.2rem)] self-center">
                    <span className="inline-flex items-center">
                      <span>that </span><span id="makes-spacer" className="invisible">Makes a</span>
                    </span>
                  </span>

                  <span className="flex items-center gap-3 md:gap-4 ml-12 md:ml-20">
                    <span className="font-medium invisible text-[clamp(1.6rem,5vw,3.2rem)] leading-[1.1] select-none">Job</span>
                    <span id="diff-spacer" className="font-medium invisible text-[clamp(1.6rem,5vw,3.2rem)] text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300/90 to-purple-100">
                      Difference
                    </span>
                  </span>
                </h1>
              </div>

              {/* Right block: sign-in form */}
              <div className="w-full lg:w-auto lg:min-w-[300px] xl:min-w-[340px] flex-shrink-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.12em] text-purple-300/70 mb-1.5 font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 text-sm outline-none transition-colors focus:border-purple-400/50 focus:bg-white/[0.08]"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.12em] text-purple-300/70 mb-1.5 font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 text-sm outline-none transition-colors focus:border-purple-400/50 focus:bg-white/[0.08] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-300/80 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-red-300 text-xs font-medium">{error}</p>
                  )}

                  {/* Sign In button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #8200db, #a855f7)' }}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>

                  {/* Create account */}
                  <p className="text-center text-sm text-purple-300/60 mt-3">
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/signup')}
                      className="text-purple-300 font-medium hover:text-purple-200 transition-colors underline underline-offset-2"
                    >
                      Create account
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Arrow-down merged into bottom-right edge ---- */}
      <div className="absolute bottom-5 right-5 md:bottom-6 md:right-6 z-20">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg animate-bounce">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-300/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
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

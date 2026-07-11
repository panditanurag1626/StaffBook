"use client";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import MessageWidget from "@/components/shared/MessageWidget";
import ChatbotWidget from "@/components/shared/ChatbotWidget";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMeetingPage = pathname?.startsWith("/meeting");
  const isLandingPage = pathname === "/" || pathname === "/home";

  return (
    <>
      {!isMeetingPage && !isLandingPage && <Navbar />}
      {isLandingPage && (
        <div className="fixed top-0 right-0 z-50 p-4">
          <button
            onClick={() => router.push('/signin')}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 shadow-lg shadow-purple-300/30 transition-all"
          >
            Sign In
          </button>
        </div>
      )}
      <main className={!isMeetingPage ? `min-h-screen ${!isLandingPage ? 'pb-[80px] lg:pb-0' : ''}` : "h-screen"}>
        {children}
      </main>
      {!isMeetingPage && (
        <>
          <Footer showMobile={isLandingPage} />
          {!isLandingPage && <MobileBottomNav />}
          {user && <MessageWidget />}
        </>
      )}
    </>
  );
}
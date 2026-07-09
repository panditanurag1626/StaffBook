import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UserModeProvider } from "@/context/UserModeContext";
import ClientLayout from "./ClientLayout";
import RouteGuard from "@/components/shared/RouteGuard";
import ToastProvider from "@/components/shared/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { THEME } from "@/styles/theme";

export const metadata: Metadata = {
  title: "StaffBook",
  description: "Find Your Next Great Opportunity with StaffBook - A comprehensive professional community.",
  icons: {
    icon: "/logoHalf.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <UserModeProvider>
            <RouteGuard />
            <ClientLayout>
              {children}
            </ClientLayout>
            <ToastProvider />
          </UserModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

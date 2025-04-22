// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Auth from "../components/Auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InnoSpark",
  description:
    "The all‑in‑one platform where founders, mentors, and investors connect.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased bg-gradient-to-br from-indigo-50 to-indigo-200
          text-black flex flex-col min-h-screen
        `}
      >
        {/* HEADER */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="w-full px-6 py-4 flex items-center justify-between">
            <Link href="/">
              <span className="text-2xl font-extrabold text-black cursor-pointer">
                InnoSpark
              </span>
            </Link>
            <nav className="flex space-x-12">
              {[
                { href: "/Home", label: "Dashboard" },
                { href: "/UserProfile", label: "Profile" },
                { href: "/About", label: "About" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-1 pb-1 text-xl font-medium text-black hover:text-indigo-600 transition-colors group"
                >
                  {link.label}
                  <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-indigo-600 transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
            
            <Auth />
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-grow">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200">
          <div className="w-full px-6 py-6 text-center text-black text-sm">
            © {new Date().getFullYear()} InnoSpark. Developed by Berkeley Emerging Tech. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

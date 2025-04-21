// src/app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen
                    bg-gradient-to-br from-indigo-600 to-indigo-400
                    text-white text-center px-6">
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
        Ignite Your Startup Journey
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl mb-8">
        InnoSpark is the all‑in‑one platform where founders, mentors,
        and investors connect, pitch, and scale.
      </p>
      <div className="flex space-x-4">
        <Link href="/Home" legacyBehavior>
          <a className="px-8 py-3 bg-white text-indigo-600 font-semibold
                        rounded-lg shadow hover:bg-gray-100 transition">
            Get Started
          </a>
        </Link>
        <Link href="/UserProfile" legacyBehavior>
          <a className="px-8 py-3 border border-white font-semibold
                        rounded-lg hover:bg-white/20 transition">
            View Profile
          </a>
        </Link>
      </div>
    </div>
  );
}

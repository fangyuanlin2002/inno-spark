import React from "react";

// Make sure BETA.jpg is in your project's public/ folder
export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Brand icon positioned top-left */}
      <div className="absolute top-4 left-4 z-20">
        <img src="/BETA.jpg" alt="InnoSpark Logo" className="h-64 w-auto" />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-gray-900 prose">
        <h1 className="text-5xl font-extrabold mb-6">About InnoSpark</h1>
        <p className="mb-8">
          InnoSpark is a platform where founders, mentors, and investors come together to share entrepreneurial ideas,
          collaborate on projects, and build the next generation of startups. Our goal is to foster an open, supportive
          community where innovation thrives and connections spark success.
        </p>

        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
        <p className="mb-8">
          We believe that every great idea deserves a chance. By providing a dedicated space for idea-sharing, feedback,
          and networking, InnoSpark empowers entrepreneurs at all stages to turn concepts into reality.
        </p>

        <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
        <ul className="space-y-6 mb-8">
          <li className="bg-white bg-opacity-80 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-2xl font-semibold">Qiyu Chen</h3>
            <p className="italic mb-2">Founder of Berkeley Emerging Tech</p>
            <p>• B.A. in Mathematics, The Ohio State University (Class of 2024)</p>
            <p>• MEng in FinTech, University of California Berkeley (2024-2025)</p>
          </li>
          <li className="bg-white bg-opacity-80 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-2xl font-semibold">Fangyuan Lin</h3>
            <p className="italic mb-2">Lead Developer</p>
            <p>• B.A. in Mathematics & Computer Science, UC Berkeley (Class of 2024)</p>
            <p>• Incoming Ph.D. Student in Statistics, Columbia University (2025–2030)</p>
          </li>
          <li className="bg-white bg-opacity-80 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-2xl font-semibold">Dazhi Song</h3>
            <p className="italic mb-2">Developer</p>
            <p>• B.A. in Mathematics, The Ohio State University (Class of 2024)</p>
            <p>• M.S. in Applied Analytics, Columbia University (2024–2025)</p>
          </li>
            <li className="bg-white bg-opacity-80 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-2xl font-semibold">Yidian Chen</h3>
            <p className="italic mb-2">UI Contributor</p>
            <p>• B.S. in Arts and Sciences, The Ohio State University (Expected 2026)</p>
          </li>
        </ul>

        <h2 className="text-3xl font-bold mb-4">Join Us</h2>
        <p>
          Whether you have an idea to pitch, expertise to share, or capital to invest, InnoSpark is the place to be.
          Sign up today and ignite your entrepreneurial journey!
        </p>
        <a
          href="/Signup"
          className="inline-block mt-6 px-6 py-3 bg-teal-500 hover:bg-teal-600 rounded-full font-medium text-white"
        >
          Sign Up Now
        </a>
      </div>
    </div>
  );
}

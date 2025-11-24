'use client';

import Link from 'next/link';

export default function VerdictPage() {
  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-serif">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">The Verdict</h1>
        
        <div id="verdict-content" className="text-lg text-gray-700 leading-relaxed">
          <p className="italic text-gray-500 text-center py-10">
            (This page is currently empty. The final verdict will be displayed here.)
          </p>
        </div>

        <p className="text-center mt-10">
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline" legacyBehavior>
            &larr; Back to Main Menu
          </Link>
        </p>
      </div>
    </div>
  );
}
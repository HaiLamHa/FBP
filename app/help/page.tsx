'use client';

import Link from 'next/link';

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 text-gray-800">
      <div className="max-w-xl w-full flex flex-col gap-8 items-center text-center">
        <h1 className="text-3xl font-bold tracking-tight">Need a Hand?</h1>
        <p className="text-lg leading-relaxed">
          1) Upload photos in the Gallery. 2) Tap &ldquo;Analyse pictures&rdquo; to get keywords.
          3) Click keywords to remove any you don&apos;t want. 4) Analyse again to add more, then
          generate your story and verdict.
        </p>

        <div className="flex gap-4">
          <Link
            href="/gallery"
            className="px-5 py-3 bg-[#f8e61c] hover:bg-[#e9d600] text-black font-semibold rounded-md shadow-md transition"
          >
            Go to Gallery
          </Link>
          <Link
            href="/"
            className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md transition"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}

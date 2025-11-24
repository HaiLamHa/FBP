'use client'; // Marking this as a Client Component to allow browser-specific features and routing

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-12 md:pt-20 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 md:mb-16">It Wasn&apos;t Me</h1>

      <div className="flex flex-col gap-5 w-[180px]">
        
        {/* Camera Button */}
        <div className="camera-wrapper menu-button bg-gray-300 hover:bg-gray-400 rounded shadow-md text-gray-800">
          Take pictures
          {/* Note: The file input here is a client-side interaction */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="camera-input" 
          />
        </div>
        
        {/* Navigation Buttons (using Next.js Link) */}
        <Link href="/gallery" passHref legacyBehavior>
          <div className="menu-button bg-gray-300 hover:bg-gray-400 rounded shadow-md text-gray-800">Gallery</div>
        </Link>
        
        <Link href="/verdict" passHref legacyBehavior>
          <div className="menu-button bg-gray-300 hover:bg-gray-400 rounded shadow-md text-gray-800">Verdict</div>
        </Link>
        
        <Link href="/story" passHref legacyBehavior>
          <div className="menu-button bg-gray-300 hover:bg-gray-400 rounded shadow-md text-gray-800">Read story</div>
        </Link>
      </div>

      <style jsx global>{`
        /* Styles from globals.css applied via component classes */
        .menu-button {
          padding: 10px 15px;
          text-align: left;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.1s;
          display: block;
        }
        .menu-button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}

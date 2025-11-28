'use client'; // Marking this as a Client Component to allow browser-specific features and routing

import Link from 'next/link';

export default function Home() {
  const handleReset = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('itwasntme_uploaded_images');
      sessionStorage.removeItem('generatedStory');
      sessionStorage.removeItem('verdictResult');
      alert('All generated data has been reset.');
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Could not reset data. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center pt-12 md:pt-20 bg-gray-100 min-h-screen relative">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 md:mb-16">It Wasn&apos;t Me</h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        
        {/* Camera Button */}
        <div className="camera-wrapper menu-button bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md text-gray-800 font-semibold text-lg text-center">
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
          <div className="menu-button bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md text-gray-800 font-semibold text-lg text-center">Gallery</div>
        </Link>
        
        <Link href="/story" passHref legacyBehavior>
          <div className="menu-button bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md text-gray-800 font-semibold text-lg text-center">Read story</div>
        </Link>
        
        <Link href="/verdict" passHref legacyBehavior>
          <div className="menu-button bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md text-gray-800 font-semibold text-lg text-center">Verdict</div>
        </Link>
      </div>

      <style jsx global>{`
        /* Styles from globals.css applied via component classes */
        .menu-button {
          padding: 12px 18px;
          text-align: center;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.1s;
          display: block;
          width: 100%;
        }
        .menu-button:active {
          transform: scale(0.98);
        }
      `}</style>

      <button
        onClick={handleReset}
        className="fixed bottom-5 right-5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition text-sm md:text-base"
      >
        Reset data
      </button>
    </div>
  );
}

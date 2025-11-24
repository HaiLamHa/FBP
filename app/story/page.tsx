'use client';

import { useState } from 'react';
import Link from 'next/link';

const getInitialStory = () => {
  if (typeof window === 'undefined') {
    return 'Loading the generated story...';
  }
  const generatedStory = window.sessionStorage.getItem('generatedStory');
  return generatedStory ?? 'No story found. Please generate a story from the Gallery page first.';
};

export default function StoryPage() {
  const [storyContent] = useState<string>(getInitialStory);

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-serif">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">The Story of the Incident</h1>
        
        <div 
          id="story-content" 
          className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap"
        >
          {/* Display the story, replacing newlines with <br /> tags for HTML */}
          {storyContent.split('\n').map((line, index) => (
            <p key={index} className="mb-4">{line}</p>
          ))}
        </div>

        <p className="text-center mt-10 text-base">
          <Link href="/gallery" className="text-blue-600 hover:text-blue-800 underline mr-4" legacyBehavior>
            &larr; Back to Gallery
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline ml-4" legacyBehavior>
            Back to Main Menu
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
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
  const [policeStory, setPoliceStory] = useState<string>('Loading police report...');

  useEffect(() => {
    const loadPoliceStory = async () => {
      try {
        const response = await fetch('/police_AI_story.txt');
        if (!response.ok) throw new Error('Failed to load police story');
        const text = await response.text();
        setPoliceStory(text);
      } catch (err) {
        console.error('Error loading police story:', err);
        setPoliceStory('Could not load the police report. Please try again later.');
      }
    };

    loadPoliceStory();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-serif">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">The Story of the Incident</h1>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10 bg-white rounded-xl shadow-lg divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <section className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center md:text-left">Official police report</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-lg text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[320px]">
              {policeStory}
            </div>
          </section>

          <section className="p-6 md:p-8 md:pl-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center md:text-left">AI generated story</h2>
            <div id="story-content" className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-lg text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[320px]">
              {storyContent}
            </div>
          </section>
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

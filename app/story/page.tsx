'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import evidenceImage from '../../image/Evidence AI.png';
import nextBtn from '../../image/buttons/next.png';

export default function EvidencePage() {
  const [policeStory, setPoliceStory] = useState<string>('Loading police report...');

  useEffect(() => {
    const loadPoliceStory = async () => {
      try {
        const response = await fetch('/police_AI_story.txt', { cache: 'no-store' });
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
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top navigation */}
      <header className="w-full border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 relative flex items-center">
          <Link href="/" className="relative w-[220px] h-[80px] shrink-0">
            <Image
              src="/it-wasnt-me-logo.png"
              alt="It Wasn't Me logo"
              fill
              className="object-contain"
              priority
            />
          </Link>

          <nav className="nav-spaced text-base md:text-lg font-semibold absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <span className="px-4 py-2 bg-[#f8e61c] text-black rounded-md shadow-md">STORY</span>
            <Link href="/gallery" className="hover:text-black text-gray-600">EVIDENCE</Link>
            <Link href="/verdict" className="hover:text-black text-gray-600">DEFENSE</Link>
            <Link href="/verdict/result" className="hover:text-black text-gray-600">VERDICT</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 w-full">
        <div
          className="max-w-6xl mx-auto px-4 md:px-8 mt-5 py-10 md:py-14"
          style={{ marginTop: '20px' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="flex justify-center lg:justify-start order-1">
              <div className="w-full max-w-[420px] p-4 bg-white shadow-sm">
                <Image
                  src={evidenceImage}
                  alt="Evidence used in the investigation"
                  className="w-full h-auto object-cover"
                  width={640}
                  height={480}
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority
                />
              </div>
            </div>

            <article className="text-left order-2">
              <h1 className="text-xl md:text-2xl font-bold mb-4">Police Investigation</h1>
              <div className="text-base md:text-lg leading-relaxed whitespace-pre-line">
                {policeStory}
              </div>
            </article>
          </div>

          <div className="flex justify-center mt-10" style={{ marginTop: '20px' }}>
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center transition-transform hover:scale-105 focus:scale-105"
              aria-label="Next"
            >
              <Image
                src={nextBtn}
                alt="Next"
                width={102}
                height={33}
                style={{ width: '102px', height: 'auto' }}
              />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

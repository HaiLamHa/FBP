'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import playAgainBtn from '../../../image/buttons/play again.png';

interface VerdictResult {
  confidence: number;
  rationale: string;
  verdictText: string;
  strengths?: string;
  weaknesses?: string;
}

const resetAll = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem('verdictResult');
  window.sessionStorage.removeItem('generatedStory');
  window.sessionStorage.removeItem('verdictResult');
  window.localStorage.removeItem('itwasntme_uploaded_images');
  // best-effort: clear any gallery storage util if present
  indexedDB?.databases?.().then((dbs) => {
    dbs?.forEach(db => {
      if (db.name?.includes('itwasntme')) {
        indexedDB.deleteDatabase(db.name);
      }
    });
  }).catch(() => {});
};

export default function VerdictResultPage() {
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [showVerdictText, setShowVerdictText] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('verdictResult');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(parsed);
      } catch {
        setResult(null);
      }
    }
  }, []);

  // animate the confidence bar
  useEffect(() => {
    if (!result) return;
    setShowVerdictText(false);
    const target = Math.max(0, Math.min(100, Number(result.confidence) || 0));
    const duration = 2400;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / duration);
      const current = Math.round(target * ratio);
      setProgress(current);
      if (ratio < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setShowVerdictText(true), 200);
      }
    };
    requestAnimationFrame(tick);
  }, [result]);

  const verdictTitle = (() => {
    if (!result) return '';
    const isNotGuilty = (result.verdictText || '').toLowerCase().includes('not');
    return isNotGuilty ? 'NOT GUILTY' : 'GUILTY';
  })();

  const handlePlayAgain = () => {
    resetAll();
    window.location.href = '/';
  };

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

          <nav className="nav-spaced text-base md:text-lg font-semibold ml-2 md:ml-4 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <Link href="/story" className="hover:text-black text-gray-600">STORY</Link>
            <Link href="/gallery" className="hover:text-black text-gray-600">EVIDENCE</Link>
            <Link href="/verdict" className="hover:text-black text-gray-600">DEFENSE</Link>
            <span className="px-4 py-2 bg-[#f8e61c] text-black rounded-md shadow-md">VERDICT</span>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-5 md:px-10 py-10 md:py-14 text-center space-y-10">
          {result ? (
            <>
              {showVerdictText && (
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{verdictTitle}</h1>
              )}
              <p className="text-lg md:text-xl font-semibold">Confidence: {progress}%</p>

              {/* Progress bar */}
              <div className="w-full max-w-3xl mx-auto">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Rationale */}
              <div className="text-base md:text-lg leading-relaxed text-gray-900 whitespace-pre-line">
                {result.rationale || 'No rationale provided.'}
              </div>

              {/* Strengths / Weaknesses */}
              <div className="grid md:grid-cols-2 gap-10 text-left">
                <div className="space-y-3">
                  <h3 className="text-base md:text-lg font-bold uppercase">Strengths of the defense</h3>
                  <p className="text-sm md:text-base leading-relaxed text-gray-900 whitespace-pre-line">
                    {result.strengths || 'No strengths were highlighted.'}
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base md:text-lg font-bold uppercase">Weaknesses in the narrative</h3>
                  <p className="text-sm md:text-base leading-relaxed text-gray-900 whitespace-pre-line">
                    {result.weaknesses || 'No weaknesses were highlighted.'}
                  </p>
                </div>
              </div>

              {/* Play again */}
              <div className="flex justify-center">
                <button
                  onClick={handlePlayAgain}
                  className="inline-flex items-center justify-center bg-transparent border-0 p-0 transition-transform hover:scale-105 focus:scale-105"
                  aria-label="Play Again"
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <Image
                    src={playAgainBtn}
                    alt="Play Again"
                    width={133}
                    height={43}
                    style={{ width: '133px', height: 'auto' }}
                  />
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <p className="text-lg text-gray-700">No verdict found. Please request one from the Defense page.</p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/verdict"
                  className="px-5 py-3 bg-[#f8e61c] hover:bg-[#e9d600] text-black font-semibold rounded-md shadow-md transition"
                >
                  Go to Defense
                </Link>
                <Link
                  href="/gallery"
                  className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md transition"
                >
                  Back to Evidence
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

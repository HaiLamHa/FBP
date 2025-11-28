'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface VerdictResult {
  confidence: number;
  rationale: string;
  verdictText: string;
}

export default function VerdictResultPage() {
  const [result, setResult] = useState<VerdictResult | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('verdictResult');
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        setResult(null);
      }
    }
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-serif">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
        <h1 className="text-4xl font-bold text-center text-gray-800">Final Verdict</h1>

        {result ? (
          <>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-800">
                Verdict: <span className={result.verdictText === 'Not guilty' ? 'text-green-600' : 'text-red-600'}>
                  {result.verdictText}
                </span>
              </p>
              <p className="text-lg text-gray-700 mt-2">
                Confidence in player: {result.confidence.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800">
              <h2 className="text-xl font-semibold mb-2">Reasoning</h2>
              <p className="leading-relaxed">{result.rationale}</p>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">
            No verdict found. Please request one from the Verdict page.
          </p>
        )}

        <div className="flex justify-center gap-6 pt-2">
          <Link href="/verdict" className="text-blue-600 hover:text-blue-800 underline" legacyBehavior>
            Back to Verdict
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline" legacyBehavior>
            Main Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const getGeneratedStory = () => {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem('generatedStory') ?? '';
};

export default function VerdictPage() {
  const router = useRouter();
  const [policeStory, setPoliceStory] = useState<string>('Loading police report...');
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGeneratedStory(getGeneratedStory());

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

  const handleVerdict = async () => {
    setError(null);

    if (!policeStory || !generatedStory) {
      setError('Please ensure both stories are available before requesting a verdict.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policeStory,
          defenseStory: generatedStory,
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      const confidence = Number(result.confidence ?? result.belief ?? 0);
      const rationale = result.rationale ?? 'No rationale provided.';
      const isNotGuilty = confidence >= 80;
      const verdictText = isNotGuilty ? 'Not guilty' : 'Guilty';

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'verdictResult',
          JSON.stringify({ confidence, rationale, verdictText })
        );
      }

      router.push('/verdict/result');
    } catch (err) {
      console.error('Error requesting verdict:', err);
      setError('Could not fetch the final verdict. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
        <h1 className="text-4xl font-bold text-center text-gray-800">The Verdict</h1>
        <p className="text-center text-gray-600">Review both accounts before requesting judgement.</p>

        <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Official police report</h2>
          <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[220px] max-h-[380px] overflow-y-auto">
            {policeStory}
          </div>
        </section>

        <div className="flex flex-col items-center">
          <button
            onClick={handleVerdict}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-60"
          >
            {loading ? 'Requesting verdict...' : 'Final verdict'}
          </button>
          {error && <p className="text-red-600 mt-2 text-sm text-center">{error}</p>}
        </div>

        <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">AI generated story</h2>
          <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[220px] max-h-[380px] overflow-y-auto">
            {generatedStory || 'No generated story found. Please create one from the Gallery page first.'}
          </div>
        </section>

        <p className="text-center pt-2">
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline" legacyBehavior>
            &larr; Back to Main Menu
          </Link>
        </p>
      </div>
    </div>
  );
}

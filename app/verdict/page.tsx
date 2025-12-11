'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import changeStoryBtn from '../../image/buttons/change story.png';
import finalVerdictBtn from '../../image/buttons/final verdict.png';

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
        const response = await fetch('/police_AI_story_short.txt', { cache: 'no-store' });
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
      const strengths = result.strengths ?? '';
      const weaknesses = result.weaknesses ?? '';

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'verdictResult',
          JSON.stringify({ confidence, rationale, verdictText, strengths, weaknesses })
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
            <button onClick={() => router.push('/story')} className="hover:text-black text-gray-600" type="button">STORY</button>
            <button onClick={() => router.push('/gallery')} className="hover:text-black text-gray-600" type="button">EVIDENCE</button>
            <span className="px-4 py-2 bg-[#f8e61c] text-black rounded-md shadow-md active">DEFENSE</span>
            <button onClick={() => router.push('/verdict/result')} className="hover:text-black text-gray-600" type="button">VERDICT</button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-6 md:px-14 py-10 md:py-14 space-y-10 text-center">
          {/* AI Story */}
          <div className="space-y-4" style={{ marginBottom: '20px' }}>
            <h1 className="text-lg md:text-xl font-bold uppercase">Your AI Story</h1>
            <div className="text-base md:text-lg leading-relaxed text-gray-900 whitespace-pre-line text-left md:text-justify max-w-3xl mx-auto">
              {generatedStory || 'No generated story found. Please create one from the Evidence page first.'}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-10" style={{ columnGap: '60px' }}>
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center transition-transform hover:scale-105 focus:scale-105"
              aria-label="Change Story"
            >
              <Image
                src={changeStoryBtn}
                alt="Change Story"
                width={133}
                height={43}
                style={{ width: '133px', height: 'auto' }}
              />
            </Link>
            <button
              onClick={handleVerdict}
              disabled={loading}
              className="inline-flex items-center justify-center disabled:opacity-60 bg-transparent border-0 p-0 transition-transform hover:scale-105 focus:scale-105"
              aria-label={loading ? 'Requesting verdict' : 'Final Verdict'}
              style={{ background: 'transparent', border: 'none' }}
            >
              <Image
                src={finalVerdictBtn}
                alt="Final Verdict"
                width={133}
                height={43}
                style={{ width: '133px', height: 'auto' }}
              />
            </button>
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        </div>
      </section>

      {loading && (
        <div className="loading-modal-overlay">
          <div className="loading-spinner"></div>
          <p id="loading-text">Requesting verdict...</p>
        </div>
      )}
    </main>
  );
}

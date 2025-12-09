'use client';

import Image from 'next/image';
import Link from 'next/link';
import nextBtn from '../../image/buttons/next.png';

export default function IntroPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-10 max-w-2xl text-center text-gray-900">
        <div className="relative w-[320px] h-[140px]">
          <Image
            src="/it-wasnt-me-logo.png"
            alt="It Wasn't Me logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex flex-col gap-6 items-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase">
            You have been framed by the police AI for a murder
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-xl">
            &quot;You&apos;ve been framed by an AI-built police system. It claims you committed a
            crime you didn&apos;t do. Prove your innocence by collecting evidence, analyzing the
            clues, and building your defense. Every photo, keyword, and story you create brings you
            closer to clearing your name.&quot;
          </p>
        </div>

        <Link
          href="/story"
          className="mt-2 inline-flex items-center justify-center transition-transform hover:scale-105 focus:scale-105"
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
    </main>
  );
}

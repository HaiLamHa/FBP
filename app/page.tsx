'use client';

import Image from 'next/image';
import Link from 'next/link';
import startBtn from '../image/buttons/start.png';

export default function Home() {
  return (
    <>
      <button
        type="button"
        className="fixed top-4 left-4 z-50 text-xs font-semibold hover:scale-105 transition-transform"
        style={{ background: 'none', border: 'none', padding: '4px 6px', color: '#000' }}
        onClick={() => {
          const elem = document.documentElement;
          if (!document.fullscreenElement) {
            elem.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
        }}
      >
        Fullscreen
      </button>
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-10" style={{ transform: 'translateY(-30px)' }}>
          <div className="relative w-[320px] h-[140px]">
            <Image
              src="/it-wasnt-me-logo.png"
              alt="It Wasn't Me logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex flex-col items-center" style={{ rowGap: '30px' }}>
          <Link
            href="/intro"
            className="inline-flex items-center justify-center transition-transform hover:scale-105 focus:scale-105"
            aria-label="Start"
          >
            <Image
              src={startBtn}
              alt="Start"
              width={153}
              height={50}
              style={{ width: '153px', height: 'auto' }}
              priority
            />
          </Link>
        </div>
      </div>
      </main>
    </>
  );
}

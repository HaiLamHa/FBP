'use client';

import Image from 'next/image';
import Link from 'next/link';
import startBtn from '../image/buttons/start.png';
import helpBtn from '../image/buttons/help.png';

export default function Home() {
  return (
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

          <Link
            href="/help"
            className="inline-flex items-center justify-center transition-transform hover:scale-105 focus:scale-105"
            aria-label="Help"
          >
            <Image
              src={helpBtn}
              alt="Help"
              width={153}
              height={50}
              style={{ width: '153px', height: 'auto' }}
            />
          </Link>
        </div>
      </div>
    </main>
  );
}

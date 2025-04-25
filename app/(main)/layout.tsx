'use client';

import Navbar from '@/app/_components/navbar';
import { TrialBanner } from '@/components/subscription/trial-banner';
import { EmailVerificationBanner } from '@/components/shared/email-verification-banner';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { pdfjs } from 'react-pdf';

const workerSrc =
  process.env.NODE_ENV === 'production'
    ? `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    : new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldIgnoreStyling = /^\/resumes\/[^/]+\/builder$/.test(pathname);
  return (
    <>
      <main>
        <TrialBanner />
        <EmailVerificationBanner />
        <Navbar />
        {shouldIgnoreStyling ? (
          children
        ) : (
          <div className={clsx('', shouldIgnoreStyling ? '' : 'px-10 py-10')}>
            <div className="container">{children}</div>
          </div>
        )}
      </main>
    </>
  );
}

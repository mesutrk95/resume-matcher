// 'use client';

import Navbar from '@/app/_components/navbar';
import { TrialBanner } from '@/components/subscription/trial-banner';
import { EmailVerificationBanner } from '@/components/shared/email-verification-banner';
import clsx from 'clsx';
import { pdfjs } from 'react-pdf';
import { UserProvider } from '@/providers/UserProvider';
import { SubscriptionProvider } from '@/providers/SubscriptionProvider';
import { getUserSubscription } from '@/actions/subscription/customer';
import { currentUser } from '@/lib/auth';
import { User } from 'next-auth';
import { headers } from 'next/headers';

const workerSrc =
  process.env.NODE_ENV === 'production'
    ? `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    : new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const subscription = await getUserSubscription().catch(() => null);
  const user = (await currentUser()) as User;

  const headerList = await headers();
  const pathname = headerList.get('x-current-path') || '';
  const shouldIgnoreStyling = /^\/resumes\/[^/]+\/builder$/.test(pathname);

  return (
    <>
      <UserProvider initialUser={user}>
        <SubscriptionProvider initialSubscription={subscription}>
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
        </SubscriptionProvider>
      </UserProvider>
    </>
  );
}

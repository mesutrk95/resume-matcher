'use client';

import Navbar from '@/app/_components/navbar';
import { TrialBanner } from '@/components/subscription/trial-banner';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TrialBanner />
      <Navbar />
      <main className="mx-10 py-10">
        <div className="container">{children}</div>
      </main>
    </>
  );
}

'use client';

import Navbar from '@/app/_components/navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <Navbar /> */}
      {children}
    </>
  );
}

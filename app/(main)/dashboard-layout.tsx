'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';
import { pdfjs } from 'react-pdf';

const workerSrc =
  process.env.NODE_ENV === 'production'
    ? `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    : new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const shouldIgnoreStyling = /^\/resumes\/[^/]+\/builder$/.test(pathname);
  return (
    <>
      {shouldIgnoreStyling ? (
        children
      ) : (
        <div className={clsx('', shouldIgnoreStyling ? '' : 'px-10 py-10')}>
          <div className="container">{children}</div>
        </div>
      )}
    </>
  );
};

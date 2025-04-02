"use client";

import Navbar from "@/app/_components/navbar";
import { TrialBanner } from "@/components/subscription/trial-banner";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldIgnoreStyling = /^\/resumes\/[^/]+$/.test(pathname);
  return (
    <>
      <main>
        <TrialBanner />
        <Navbar />
        {shouldIgnoreStyling ? (
          children
        ) : (
          <div className={clsx("", shouldIgnoreStyling ? "" : "px-10 py-10")}>
            <div className="container">{children}</div>
          </div>
        )}
      </main>
    </>
  );
}

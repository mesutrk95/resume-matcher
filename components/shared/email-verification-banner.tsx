'use client';

import { useUser } from '@/providers/UserProvider';
import { ExtendedUser } from '@/types/next-auth';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useState } from 'react';

export function EmailVerificationBanner() {
  const { user } = useUser();
  const [dismissed, setDismissed] = useState(false);

  // Show banner only when user exists, email is not verified, and banner is not dismissed
  if (!user || (user as ExtendedUser).emailVerified || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-600 text-white py-2 px-4" id="email-verification-banner">
      <div className="container mx-auto flex flex-col items-center justify-center gap-y-2 py-2 sm:flex-row sm:justify-between sm:py-0">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">
            Your email is not verified. Please verify your email to access all features.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-amber-600 border-white hover:bg-amber-100 hover:text-amber-800"
            asChild
          >
            <Link href="/profile">Go to Profile</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-amber-700 hover:text-white p-0 h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

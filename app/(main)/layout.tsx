// 'use client';

import Navbar from '@/app/_components/navbar';
import { TrialBanner } from '@/components/subscription/trial-banner';
import { EmailVerificationBanner } from '@/components/shared/email-verification-banner';
import { UserProvider } from '@/providers/UserProvider';
import { SubscriptionProvider } from '@/providers/SubscriptionProvider';
import { getUserSubscription } from '@/actions/subscription/customer';
import { currentUser } from '@/lib/auth';
import { User } from 'next-auth';
import { DashboardLayout } from './dashboard-layout';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const subscription = await getUserSubscription().catch(() => null);
  const user = (await currentUser()) as User;
  return (
    <>
      <UserProvider initialUser={user}>
        <SubscriptionProvider initialSubscription={subscription}>
          <main>
            <TrialBanner />
            <EmailVerificationBanner />
            <Navbar />
            <DashboardLayout>{children}</DashboardLayout>
          </main>
        </SubscriptionProvider>
      </UserProvider>
    </>
  );
}

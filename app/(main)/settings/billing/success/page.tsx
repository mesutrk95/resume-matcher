// app/(main)/settings/billing/success/page.tsx
'use client';

import { verifySubscriptionFromSession } from '@/actions/subscription';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const result = await verifySubscriptionFromSession(sessionId);

        if (result.success) {
          setSuccess(true);
        } else {
          setError(result.error || 'Failed to verify subscription');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  // Redirect to billing page after 5 seconds on success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/settings/billing');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            {loading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            ) : success ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-center">
            {loading
              ? 'Processing Your Subscription'
              : success
              ? 'Subscription Activated!'
              : 'Subscription Error'}
          </CardTitle>
          <CardDescription className="text-center">
            {loading
              ? 'Please wait while we verify your subscription...'
              : success
              ? 'Thank you for subscribing to Resume Matcher Pro!'
              : 'We encountered an issue with your subscription.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground">
              This may take a few moments...
            </p>
          ) : success ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Your subscription has been successfully activated! You now have
                full access to all premium features.
              </p>
              <p className="text-sm text-muted-foreground">
                You will be redirected to your billing dashboard in a few
                seconds.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-red-500">{error}</p>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact our support
                team.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            variant={success ? 'default' : 'outline'}
            onClick={() => router.push('/settings/billing')}
          >
            {success ? 'Go to Billing Dashboard' : 'Back to Billing'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

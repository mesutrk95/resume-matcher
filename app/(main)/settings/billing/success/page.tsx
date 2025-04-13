import { verifySubscriptionFromSession } from '@/actions/subscription/session';
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
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

export default async function SubscriptionSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = searchParams;

  if (!sessionId) {
    redirect('/settings/billing');
  }

  let success = false;
  let error = null;

  try {
    const result = await verifySubscriptionFromSession(sessionId);
    success = result.success;

    if (!success) {
      error = 'Failed to verify subscription';
    }
  } catch (err) {
    error = 'An unexpected error occurred';
    console.error(err);
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            {success ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-center">
            {success ? 'Subscription Activated!' : 'Subscription Error'}
          </CardTitle>
          <CardDescription className="text-center">
            {success
              ? 'Thank you for subscribing to Resume Matcher Pro!'
              : 'We encountered an issue with your subscription.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Your subscription has been successfully activated! You now have full access to all
                premium features.
              </p>
              <p className="text-sm text-muted-foreground">
                You will be automatically redirected to your billing dashboard in a few seconds.
              </p>
              <meta httpEquiv="refresh" content="5;url=/settings/billing" />
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-red-500">{error}</p>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact our support team.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button variant={success ? 'default' : 'outline'} asChild>
            <Link href="/settings/billing">
              {success ? 'Go to Billing Dashboard' : 'Back to Billing'}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

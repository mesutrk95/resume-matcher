// hooks/useStripeSessionCheck.ts
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifySubscriptionFromSession } from '@/actions/subscription';
import { toast } from 'sonner';

export function useStripeSessionCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    checked: boolean;
    success: boolean;
    sessionId?: string;
    error?: string;
  }>({
    checked: false,
    success: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const successParam = searchParams.get('success');

  useEffect(() => {
    // If there's a session_id in the URL, we need to verify it
    if (sessionId && successParam === 'true') {
      setIsChecking(true);

      const checkSession = async () => {
        try {
          const result = await verifySubscriptionFromSession(sessionId);

          if (result.success) {
            setCheckResult({
              checked: true,
              success: true,
              sessionId,
            });

            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);

            toast.success('Subscription activated successfully!');

            // Reload the page to reflect changes
            setTimeout(() => {
              router.refresh();
            }, 1000);
          } else {
            setCheckResult({
              checked: true,
              success: false,
              sessionId,
              error: result.error,
            });

            toast.error(result.error || 'Failed to verify subscription');
          }
        } catch (error: any) {
          setCheckResult({
            checked: true,
            success: false,
            sessionId,
            error: error.message || 'An unexpected error occurred',
          });

          toast.error('Failed to verify subscription');
        } finally {
          setIsChecking(false);
        }
      };

      checkSession();
    }
  }, [sessionId, successParam, router]);

  return {
    isChecking,
    checkResult,
  };
}

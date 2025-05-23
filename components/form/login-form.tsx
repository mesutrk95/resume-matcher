'use client';

import { CardWrapper } from '@/components/shared/card-wrapper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import { loginSchema } from '@/schemas';
import { Button } from '@/components/ui/button';
import { useEffect, useTransition } from 'react';
import { login } from '@/actions/login';
import { FormInput } from '@/components/shared/form-input';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export const LoginForm = ({ heroImage }: { heroImage?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // this fixes the nextjs middleware redirect issue (browser url doesn't change when redirected but the component is shown)
  useEffect(() => {
    const path = new URL(location.href).pathname;

    if (path !== '/login') {
      const url = new URL(`/login`, location.href);
      if (path !== '/') url.searchParams.set('redirect', path + '?' + searchParams.toString());

      return router.push(url.toString());
    }
  }, []);

  const handleSubmit = form.handleSubmit(values => {
    startTransition(() => {
      login(values)
        .then(data => {
          if (!data) return;
          if (!data.success) {
            return toast.error(data.error.message);
          }

          const redirect = searchParams.get('redirect');
          if (redirect) router.push(redirect);
          else router.push('/home');
          // now we don't use two factor skip it
          // return router.push('/two-factor');
        })
        .catch(() => toast.error('Something went wrong.'));
    });
  });

  return (
    <CardWrapper
      heroImage={heroImage}
      headerTitle="Login"
      headerDescription="Welcome back! Please fill out the form below before logging in to the website."
      backButtonLabel="Don't have an account? Register"
      backButtonHref="/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormInput
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="e.g. johndoe@example.com"
              isPending={isPending}
            />
            <div>
              <FormInput
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="******"
                isPending={isPending}
              />
              <Button
                size="sm"
                variant="link"
                className="-mt-6 p-0 text-xs text-blue-500 w-full justify-end"
                asChild
              >
                <Link href="/reset">Forgot password?</Link>
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

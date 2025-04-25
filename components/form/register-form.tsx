'use client';

import { CardWrapper } from '@/components/shared/card-wrapper';
import { Form } from '@/components/ui/form';
import { ConsentToggle } from '@/components/shared/consent-toggle';
import { registerSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormInput } from '@/components/shared/form-input';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { register } from '@/actions/register';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const RegisterForm = ({ heroImage }: { heroImage?: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      marketingEmails: true,
      termsAccepted: false,
    },
  });

  const handleSubmit = form.handleSubmit(values => {
    startTransition(() => {
      register(values).then(data => {
        if (data?.success) {
          router.push('/login');
          if ('message' in data) {
            return toast.success(data.message);
          }
        }
        if (data && 'error' in data) {
          return toast.error(data.error.message);
        }
      });
    });
  });

  return (
    <CardWrapper
      heroImage={heroImage}
      headerTitle="Register"
      headerDescription="Register your account by filling out the form below, make sure the data you enter is correct."
      backButtonLabel="Already have an account? Login"
      backButtonHref="/login"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormInput
              control={form.control}
              name="name"
              label="Name"
              type="text"
              placeholder="e.g. John Doe"
              isPending={isPending}
            />
            <FormInput
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="e.g. johndoe@example.com"
              isPending={isPending}
            />
            <FormInput
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="******"
              isPending={isPending}
            />
            <div className="mt-6 space-y-2">
              <ConsentToggle
                control={form.control}
                name="marketingEmails"
                label={
                  <span>Receive updates, tips, and promotional emails about our services</span>
                }
                isPending={isPending}
              />
              <ConsentToggle
                control={form.control}
                name="termsAccepted"
                label={
                  <span>
                    I accept the{' '}
                    <a href="#" className="text-primary hover:underline">
                      terms and services
                    </a>{' '}
                    agreement
                  </span>
                }
                isPending={isPending}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPending || !form.getValues('termsAccepted')}
            className="w-full"
          >
            Create an account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

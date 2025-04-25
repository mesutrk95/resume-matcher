'use client';

import { profileSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/shared/form-input';
import { Button } from '@/components/ui/button';
import { profile } from '@/actions/profile';
import { toast } from 'sonner';
import { ExtendedUser } from '@/types/next-auth';
import { FormToggle } from '@/components/shared/form-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRound } from 'lucide-react';
import { resendToken } from '@/actions/resend';

type ProfileFormProps = {
  user: ExtendedUser;
};

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    values: {
      name: user.name || undefined,
      email: user.email || undefined,
      password: undefined,
      newPassword: undefined,
      isTwoFactorEnabled: user.isTwoFactorEnabled || undefined,
      marketingEmails: user.marketingEmails || false,
    },
  });

  const handleSubmit = form.handleSubmit(values => {
    startTransition(() => {
      profile(values).then(data => {
        if (data.success) {
          form.reset();
          return toast.success(data.message);
        }
        return toast.error(data.error.message);
      });
    });
  });

  return (
    <>
      <div className="col-span-2 col-start-2 flex justify-center">
        <Avatar className="w-64 h-64">
          <AvatarImage src={user.image ?? ''} />
          <AvatarFallback>
            <UserRound size={128} />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="col-span-3 space-y-12">
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
              {!user.isOAuth && (
                <>
                  <FormInput
                    control={form.control}
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="e.g. johndoe@example.com"
                    isPending={isPending}
                    disabled={user.isOAuth}
                  />
                  <FormInput
                    control={form.control}
                    name="password"
                    label="Old Password"
                    type="password"
                    placeholder="******"
                    autoComplete="off"
                    isPending={isPending}
                  />
                  <FormInput
                    control={form.control}
                    name="newPassword"
                    label="New Password"
                    type="password"
                    placeholder="******"
                    autoComplete="off"
                    isPending={isPending}
                  />
                  {/* <FormToggle
                    control={form.control}
                    name="isTwoFactorEnabled"
                    label="Two-Factor Authentication"
                    description="Protect your account with additional security by enabling two-factor authentication for login. You will be required to enter both your credentials and an authentication code to login."
                    isPending={isPending}
                  /> */}
                  <FormToggle
                    control={form.control}
                    name="marketingEmails"
                    label="Marketing Emails"
                    description="Receive updates, tips, and promotional emails about our services from Minova."
                    isPending={isPending}
                  />
                </>
              )}
            </div>
            {!user.emailVerified && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserRound className="h-5 w-5 text-amber-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Email verification required
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        Your email is not verified. Please check your inbox or click the button
                        below to resend the verification email.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        onClick={() => {
                          startTransition(() => {
                            resendToken({ email: user.email! }).then(data => {
                              if (data.success) {
                                return toast.success(data.message);
                              }
                              return toast.error(data.error.message);
                            });
                          });
                        }}
                        disabled={isPending}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-mail"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        Resend verification email
                        {isPending && (
                          <svg
                            className="animate-spin -mr-1 ml-2 h-4 w-4 text-amber-800"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              Update profile
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

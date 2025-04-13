import { NewPasswordForm } from '@/components/form/new-password-form';
import { getResetPasswordToken } from '@/services/reset-password-token';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Reset Password',
};

export default async function NewPassword({ searchParams }: { searchParams: { token: string } }) {
  // Await searchParams before accessing its properties
  const params = await searchParams;
  if (!params.token) redirect('/');
  const resetPasswordToken = await getResetPasswordToken(params.token);
  if (!resetPasswordToken) redirect('/');

  return <NewPasswordForm token={resetPasswordToken.token} />;
}

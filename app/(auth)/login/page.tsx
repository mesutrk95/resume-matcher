import { LoginForm } from '@/components/form/login-form';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Login',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  // Await searchParams before accessing its properties
  const params = await searchParams;
  if (params.error) redirect(`/error?message=${params.error}`);
  return <LoginForm heroImage="/logos/svg/text-logo-outlines.svg" />;
}

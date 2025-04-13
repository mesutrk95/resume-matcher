import { newVerification } from '@/actions/verify-token';
import { NewVerificationForm } from '@/components/form/verify-token-form';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Verify Email',
};

export default async function NewVerificationPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const params = await searchParams;
  if (!params.token) redirect('/login');
  const data = await newVerification(params.token);

  return <NewVerificationForm data={data} />;
}

import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if the current user is an admin
  const admin = await currentAdmin();

  // If not an admin, redirect to home page
  if (!admin) {
    redirect('/');
  }

  return <div className="h-full">{children}</div>;
}

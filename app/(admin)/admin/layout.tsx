import { Metadata } from 'next';
import Link from 'next/link';
import { currentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogoutButton } from '../_components/logout-button';
import { FileUser } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing application resources',
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Double-check admin access
  const admin = await currentAdmin();
  if (!admin) {
    redirect('/');
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-4 flex flex-col h-full">
        <div className="text-xl font-bold mb-6">Admin Dashboard</div>
        <nav className="space-y-2">
          <Link href="/admin" className="block p-2 rounded hover:bg-slate-800 transition">
            Dashboard
          </Link>
          <Link href="/admin/prompts" className="block p-2 rounded hover:bg-slate-800 transition">
            Prompts
          </Link>
          <Link
            href="/admin/resume-templates"
            className="block p-2 rounded hover:bg-slate-800 transition"
          >
            Resume Templates
          </Link>
          <Link
            href="/admin/ai-requests"
            className="block p-2 rounded hover:bg-slate-800 transition"
          >
            AI Requests
          </Link>
          {/* Add more admin navigation links here */}
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-700 text-sm">
          <div className="mb-2">Logged in as: {admin.email}</div>
          <Link
            href="/home"
            className="flex items-center p-2 rounded hover:bg-slate-800 transition text-orange-500 mb-2"
          >
            <FileUser className="h-4 w-4 mr-2" />
            Application
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  );
}

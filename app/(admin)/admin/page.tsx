import { Metadata } from 'next';
import { currentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing application resources',
};

export default async function AdminDashboardPage() {
  // Double-check admin access
  const admin = await currentAdmin();
  if (!admin) {
    redirect('/');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Prompts Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Prompts</h2>
          <p className="text-gray-600 mb-4">Manage AI prompts and their variations</p>
          <a
            href="/admin/prompts"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Manage Prompts
          </a>
        </div>

        {/* Add more admin dashboard cards here */}
      </div>
    </div>
  );
}

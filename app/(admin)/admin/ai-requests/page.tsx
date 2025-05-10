import { Metadata } from 'next';
import { AIRequestDataTable } from '@/app/(admin)/admin/ai-requests/data-table';
import { getAllAIRequests } from '@/actions/admin/ai-requests/getAll';

export const metadata: Metadata = {
  title: 'AI Requests - Admin Dashboard',
  description: 'Manage AI requests in the admin dashboard',
};

export default async function AIRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const pageSize = sp.pageSize ? Number(sp.pageSize) : 10;
  const status = sp.status as string | undefined;
  const userId = sp.userId as string | undefined;
  const promptKey = sp.promptKey as string | undefined;
  const sortBy = (sp.sortBy as 'createdAt') || 'createdAt';
  const sortOrder = (sp.sortOrder as 'asc' | 'desc') || 'desc';

  const result = await getAllAIRequests({
    page,
    pageSize,
    status: status as any,
    userId,
    promptKey,
    sortBy,
    sortOrder,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">AI Requests</h1>
      </div>
      <div className="border rounded-md">
        <AIRequestDataTable data={result.data} pagination={result.pagination} />
      </div>
    </div>
  );
}

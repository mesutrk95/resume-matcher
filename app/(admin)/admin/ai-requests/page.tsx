import { Metadata } from 'next';
import { AIRequestDataTable } from './data-table';
import { getAllAIRequests } from '@/actions/admin/ai-requests/getAll';

export const metadata: Metadata = {
  title: 'AI Requests - Admin Dashboard',
  description: 'Manage AI requests in the admin dashboard',
};

export default async function AIRequestsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const pageSize = searchParams.pageSize ? Number(searchParams.pageSize) : 10;
  const status = searchParams.status as string | undefined;
  const userId = searchParams.userId as string | undefined;
  const promptKey = searchParams.promptKey as string | undefined;
  const sortBy = (searchParams.sortBy as 'createdAt') || 'createdAt';
  const sortOrder = (searchParams.sortOrder as 'asc' | 'desc') || 'desc';

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

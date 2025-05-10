import { Metadata } from 'next';
import Link from 'next/link';
import { getAllAIPrompts } from '@/actions/admin/prompt/getAll';
import { getAIPromptCategories } from '@/actions/admin/prompt/getCategories';
import { AIPromptStatus } from '@prisma/client';
import { PromptDeleteButton } from '@/app/(admin)/_components/prompt-delete-button';
import { PromptExportButton } from '@/app/(admin)/_components/prompt-export-button';
import { PromptImportButton } from '@/app/(admin)/_components/prompt-import-button';
import { Pencil, Layers } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'Admin - Prompts',
  description: 'Manage AI prompts',
};

export default async function AdminPromptsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: AIPromptStatus;
    category?: string;
  }>;
}) {
  // Parse pagination parameters
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;
  const limit = sp.limit ? parseInt(sp.limit) : 10;
  const status = sp.status;
  const category = sp.category;

  // Fetch prompts
  const { data: result } = (await getAllAIPrompts({
    page,
    limit,
    status,
    category,
  })) || { data: undefined };

  // Fetch categories
  const { data: categoryData } = (await getAIPromptCategories()) || { data: undefined };
  const categories = categoryData ? categoryData.map(cat => cat.name) : [];

  // If no result, show empty state
  if (!result) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">AI Prompts</h1>
        <p className="text-gray-500">Failed to load prompts</p>
      </div>
    );
  }

  const buildQueryString = (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.status) q.set('status', String(params.status));
    if (params.category) q.set('category', String(params.category));
    return q.toString() ? `?${q.toString()}` : '';
  };

  return (
    <TooltipProvider>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI Prompts</h1>
          <div className="flex gap-2">
            <PromptImportButton />
            <Link
              href="/admin/prompts/new"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Create New Prompt
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <div className="font-medium mb-1">Filter by Status:</div>
          <div className="flex gap-2 mb-4">
            <Link
              href={`/admin/prompts${buildQueryString({ category })}`}
              className={`px-3 py-1 rounded ${
                !status ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All
            </Link>
            {Object.values(AIPromptStatus).map(s => (
              <Link
                key={s}
                href={`/admin/prompts${buildQueryString({ status: s, category })}`}
                className={`px-3 py-1 rounded ${
                  status === s
                    ? s === AIPromptStatus.ACTIVE
                      ? 'bg-green-100 text-green-800'
                      : s === AIPromptStatus.DRAFT
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>

          {categories && categories.length > 0 && (
            <>
              <div className="font-medium mb-1">Filter by Category:</div>
              <div className="flex gap-2 flex-nowrap overflow-x-auto pb-2">
                <Link
                  href={`/admin/prompts${buildQueryString({ status })}`}
                  className={`px-2 py-1 text-xs rounded ${
                    !category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((c: string) => (
                  <Link
                    key={c}
                    href={`/admin/prompts${buildQueryString({ category: c, status })}`}
                    className={`px-2 py-1 text-xs rounded ${
                      category === c
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Prompts table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.prompts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No prompts found
                  </td>
                </tr>
              ) : (
                result.prompts.map(prompt => (
                  <tr key={prompt.key}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{prompt.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{prompt.key}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{prompt.category || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          prompt.status === AIPromptStatus.ACTIVE
                            ? 'bg-green-100 text-green-800'
                            : prompt.status === AIPromptStatus.DRAFT
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prompt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prompt._count.variations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/admin/prompts/${prompt.key}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil size={18} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>Edit Prompt</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/admin/prompts/${prompt.key}/variations`}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Layers size={18} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>View Variations</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <PromptExportButton promptKey={prompt.key} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Export Prompt</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <PromptDeleteButton
                                promptKey={prompt.key}
                                promptName={prompt.name}
                                status={prompt.status}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Delete Prompt</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {result.pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(result.pagination.page - 1) * result.pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(
                  result.pagination.page * result.pagination.limit,
                  result.pagination.totalCount,
                )}
              </span>{' '}
              of <span className="font-medium">{result.pagination.totalCount}</span> results
            </div>
            <div className="flex space-x-2">
              {result.pagination.hasPreviousPage && (
                <Link
                  href={`/admin/prompts${buildQueryString({
                    page: result.pagination.page - 1,
                    status,
                    category,
                  })}`}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Previous
                </Link>
              )}
              {result.pagination.hasNextPage && (
                <Link
                  href={`/admin/prompts${buildQueryString({
                    page: result.pagination.page + 1,
                    status,
                    category,
                  })}`}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

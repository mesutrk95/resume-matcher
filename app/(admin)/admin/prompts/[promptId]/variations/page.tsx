import { Metadata } from 'next';
import Link from 'next/link';
import { getAllAIPromptVariations } from '@/actions/admin/prompt/variations/getAll';
import { AIPromptVariationStatus } from '@prisma/client';
import { VariationDeleteButton } from '@/app/(admin)/_components/variation-delete-button';
import { Eye, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'Admin - Prompt Variations',
  description: 'Manage AI prompt variations',
};

export default async function AdminPromptVariationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ promptId: string }>;
  searchParams: Promise<{ page?: string; limit?: string; status?: AIPromptVariationStatus }>;
}) {
  // Parse pagination parameters
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;
  const limit = sp.limit ? parseInt(sp.limit) : 10;
  const status = sp.status;
  const { promptId } = await params;

  // Fetch variations
  const { data: result } = (await getAllAIPromptVariations({
    promptId,
    page,
    limit,
    status,
  })) || { data: undefined };

  // If no result, show empty state
  if (!result) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Prompt Variations</h1>
        <p className="text-gray-500">Failed to load variations</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin/prompts" className="text-blue-600 hover:text-blue-800">
              ← Back to Prompts
            </Link>
            <h1 className="text-2xl font-bold mt-2">Variations for: {result.promptInfo.name}</h1>
            <div className="text-sm text-gray-500">Prompt Key: {result.promptInfo.key}</div>
          </div>
          <Link
            href={`/admin/prompts/${promptId}/variations/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Create New Variation
          </Link>
        </div>

        {/* Status filter */}
        <div className="mb-6 flex gap-2">
          <Link
            href={`/admin/prompts/${promptId}/variations`}
            className={`px-3 py-1 rounded ${!status ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
          >
            All
          </Link>
          <Link
            href={`/admin/prompts/${promptId}/variations?status=ACTIVE`}
            className={`px-3 py-1 rounded ${
              status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
            }`}
          >
            Active
          </Link>
          <Link
            href={`/admin/prompts/${promptId}/variations?status=INACTIVE`}
            className={`px-3 py-1 rounded ${
              status === 'INACTIVE' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'
            }`}
          >
            Inactive
          </Link>
          <Link
            href={`/admin/prompts/${promptId}/variations?status=DRAFT`}
            className={`px-3 py-1 rounded ${
              status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
            }`}
          >
            Draft
          </Link>
          <Link
            href={`/admin/prompts/${promptId}/variations?status=DELETED`}
            className={`px-3 py-1 rounded ${
              status === 'DELETED' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
            }`}
          >
            Deleted
          </Link>
        </div>

        {/* Variations table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time (ms)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.variations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No variations found
                  </td>
                </tr>
              ) : (
                result.variations.map(variation => (
                  <tr key={variation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{variation.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          variation.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : variation.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : variation.status === 'INACTIVE'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {variation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variation._count.requests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variation.totalResponseTime > 0 && variation._count.requests > 0
                        ? Math.round(variation.totalResponseTime / variation._count.requests)
                        : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variation.totalTokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variation._count.requests > 0
                        ? `${Math.round(((variation._count.requests - variation.failureCount) / variation._count.requests) * 100)}%`
                        : '0%'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variation.user?.name || variation.user?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/admin/prompts/${promptId}/variations/${variation.id}`}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Pencil size={18} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>Edit Variation</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <VariationDeleteButton
                                variationId={variation.id}
                                status={variation.status}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Delete Variation</TooltipContent>
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
                  href={`/admin/prompts/${promptId}/variations?page=${
                    result.pagination.page - 1
                  }${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Previous
                </Link>
              )}
              {result.pagination.hasNextPage && (
                <Link
                  href={`/admin/prompts/${promptId}/variations?page=${
                    result.pagination.page + 1
                  }${status ? `&status=${status}` : ''}`}
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

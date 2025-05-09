import { Metadata } from 'next';
import Link from 'next/link';
import { getAllAIPrompts } from '@/actions/admin/prompt/getAll';
import { AIPromptStatus } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Admin - Prompts',
  description: 'Manage AI prompts',
};

export default async function AdminPromptsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string; status?: AIPromptStatus };
}) {
  // Parse pagination parameters
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 10;
  const status = searchParams.status;

  // Fetch prompts
  const { data: result } = (await getAllAIPrompts({
    page,
    limit,
    status,
  })) || { data: undefined };

  // If no result, show empty state
  if (!result) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">AI Prompts</h1>
        <p className="text-gray-500">Failed to load prompts</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Prompts</h1>
        <Link
          href="/admin/prompts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Create New Prompt
        </Link>
      </div>

      {/* Status filter */}
      <div className="mb-6 flex gap-2">
        <Link
          href="/admin/prompts"
          className={`px-3 py-1 rounded ${!status ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
        >
          All
        </Link>
        <Link
          href="/admin/prompts?status=ACTIVE"
          className={`px-3 py-1 rounded ${
            status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
          }`}
        >
          Active
        </Link>
        <Link
          href="/admin/prompts?status=DRAFT"
          className={`px-3 py-1 rounded ${
            status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
          }`}
        >
          Draft
        </Link>
        <Link
          href="/admin/prompts?status=DELETED"
          className={`px-3 py-1 rounded ${
            status === 'DELETED' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
          }`}
        >
          Deleted
        </Link>
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
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
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
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        prompt.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : prompt.status === 'DRAFT'
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
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/prompts/${prompt.key}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/prompts/${prompt.key}/variations`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Variations
                      </Link>
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
                href={`/admin/prompts?page=${result.pagination.page - 1}${
                  status ? `&status=${status}` : ''
                }`}
                className="px-3 py-1 border rounded text-sm"
              >
                Previous
              </Link>
            )}
            {result.pagination.hasNextPage && (
              <Link
                href={`/admin/prompts?page=${result.pagination.page + 1}${
                  status ? `&status=${status}` : ''
                }`}
                className="px-3 py-1 border rounded text-sm"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

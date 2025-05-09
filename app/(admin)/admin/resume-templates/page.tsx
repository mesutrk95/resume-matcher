import { Metadata } from 'next';
import Link from 'next/link';
import { getResumeTemplates } from '@/services/resume-template';
import Moment from 'react-moment';

export const metadata: Metadata = {
  title: 'Admin - Resume Templates',
  description: 'Manage Resume Templates',
};

export default async function AdminResumeTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  // Parse pagination parameters
  //   const page = searchParams.page ? parseInt(searchParams.page) : 1;
  //   const limit = searchParams.limit ? parseInt(searchParams.limit) : 10;

  // Fetch prompts
  const resumeTemplates = await getResumeTemplates();

  // If no result, show empty state
  if (!resumeTemplates) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Resume Templates</h1>
        <p className="text-gray-500">Failed to load resume templates</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resume Templates</h1>
        <Link
          href="/admin/resume-templates/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Create New Resume Template
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Id
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resumeTemplates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No resume templates found
                </td>
              </tr>
            ) : (
              resumeTemplates.map(rt => (
                <tr key={rt.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rt.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rt.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {/* <Moment format="MMM YYYY HH:mm">
                        {rt.updatedAt || rt.createdAt || new Date()}
                      </Moment> */}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/resume-templates/${rt.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
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
      {/* {result.pagination.totalPages > 1 && (
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
      )} */}
    </div>
  );
}

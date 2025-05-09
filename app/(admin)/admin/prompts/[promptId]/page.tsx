import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAIPrompt } from '@/actions/admin/prompt/get';
import { getAIPromptCategories } from '@/actions/admin/prompt/getCategories';
import { EditPromptForm } from '@/app/(admin)/_components/edit-prompt-form';

export const metadata: Metadata = {
  title: 'Admin - Edit Prompt',
  description: 'Edit AI prompt',
};

import { getAllAIPromptVariations } from '@/actions/admin/prompt/variations/getAll';

export default async function AdminEditPromptPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = await params;

  // Fetch prompt details
  let promptDetails;
  try {
    const promptResponse = await getAIPrompt(promptId);

    // The withErrorHandling wrapper returns an object with success, data, and error properties
    if (promptResponse.success && promptResponse.data) {
      promptDetails = promptResponse.data;
    } else {
      // If prompt not found or there was an error, redirect to prompts list
      console.error('Error fetching prompt:', promptResponse.error?.message || 'Prompt not found');
      return redirect('/admin/prompts');
    }
  } catch (error) {
    // Catch any unexpected errors during the fetch operation
    console.error('Exception fetching prompt:', error);
    return redirect('/admin/prompts');
  }

  // Double-check if promptDetails is available (should be caught by the logic above)
  if (!promptDetails) {
    return redirect('/admin/prompts');
  }

  // Fetch categories
  const { data: categoryData } = (await getAIPromptCategories()) || { data: undefined };
  const categories = categoryData ? categoryData.map(cat => cat.name) : [];

  // Fetch variations summary
  const { data: variationsData } = (await getAllAIPromptVariations({
    promptId,
    page: 1, // First page
    limit: 5, // Just get a few for the summary
  })) || { data: undefined };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/prompts" className="text-blue-600 hover:text-blue-800">
          ← Back to Prompts
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Prompt: {promptDetails.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <EditPromptForm promptDetails={promptDetails} categories={categories} />

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Prompt Variations</h2>
            <Link
              href={`/admin/prompts/${promptId}/variations`}
              className="text-blue-600 hover:text-blue-800"
            >
              View All Variations
            </Link>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            {promptDetails.variations?.length || 0} variation(s) available
          </div>

          {variationsData && variationsData.variations.length > 0 ? (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">Total Requests</div>
                  <div className="text-xl font-semibold">
                    {variationsData.variations.reduce(
                      (sum, v) => sum + (v._count?.requests || 0),
                      0,
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">Total Tokens</div>
                  <div className="text-xl font-semibold">
                    {variationsData.variations
                      .reduce((sum, v) => sum + (v.totalTokens || 0), 0)
                      .toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">Avg Success Rate</div>
                  <div className="text-xl font-semibold">
                    {(() => {
                      const totalRequests = variationsData.variations.reduce(
                        (sum, v) => sum + (v._count?.requests || 0),
                        0,
                      );
                      const totalFailures = variationsData.variations.reduce(
                        (sum, v) => sum + (v.failureCount || 0),
                        0,
                      );
                      return totalRequests > 0
                        ? `${Math.round(((totalRequests - totalFailures) / totalRequests) * 100)}%`
                        : '0%';
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Recent Variations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requests
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {variationsData.variations.slice(0, 3).map(variation => (
                        <tr key={variation.id}>
                          <td className="px-3 py-2 whitespace-nowrap">
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
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {variation._count.requests}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {variation._count.requests > 0
                              ? `${Math.round(((variation._count.requests - variation.failureCount) / variation._count.requests) * 100)}%`
                              : '0%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No variations data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

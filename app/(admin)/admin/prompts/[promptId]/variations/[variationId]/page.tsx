import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAIPromptVariation } from '@/actions/admin/prompt/variations/get';
import { EditVariationForm } from '@/app/(admin)/_components/edit-variation-form';

export const metadata: Metadata = {
  title: 'Admin - Edit Variation',
  description: 'Edit AI prompt variation',
};

export default async function AdminEditVariationPage({
  params,
}: {
  params: Promise<{ promptId: string; variationId: string }>;
}) {
  const { promptId, variationId } = await params;

  // Fetch variation details
  let variationDetails;
  try {
    const variationResponse = await getAIPromptVariation(variationId);

    // The withErrorHandling wrapper returns an object with success, data, and error properties
    if (variationResponse.success && variationResponse.data) {
      variationDetails = variationResponse.data;
    } else {
      // If variation not found or there was an error, redirect to variations list
      console.error(
        'Error fetching variation:',
        variationResponse.error?.message || 'Variation not found',
      );
      return redirect(`/admin/prompts/${promptId}/variations`);
    }
  } catch (error) {
    // Catch any unexpected errors during the fetch operation
    console.error('Exception fetching variation:', error);
    return redirect(`/admin/prompts/${promptId}/variations`);
  }

  // Double-check if variationDetails is available (should be caught by the logic above)
  if (!variationDetails) {
    return redirect(`/admin/prompts/${promptId}/variations`);
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/prompts/${promptId}/variations`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Variations
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Variation</h1>
        <div className="text-sm text-gray-500">ID: {variationId}</div>
      </div>

      <EditVariationForm variation={variationDetails} promptId={promptId} />

      {/* Variation Properties and Statistics */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Variation Properties and Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-gray-500">Total Requests</div>
            <div className="text-xl font-semibold">{variationDetails._count?.requests || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className="text-xl font-semibold">
              {variationDetails._count?.requests > 0
                ? `${Math.round(
                    ((variationDetails._count.requests - variationDetails.failureCount) /
                      variationDetails._count.requests) *
                      100,
                  )}%`
                : '0%'}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <div className="text-sm text-gray-500">Total Tokens</div>
            <div className="text-xl font-semibold">
              {variationDetails.totalTokens?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-3">General Information</h3>
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">ID</td>
                  <td className="py-2 text-sm text-gray-900">{variationDetails.id}</td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Status</td>
                  <td className="py-2 text-sm text-gray-900">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        variationDetails.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : variationDetails.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : variationDetails.status === 'INACTIVE'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {variationDetails.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Created By</td>
                  <td className="py-2 text-sm text-gray-900">
                    {variationDetails.user?.name ||
                      variationDetails.user?.email ||
                      variationDetails.createdBy ||
                      'Unknown'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Created At</td>
                  <td className="py-2 text-sm text-gray-900">
                    {new Date(variationDetails.createdAt).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Updated At</td>
                  <td className="py-2 text-sm text-gray-900">
                    {new Date(variationDetails.updatedAt).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-md font-medium mb-3">Performance Metrics</h3>
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Request Count</td>
                  <td className="py-2 text-sm text-gray-900">
                    {variationDetails._count?.requests || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Failure Count</td>
                  <td className="py-2 text-sm text-gray-900">
                    {variationDetails.failureCount || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Success Rate</td>
                  <td className="py-2 text-sm text-gray-900">
                    {variationDetails._count?.requests > 0
                      ? `${Math.round(
                          ((variationDetails._count.requests - variationDetails.failureCount) /
                            variationDetails._count.requests) *
                            100,
                        )}%`
                      : '0%'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Total Tokens</td>
                  <td className="py-2 text-sm text-gray-900">
                    {variationDetails.totalTokens?.toLocaleString() || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Prompt Tokens</td>
                  <td className="py-2 text-sm text-gray-900">
                    {variationDetails.promptTokens?.toLocaleString() || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Completion Tokens</td>
                  <td className="py-2 text-sm text-gray-900">
                    {variationDetails.completionTokens?.toLocaleString() || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">Avg Response Time</td>
                  <td className="py-2 text-sm text-gray-900">
                    {variationDetails.totalResponseTime > 0 && variationDetails._count?.requests > 0
                      ? `${Math.round(variationDetails.totalResponseTime / variationDetails._count.requests)} ms`
                      : '0 ms'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

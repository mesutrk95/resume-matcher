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

      {/* Usage Statistics */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Total Requests</div>
            <div className="text-xl font-semibold">{variationDetails._count?.requests || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Created By</div>
            <div>{variationDetails.createdBy || 'Unknown'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

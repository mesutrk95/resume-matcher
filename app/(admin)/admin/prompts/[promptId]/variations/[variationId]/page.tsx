import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAIPromptVariation } from '@/actions/admin/prompt/variations/get';
import { updateAIPromptVariation } from '@/actions/admin/prompt/variations/update';
import { deleteAIPromptVariation } from '@/actions/admin/prompt/variations/delete';
import { AIPromptVariationStatus } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Admin - Edit Variation',
  description: 'Edit AI prompt variation',
};

// Form component for editing a variation
function VariationForm({
  variation,
  promptId,
  variationId,
}: {
  variation: any;
  promptId: string;
  variationId: string;
}) {
  async function updateVariationAction(formData: FormData) {
    'use server';

    const userPrompt = formData.get('userPrompt') as string;
    const systemPrompt = formData.get('systemPrompt') as string;
    const status = formData.get('status') as AIPromptVariationStatus;

    await updateAIPromptVariation({
      id: variationId,
      userPrompt,
      systemPrompt,
      status,
    });

    // Redirect back to the variations list
    redirect(`/admin/prompts/${promptId}/variations`);
  }

  async function deleteVariationAction() {
    'use server';

    await deleteAIPromptVariation({
      id: variationId,
      permanent: false,
    });

    // Redirect back to the variations list
    redirect(`/admin/prompts/${promptId}/variations`);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form action={updateVariationAction}>
        <div className="space-y-4">
          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700">
              System Prompt
            </label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              rows={5}
              defaultValue={variation.systemPrompt}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="userPrompt" className="block text-sm font-medium text-gray-700">
              User Prompt
            </label>
            <textarea
              id="userPrompt"
              name="userPrompt"
              rows={5}
              defaultValue={variation.userPrompt}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={variation.status}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="DELETED">Deleted</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
              <Link
                href={`/admin/prompts/${promptId}/variations`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </Link>
            </div>

            <form action={deleteVariationAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={e => {
                  if (
                    !confirm(
                      'Are you sure you want to delete this variation? This action cannot be undone.',
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                Delete Variation
              </button>
            </form>
          </div>
        </div>
      </form>
    </div>
  );
}

export default async function AdminEditVariationPage({
  params,
}: {
  params: { promptId: string; variationId: string };
}) {
  const { promptId, variationId } = params;

  // Fetch variation details
  let variation;
  try {
    const variationResponse = await getAIPromptVariation(variationId);

    // Cast the variation to any to avoid TypeScript errors
    variation = variationResponse as any;

    // If variation not found, redirect to variations list
    if (!variation) {
      return redirect(`/admin/prompts/${promptId}/variations`);
    }
  } catch (error) {
    console.error('Error fetching variation:', error);
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

      <VariationForm variation={variation.data} promptId={promptId} variationId={variationId} />

      {/* Usage Statistics */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Total Requests</div>
            <div className="text-xl font-semibold">{variation.data._count?.requests || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Created By</div>
            <div>{variation.data.user?.name || variation.data.user?.email || 'Unknown'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

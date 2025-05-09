import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAIPrompt } from '@/actions/admin/prompt/get';
import { PromptDeleteButton } from '@/app/(admin)/_components/prompt-delete-button';

export const metadata: Metadata = {
  title: 'Admin - Edit Prompt',
  description: 'Edit AI prompt',
};
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

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/prompts" className="text-blue-600 hover:text-blue-800">
          ← Back to Prompts
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Prompt: {promptDetails.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <form action="/api/admin/prompts/update" method="POST">
            <input type="hidden" name="key" value={promptId} />

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={promptDetails.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={promptDetails.description || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  defaultValue={promptDetails.category || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={promptDetails.status}
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
                    href="/admin/prompts"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </Link>
                </div>

                <PromptDeleteButton
                  promptKey={promptId}
                  promptName={promptDetails.name}
                  status={promptDetails.status}
                />
              </div>
            </div>
          </form>
        </div>

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

          <div className="text-sm text-gray-500">
            {/* Display variation count if available */}
            {promptDetails.variations?.length || 0} variation(s) available
          </div>
        </div>
      </div>
    </div>
  );
}

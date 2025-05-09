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

          <div className="text-sm text-gray-500">
            {/* Display variation count if available */}
            {promptDetails.variations?.length || 0} variation(s) available
          </div>
        </div>
      </div>
    </div>
  );
}

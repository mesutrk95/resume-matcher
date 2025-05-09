import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAIPrompt } from '@/actions/admin/prompt/get';
import { CreateVariationForm } from '@/app/(admin)/_components/create-variation-form';

export const metadata: Metadata = {
  title: 'Admin - Create Prompt Variation',
  description: 'Create a new AI prompt variation',
};

export default async function AdminCreateVariationPage({
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
        <Link
          href={`/admin/prompts/${promptId}/variations`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Variations
        </Link>
        <h1 className="text-2xl font-bold mt-2">Create New Variation</h1>
        <div className="text-sm text-gray-500">For prompt: {promptDetails.name}</div>
      </div>

      <CreateVariationForm promptId={promptId} promptName={promptDetails.name} />
    </div>
  );
}

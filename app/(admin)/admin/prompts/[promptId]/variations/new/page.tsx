import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAIPrompt } from '@/actions/admin/prompt/get';
import { createAIPromptVariation } from '@/actions/admin/prompt/variations/create';

export const metadata: Metadata = {
  title: 'Admin - Create Prompt Variation',
  description: 'Create a new AI prompt variation',
};

// Form component for creating a prompt variation
function CreateVariationForm({ promptId, promptName }: { promptId: string; promptName: string }) {
  async function createVariationAction(formData: FormData) {
    'use server';

    const userPrompt = formData.get('userPrompt') as string;
    const systemPrompt = formData.get('systemPrompt') as string;

    await createAIPromptVariation({
      promptId,
      userPrompt,
      systemPrompt,
    });

    // Redirect back to the variations list
    redirect(`/admin/prompts/${promptId}/variations`);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form action={createVariationAction}>
        <div className="space-y-4">
          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700">
              System Prompt
            </label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              rows={5}
              placeholder="Instructions for the AI model"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              The system prompt provides context and instructions to the AI model.
            </p>
          </div>

          <div>
            <label htmlFor="userPrompt" className="block text-sm font-medium text-gray-700">
              User Prompt
            </label>
            <textarea
              id="userPrompt"
              name="userPrompt"
              rows={5}
              placeholder="The prompt that will be sent to the AI model"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              The user prompt is the actual prompt that will be sent to the AI model.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Create Variation
              </button>
              <Link
                href={`/admin/prompts/${promptId}/variations`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default async function AdminCreateVariationPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = await params;

  // Fetch prompt details
  let prompt;
  try {
    const promptResponse = await getAIPrompt(promptId);

    // Cast the prompt to any to avoid TypeScript errors
    prompt = promptResponse as any;

    // If prompt not found, redirect to prompts list
    if (!prompt) {
      return redirect('/admin/prompts');
    }
  } catch (error) {
    console.error('Error fetching prompt:', error);
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
        <div className="text-sm text-gray-500">For prompt: {prompt.name}</div>
      </div>

      <CreateVariationForm promptId={promptId} promptName={prompt.name} />
    </div>
  );
}

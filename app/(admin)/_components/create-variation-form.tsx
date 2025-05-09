'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAIPromptVariation } from '@/actions/admin/prompt/variations/create';
import { runAction } from '@/app/_utils/runAction';

interface CreateVariationFormProps {
  promptId: string;
  promptName: string;
}

export function CreateVariationForm({ promptId, promptName }: CreateVariationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFormError(null);

    const userPrompt = formData.get('userPrompt') as string;
    const systemPrompt = formData.get('systemPrompt') as string;

    const result = await runAction(
      createAIPromptVariation({
        promptId,
        userPrompt,
        systemPrompt,
      }),
      {
        successMessage: 'Variation created successfully',
        errorMessage: 'Failed to create variation',
      },
    );

    if (result.success) {
      // Navigate to the variations list on success
      router.push(`/admin/prompts/${promptId}/variations`);
    } else {
      // Display error message
      setFormError(result.error?.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {formError && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{formError}</div>}
      <form action={handleSubmit}>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Variation'}
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

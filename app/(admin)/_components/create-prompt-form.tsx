'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAIPrompt } from '@/actions/admin/prompt/create';
import { runAction } from '@/app/_utils/runAction';

interface CreatePromptFormProps {
  categories: string[];
}

export function CreatePromptForm({ categories }: CreatePromptFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFormError(null);

    const key = formData.get('key') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const jsonSchema = formData.get('jsonSchema') as string;

    const result = await runAction(
      createAIPrompt({
        key,
        name,
        description,
        category,
        jsonSchema,
      }),
      {
        successMessage: 'Prompt created successfully',
        errorMessage: 'Failed to create prompt',
      },
    );

    if (result.success) {
      // Navigate to the prompts list on success
      router.push('/admin/prompts');
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
            <label htmlFor="key" className="block text-sm font-medium text-gray-700">
              Key (Unique Identifier)
            </label>
            <input
              type="text"
              id="key"
              name="key"
              placeholder="e.g., resume_improvement"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Alphanumeric characters, underscores, and dashes only. This cannot be changed later.
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g., Resume Improvement"
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
              placeholder="Describe what this prompt is used for"
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
              list="category-suggestions"
              placeholder="e.g., resume, job, profile (or type new)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {categories.length > 0 && (
              <datalist id="category-suggestions">
                {categories.map((cat: string) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            )}
          </div>

          <div>
            <label htmlFor="jsonSchema" className="block text-sm font-medium text-gray-700">
              JSON Schema (Optional)
            </label>
            <textarea
              id="jsonSchema"
              name="jsonSchema"
              rows={5}
              placeholder="Enter JSON schema for prompt inputs"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              If this prompt requires structured JSON input, define the schema here.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Prompt'}
              </button>
              <Link
                href="/admin/prompts"
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

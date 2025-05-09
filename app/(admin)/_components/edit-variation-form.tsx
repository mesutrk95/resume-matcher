'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateAIPromptVariation } from '@/actions/admin/prompt/variations/update';
import { deleteAIPromptVariation } from '@/actions/admin/prompt/variations/delete';
import { runAction } from '@/app/_utils/runAction';
import { AIPromptVariationStatus, AIPromptStatus } from '@prisma/client';

interface VariationDetails {
  id: string;
  userPrompt: string | null;
  systemPrompt: string | null;
  status: AIPromptVariationStatus;
  promptId: string;
  _count?: {
    requests: number;
  };
  prompt?: {
    name: string;
    status: AIPromptStatus;
    key: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  totalResponseTime?: number;
}

interface EditVariationFormProps {
  variation: VariationDetails;
  promptId: string;
}

export function EditVariationForm({ variation, promptId }: EditVariationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFormError(null);

    const userPrompt = formData.get('userPrompt') as string;
    const systemPrompt = formData.get('systemPrompt') as string;
    const status = formData.get('status') as AIPromptVariationStatus;

    const result = await runAction(
      updateAIPromptVariation({
        id: variation.id,
        userPrompt,
        systemPrompt,
        status,
      }),
      {
        successMessage: 'Variation updated successfully',
        errorMessage: 'Failed to update variation',
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

  const handleDelete = async () => {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this variation? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setFormError(null);

    const result = await runAction(
      deleteAIPromptVariation({
        id: variation.id,
        permanent: false,
      }),
      {
        successMessage: 'Variation deleted successfully',
        errorMessage: 'Failed to delete variation',
      },
    );

    if (result.success) {
      // Navigate to the variations list on success
      router.push(`/admin/prompts/${promptId}/variations`);
    } else {
      // Display error message
      setFormError(result.error?.message || 'An unexpected error occurred');
      setIsDeleting(false);
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
              defaultValue={variation.systemPrompt || ''}
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
              defaultValue={variation.userPrompt || ''}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/admin/prompts/${promptId}/variations`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </Link>
            </div>

            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Variation'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

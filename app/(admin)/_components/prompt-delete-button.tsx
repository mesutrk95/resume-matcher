'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import { deleteAIPrompt } from '@/actions/admin/prompt/delete';
import { useRouter } from 'next/navigation';
import { runAction } from '@/app/_utils/runAction';
import { AIPromptStatus } from '@prisma/client';

interface PromptDeleteButtonProps {
  promptKey: string;
  promptName: string;
  status: AIPromptStatus;
}

export function PromptDeleteButton({ promptKey, promptName, status }: PromptDeleteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const isDraft = status === AIPromptStatus.DRAFT;

  const handleDelete = async (permanent: boolean) => {
    try {
      setIsDeleting(true);

      const result = await runAction(
        deleteAIPrompt({
          key: promptKey,
          permanent,
        }),
        {
          successMessage: permanent
            ? `Prompt "${promptName}" permanently deleted`
            : `Prompt "${promptName}" marked as deleted`,
          errorMessage: 'Failed to delete prompt',
        },
      );

      if (result.success) {
        router.refresh();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 hover:bg-red-100"
        type="button"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Prompt"
        description={`Are you sure you want to delete the prompt "${promptName}"? ${
          isDraft
            ? 'Since this prompt is in DRAFT status, you can choose to delete it permanently.'
            : 'This will mark the prompt as deleted but not remove it from the database.'
        }`}
        isDraft={isDraft}
      />
    </>
  );
}

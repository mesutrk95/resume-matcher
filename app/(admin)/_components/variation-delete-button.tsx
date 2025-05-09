'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import { deleteAIPromptVariation } from '@/actions/admin/prompt/variations/delete';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AIPromptVariationStatus } from '@prisma/client';

interface VariationDeleteButtonProps {
  variationId: string;
  status: AIPromptVariationStatus;
}

export function VariationDeleteButton({ variationId, status }: VariationDeleteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const isDraft = status === AIPromptVariationStatus.DRAFT;

  const handleDelete = async (permanent: boolean) => {
    try {
      setIsDeleting(true);
      const result = await deleteAIPromptVariation({
        id: variationId,
        permanent,
      });

      if (result.success && result.data) {
        toast.success(result.data.message);
        router.refresh();
      } else {
        toast.error(result.error?.message || 'Failed to delete variation');
      }
    } catch (error) {
      console.error('Error deleting variation:', error);
      toast.error('An error occurred while deleting the variation');
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
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
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Variation"
        description={`Are you sure you want to delete this variation? ${
          isDraft
            ? 'Since this variation is in DRAFT status, you can choose to delete it permanently.'
            : 'This will mark the variation as deleted but not remove it from the database.'
        }`}
        isDraft={isDraft}
      />
    </>
  );
}

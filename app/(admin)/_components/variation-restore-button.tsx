'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { restoreAIPromptVariation } from '@/actions/admin/prompt/variations/restore';
import { useRouter } from 'next/navigation';
import { runAction } from '@/app/_utils/runAction';
import { toast } from 'sonner';

interface VariationRestoreButtonProps {
  variationId: string;
}

export function VariationRestoreButton({ variationId }: VariationRestoreButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    try {
      setIsRestoring(true);

      const result = await runAction(restoreAIPromptVariation({ id: variationId }), {
        successMessage: `Variation restored to DRAFT status.`,
        errorMessage: 'Failed to restore variation.',
      });

      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error restoring variation:', error);
      toast.error('An unexpected error occurred while restoring the variation.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRestore}
      disabled={isRestoring}
      className="text-green-600 hover:text-green-800 hover:bg-green-100"
      type="button"
    >
      <Undo2 className="h-4 w-4" />
    </Button>
  );
}

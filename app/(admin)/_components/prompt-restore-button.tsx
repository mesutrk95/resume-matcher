'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react'; // Using Undo2 icon for restore
import { restoreAIPrompt } from '@/actions/admin/prompt/restore';
import { useRouter } from 'next/navigation';
import { runAction } from '@/app/_utils/runAction';
import { toast } from 'sonner';

interface PromptRestoreButtonProps {
  promptKey: string;
  promptName: string;
}

export function PromptRestoreButton({ promptKey, promptName }: PromptRestoreButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    try {
      setIsRestoring(true);

      const result = await runAction(restoreAIPrompt({ key: promptKey }), {
        successMessage: `Prompt "${promptName}" restored to DRAFT status.`,
        errorMessage: 'Failed to restore prompt.',
      });

      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error restoring prompt:', error);
      toast.error('An unexpected error occurred while restoring the prompt.');
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

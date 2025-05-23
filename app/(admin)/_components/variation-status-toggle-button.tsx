'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateAIPromptVariationStatus } from '@/actions/admin/prompt/variations/updateStatus';
import { toast } from 'sonner';
import { AIPromptVariationStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface VariationStatusToggleButtonProps {
  variationId: string;
  variationName: string; // For user-friendly messages, e.g., the first few words of the content
  currentStatus: AIPromptVariationStatus;
}

export function VariationStatusToggleButton({
  variationId,
  variationName,
  currentStatus,
}: VariationStatusToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const targetStatus =
    currentStatus === AIPromptVariationStatus.ACTIVE
      ? AIPromptVariationStatus.INACTIVE
      : AIPromptVariationStatus.ACTIVE;

  const buttonText =
    currentStatus === AIPromptVariationStatus.ACTIVE ? 'Make Inactive' : 'Make Active';

  const handleToggleStatus = async () => {
    startTransition(async () => {
      toast.loading(`Updating status for variation "${variationName}"...`);
      const result = await updateAIPromptVariationStatus(variationId, targetStatus);

      if (result.success && result.updatedVariation) {
        toast.success(
          result.message ||
            `Variation "${variationName}" status updated to ${result.updatedVariation.status}.`,
        );
        router.refresh(); // Refresh to show the new status
      } else {
        toast.error(result.message || `Failed to update status for "${variationName}".`);
      }
    });
  };

  // Only allow toggling for ACTIVE or INACTIVE statuses with this button
  if (
    currentStatus !== AIPromptVariationStatus.ACTIVE &&
    currentStatus !== AIPromptVariationStatus.INACTIVE
  ) {
    return null; // Or a disabled button with a tooltip explaining why
  }

  return (
    <Button onClick={handleToggleStatus} disabled={isPending} variant="outline" size="sm">
      {isPending ? 'Updating...' : buttonText}
    </Button>
  );
}

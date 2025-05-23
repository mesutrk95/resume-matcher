'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { publishPrompt } from '@/actions/admin/prompt/publish';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; // To potentially refresh data or navigate

interface PromptPublishButtonProps {
  promptKey: string;
  promptName: string; // For user-friendly messages
  hasVariations: boolean;
  currentStatus: string; // To avoid showing publish if already published (e.g., 'ACTIVE')
}

export function PromptPublishButton({
  promptKey,
  promptName,
  hasVariations,
  currentStatus,
}: PromptPublishButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePublish = async () => {
    startTransition(async () => {
      toast.loading(`Publishing prompt "${promptName}"...`);
      const result = await publishPrompt(promptKey);
      if (result.success) {
        toast.success(result.message || `Prompt "${promptName}" published successfully!`);
        // Optionally, refresh the page or specific parts if needed
        // router.refresh(); // This re-fetches server components
      } else {
        toast.error(result.message || `Failed to publish prompt "${promptName}".`);
      }
    });
  };

  if (!hasVariations) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Cannot publish: Prompt has no variations."
      >
        Publish
      </Button>
    );
  }

  if (currentStatus === 'ACTIVE') {
    return (
      <Button variant="outline" size="sm" disabled title="Prompt is already active.">
        Publish
      </Button>
    );
  }

  return (
    <Button onClick={handlePublish} disabled={isPending} variant="default" size="sm">
      {isPending ? 'Publishing...' : 'Publish Prompt'}
    </Button>
  );
}

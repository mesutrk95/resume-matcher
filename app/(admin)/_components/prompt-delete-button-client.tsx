'use client';

import { Button } from '@/components/ui/button'; // Assuming you have a Button component

interface PromptDeleteButtonClientProps {
  promptId: string;
  promptName?: string; // Optional: for a more specific confirmation message
}

export function PromptDeleteButtonClient({ promptId, promptName }: PromptDeleteButtonClientProps) {
  const handleDelete = () => {
    const confirmationMessage = promptName
      ? `Are you sure you want to delete the prompt "${promptName}"? This action cannot be undone.`
      : 'Are you sure you want to delete this prompt? This action cannot be undone.';

    if (confirm(confirmationMessage)) {
      window.location.href = `/api/admin/prompts/delete?key=${promptId}`;
    }
  };

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDelete}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition" // Keeping original class for now
    >
      Delete Prompt
    </Button>
  );
}

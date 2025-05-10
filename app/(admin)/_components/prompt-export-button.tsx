'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportAIPrompt } from '@/actions/admin/prompt/export';
import { toast } from 'sonner';

interface PromptExportButtonProps {
  promptKey: string;
}

export const PromptExportButton = ({ promptKey }: PromptExportButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const response = await exportAIPrompt({ key: promptKey });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to export prompt');
      }

      // Create a blob from the JSON data
      const blob = new Blob([response.data], { type: 'application/json' });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-${promptKey}.json`;

      // Trigger the download
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Prompt exported successfully');
    } catch (error) {
      console.error('Error exporting prompt:', error);
      toast.error('Failed to export prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isLoading} variant="ghost" size="sm">
      <Download className="h-4 w-4" />
    </Button>
  );
};

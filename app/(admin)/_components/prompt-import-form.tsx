'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { importAIPrompt } from '@/actions/admin/prompt/import';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const PromptImportForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setIsLoading(true);

      // Read the file content
      const fileContent = await readFileAsText(file);

      // Import the prompt
      const response = await importAIPrompt({ promptJson: fileContent });

      toast.success('Prompt imported successfully');

      // Navigate to the imported prompt page
      if (response && typeof response === 'object' && 'key' in response) {
        router.push(`/admin/prompts/${response.key}`);
      }
    } catch (error) {
      console.error('Error importing prompt:', error);
      toast.error('Failed to import prompt');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Import Prompt</CardTitle>
        <CardDescription>
          Import a prompt from a JSON file. If a prompt with the same key exists, it will be
          updated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="prompt-file" className="text-sm font-medium">
              Prompt JSON File
            </label>
            <input
              id="prompt-file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleImport} disabled={isLoading || !file}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </CardFooter>
    </Card>
  );
};

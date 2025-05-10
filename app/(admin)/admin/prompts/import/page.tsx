import { PromptImportForm } from '@/app/(admin)/_components/prompt-import-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImportPromptPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Import Prompt</h1>
      <PromptImportForm />
    </div>
  );
}

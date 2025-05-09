import { Metadata } from 'next';
import Link from 'next/link';
import { getAIPromptCategories } from '@/actions/admin/prompt/getCategories';
import { CreatePromptForm } from '@/app/(admin)/_components/create-prompt-form';

export const metadata: Metadata = {
  title: 'Admin - Create Prompt',
  description: 'Create a new AI prompt',
};

export default async function AdminCreatePromptPage() {
  // Fetch categories for the form
  const { data: categoryData } = (await getAIPromptCategories()) || { data: undefined };
  const categories = categoryData ? categoryData.map(cat => cat.name) : [];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/prompts" className="text-blue-600 hover:text-blue-800">
          ← Back to Prompts
        </Link>
        <h1 className="text-2xl font-bold mt-2">Create New Prompt</h1>
      </div>

      <CreatePromptForm categories={categories} />
    </div>
  );
}

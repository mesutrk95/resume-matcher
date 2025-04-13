'use client';

import { LoadingButton } from '../ui/loading-button';
import { Plus } from 'lucide-react';
import { createResumeTemplate } from '@/actions/resume-template';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CreateNewTemplateForm({ blank }: { blank?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewResumeTemplate = async () => {
    startTransition(() => {
      createResumeTemplate()
        .then(data => {
          const templateId = data?.id;
          router.push('/templates/' + templateId);
          toast.success('Resume template successfully created!');
        })
        .catch(err => toast.error(err?.toString() || 'Something went wrong.'));
    });
  };

  return (
    <LoadingButton
      loading={isPending}
      loadingText="Creating Resume Template..."
      disabled={isPending}
      onClick={handleCreateNewResumeTemplate}
    >
      <Plus className="mr-2 h-4 w-4" />
      {blank ? 'Create Blank Template' : 'Create Resume Template'}
    </LoadingButton>
  );
}

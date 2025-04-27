'use client';

import { LoadingButton } from '../ui/loading-button';
import { Plus } from 'lucide-react';
import { createCareerProfile } from '@/actions/career-profiles';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { runAction } from '@/app/_utils/runAction';

export function CreateNewCareerProfileForm({ blank }: { blank?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = async () => {
    startTransition(async () => {
      const result = await runAction(createCareerProfile(), {
        successMessage: 'Career Profile successfully created!',
        errorMessage: 'Failed to create career profile!',
      });

      if (result.success && result.data) {
        const templateId = result.data.id;
        router.push('/career-profiles/' + templateId);
      }
    });
  };

  return (
    <LoadingButton
      loading={isPending}
      loadingText="Creating Career Profile ..."
      disabled={isPending}
      onClick={handleCreate}
    >
      <Plus className="mr-2 h-4 w-4" />
      {blank ? 'Create Blank Profile' : 'Create Career Profile'}
    </LoadingButton>
  );
}

'use client';

import { LoadingButton } from '../ui/loading-button';
import { Plus } from 'lucide-react';
import { createCareerProfile } from '@/actions/career-profiles';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CreateNewCareerProfileForm({ blank }: { blank?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = async () => {
    startTransition(() => {
      createCareerProfile()
        .then(data => {
          if (!data.data) {
            toast.error('Failed to create career profile!');
            return;
          }
          const templateId = data?.data.id;
          router.push('/career-profiles/' + templateId);
          toast.success('Career Profile successfully created!');
        })
        .catch(err => toast.error(err?.toString() || 'Something went wrong.'));
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

'use client';

import { LoadingButton } from '@/components/ui/loading-button';
import { trpc } from '@/providers/trpc';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const CreateResumeButton = ({
  jobId,
  careerProfileId,
}: {
  jobId?: string;
  careerProfileId?: string;
}) => {
  const createJobResume = trpc.jobResume.createJobResume.useMutation();
  const router = useRouter();
  const handleCreateBlankResume = async () => {
    // don't wait directly create resume of the career profile!

    const jobResumeResult = await createJobResume.mutateAsync({
      careerProfileId,
      jobId,
    });
    router.push(`/resumes/${jobResumeResult.id}/builder`);
    toast.success('Resume created successfully!');
  };

  return (
    <LoadingButton
      className="flex gap-2 items-center"
      onClick={handleCreateBlankResume}
      loading={createJobResume.isPending}
      loadingText="Creating Resume ..."
    >
      {!careerProfileId ? (
        <>
          <Plus />
          Create Blank Resume
        </>
      ) : (
        'Use This Career Profile'
      )}
    </LoadingButton>
  );
};

'use client';

import { createJobResume } from '@/actions/job-resume';
import { runAction } from '@/app/_utils/runAction';
import { LoadingButton } from '@/components/ui/loading-button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';

export const CreateResumeButton = ({
  jobId,
  careerProfileId,
}: {
  jobId?: string;
  careerProfileId?: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleCreateBlankResume = () => {
    startTransition(async () => {
      // Call the Server Action to create the ResumeJob
      const result = await runAction(createJobResume(careerProfileId, jobId), {
        successMessage: 'Resume created successfully!',
        errorMessage: 'Failed to create resume',
      });

      if (result.success && result.data) {
        // Redirect to the edit page
        router.push(`/resumes/${result.data.id}/builder`);
      }
    });
  };

  return (
    <LoadingButton
      className="flex gap-2 items-center"
      onClick={handleCreateBlankResume}
      loading={isPending}
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

'use client';

import { createCareerProfile } from '@/actions/career-profiles';
import { LoadingButton } from '@/components/ui/loading-button';
import { ResumeContent } from '@/types/resume';
import { MousePointerClick } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { toast } from 'sonner';

export const CreateCareerProfileButton = ({
  jobId,
  resumeContent,
  disabled,
}: {
  jobId?: string;
  resumeContent: ResumeContent;
  disabled?: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handleCreateBlankResume = () => {
    startTransition(async () => {
      try {
        // Call the Server Action to create the ResumeJob
        const result = await createCareerProfile(resumeContent, resumeContent.titles?.[0]?.content);
        if (!result.data) {
          toast.error('Failed to create career profile!');
          return;
        }
        if (result) {
          // Redirect to the edit page
          router.push(`/career-profiles/${result?.data.id}`);
        } else {
          toast.error('Failed to create career profile!');
        }
      } catch (error) {
        toast.error('Something went wrong!');
      }
    });
  };

  return (
    <LoadingButton
      className="flex gap-2 items-center"
      onClick={handleCreateBlankResume}
      loading={isPending}
      loadingText="Creating Career Profile ..."
      disabled={disabled}
    >
      <MousePointerClick />
      Use this Career Profile
    </LoadingButton>
  );
};

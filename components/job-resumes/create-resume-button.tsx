"use client";

import { createJobResume } from "@/actions/job-resume";
import { LoadingButton } from "@/components/ui/loading-button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";

export const CreateResumeButton = ({
  jobId,
  resumeTemplateId,
}: {
  jobId?: string;
  resumeTemplateId?: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleCreateBlankResume = () => {
    startTransition(async () => {
      try {
        // Call the Server Action to create the ResumeJob
        const result = await createJobResume(resumeTemplateId, jobId);

        if (result) {
          // Redirect to the edit page
          router.push(`/resumes/${result?.id}/builder`);
        } else {
          toast.error("Failed to create resume");
        }
      } catch (error) {
        toast.error("Something went wrong");
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
      {!resumeTemplateId ? (
        <>
          <Plus />
          Create Blank Resume
        </>
      ) : (
        "Use This Template"
      )}
    </LoadingButton>
  );
};

"use client";

import { createJobResume } from "@/actions/job-resume";
import { createResumeTemplate } from "@/actions/resume-template";
import { LoadingButton } from "@/components/ui/loading-button";
import { ResumeContent } from "@/types/resume";
import { MousePointerClick, Pointer } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";

export const CreateTemplateButton = ({
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
        const result = await createResumeTemplate(
          resumeContent,
          resumeContent.titles?.[0]?.content
        );
        if (result) {
          // Redirect to the edit page
          router.push(`/templates/${result?.id}`);
        } else {
          toast.error("Failed to create resume template!");
        }
      } catch (error) {
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <LoadingButton
      className="flex gap-2 items-center"
      onClick={handleCreateBlankResume}
      loading={isPending}
      loadingText="Creating Resume ..."
      disabled={disabled}
    >
      <MousePointerClick />
      Use this Template
    </LoadingButton>
  );
};

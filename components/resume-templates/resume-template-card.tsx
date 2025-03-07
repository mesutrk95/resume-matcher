"use client";

import { ResumeTemplate } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { createJobResume } from "@/actions/job-resume";
import { useRouter } from "next/navigation";
import { LoadingButton } from "../ui/loading-button";

import { format } from "date-fns"; 

interface ResumeTemplateCardProps {
  template: ResumeTemplate;
  jobId: string;
}

export function ResumeTemplateCard({
  template,
  jobId,
}: ResumeTemplateCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateResume = () => {
    startTransition(async () => {
      try {
        // Call the Server Action to create the ResumeJob
        const result = await createJobResume(jobId, template.id);

        if (result) {
          // Redirect to the edit page
          router.push(`/resumes/${result?.id}`);
        } else {
          toast.error("Failed to create resume");
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-5">
      <div>
        <h3 className="text-lg font-semibold">{template.name}</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Last updated at {format(template.updatedAt, "yyyy/MM/dd HH:mm")}
        </p>
      </div>
      <LoadingButton
        onClick={handleCreateResume}
        disabled={isPending}
        loadingText="Creating..."
        loading={isPending}
        className="w-full"
      >
        Use This Template
      </LoadingButton>
    </div>
  );
}

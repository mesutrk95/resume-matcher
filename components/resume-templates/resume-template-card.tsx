"use client";

import { ResumeTemplate } from "@prisma/client";
import { useTransition } from "react";
import { toast } from "sonner";
import { createJobResume } from "@/actions/job-resume";
import { useRouter } from "next/navigation";
import { LoadingButton } from "../ui/loading-button";

import Moment from "react-moment";
import { Card, CardContent } from "../ui/card";

interface ResumeTemplateCardProps {
  template?: ResumeTemplate;
  jobId?: string;
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
        const result = await createJobResume(template?.id, jobId);

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

  if (!template) {
    return (
      <Card className="p-0 ">
        <CardContent className="h-[180px] space-y-5 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold">Blank Resume</h3>
            <p className="text-sm text-muted-foreground">
              Start making a new resume, without any content.
            </p>
          </div>
          <LoadingButton
            onClick={handleCreateResume}
            disabled={isPending}
            loadingText="Creating Resume ..."
            loading={isPending}
            className="w-full"
          >
            Create Blank Resume
          </LoadingButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <CardContent className="h-[180px] space-y-5 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated at{" "}
            <Moment date={template.updatedAt} format="yyyy/MM/DD HH:mm" utc />
          </p>
        </div>
        <LoadingButton
          onClick={handleCreateResume}
          disabled={isPending}
          loadingText="Creating Resume ..."
          loading={isPending}
          className="w-full"
        >
          Use This Template
        </LoadingButton>
      </CardContent>
    </Card>
  );
}

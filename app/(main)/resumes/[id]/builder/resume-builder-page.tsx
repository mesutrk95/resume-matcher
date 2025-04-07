"use client";

import React from "react";
import { updateJobResume } from "@/actions/job-resume";
import { ResumeBuilderProvider } from "@/components/job-resumes/resume-builder/context/ResumeBuilderProvider";
import { ResumeAnalyzeResults, ResumeContent } from "@/types/resume";
import { Job, JobResume } from "@prisma/client";
import { JobMatcher } from "./JobMatcher";
import { toast } from "sonner";

export const ResumeBuilderPage = ({
  jobResume,
}: {
  jobResume: JobResume & { job: Job | null };
}) => {
  const handleUpdate = async (resume: ResumeContent) => {
    const result = await updateJobResume({ id: jobResume.id, content: resume });
    if (!result.success) {
      console.log(result.error);
      toast.error(
        result.error?.message ||
          "Something went wrong when saving the resume changes."
      );
    }
  };

  return (
    <ResumeBuilderProvider
      initialResume={jobResume.content as ResumeContent}
      initialResumeAnalyzeResults={
        jobResume.analyzeResults as ResumeAnalyzeResults
      }
      onUpdated={handleUpdate}
    >
      <JobMatcher jobResume={jobResume} job={jobResume.job}></JobMatcher>
    </ResumeBuilderProvider>
  );
};

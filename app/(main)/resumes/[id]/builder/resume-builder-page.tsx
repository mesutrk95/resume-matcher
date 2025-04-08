"use client";

import React from "react";
import { updateJobResume } from "@/actions/job-resume";
import { ResumeBuilderProvider } from "@/components/job-resumes/resume-builder/context/ResumeBuilderProvider";
import {
  ResumeAnalyzeResults,
  ResumeContent,
  ResumeDesign,
} from "@/types/resume";
import { Job, JobResume } from "@prisma/client";
import { JobMatcher } from "./JobMatcher";
import { runAction } from "@/app/_utils/runAction";

export const ResumeBuilderPage = ({
  jobResume,
}: {
  jobResume: JobResume & { job: Job | null };
}) => {
  const handleUpdate = async (resume: ResumeContent) => {
    await runAction(updateJobResume, {
      id: jobResume.id,
      content: resume,
    });
  };
  const handleDesignUpdate = async (design: ResumeDesign) => {
    await runAction(updateJobResume, {
      id: jobResume.id,
      design,
    });
  };

  return (
    <ResumeBuilderProvider
      initialResume={jobResume.content as ResumeContent}
      initialDesign={jobResume.design as ResumeDesign}
      initialResumeAnalyzeResults={
        jobResume.analyzeResults as ResumeAnalyzeResults
      }
      onUpdated={handleUpdate}
      onDesignUpdated={handleDesignUpdate}
    >
      <JobMatcher jobResume={jobResume} job={jobResume.job} />
    </ResumeBuilderProvider>
  );
};

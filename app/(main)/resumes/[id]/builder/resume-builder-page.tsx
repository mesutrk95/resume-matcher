'use client';

import React from 'react';
import { ResumeBuilderProvider } from '@/components/job-resumes/resume-builder/context/ResumeBuilderProvider';
import { ResumeAnalyzeResults, ResumeContent } from '@/types/resume';
import { Job, JobResume, ResumeTemplate } from '@prisma/client';
import { JobMatcher } from './JobMatcher';
import { trpc } from '@/providers/trpc';

export const ResumeBuilderPage = ({
  jobResume,
  resumeTemplate,
}: {
  jobResume: JobResume & { job: Job | null };
  resumeTemplate: ResumeTemplate | null;
}) => {
  const updateJobResume = trpc.jobResume.updateJobResume.useMutation();

  const handleUpdate = async (resume: ResumeContent) => {
    updateJobResume.mutateAsync({ jobResumeId: jobResume.id, content: resume });
  };

  const handleResumeTemplateUpdated = async (template: ResumeTemplate) => {
    updateJobResume.mutateAsync({ jobResumeId: jobResume.id, templateId: template.id });
  };

  return (
    <ResumeBuilderProvider
      initialResume={jobResume.content as ResumeContent}
      initialResumeTemplate={resumeTemplate}
      initialResumeAnalyzeResults={jobResume.analyzeResults as ResumeAnalyzeResults}
      onUpdated={handleUpdate}
      onResumeTemplateUpdated={handleResumeTemplateUpdated}
    >
      <JobMatcher jobResume={jobResume} job={jobResume.job} />
    </ResumeBuilderProvider>
  );
};

'use client';

import React from 'react';
import { updateJobResume } from '@/actions/job-resume';
import { ResumeBuilderProvider } from '@/components/job-resumes/resume-builder/context/ResumeBuilderProvider';
import { ResumeAnalyzeResults, ResumeContent } from '@/types/resume';
import { Job, JobResume } from '@prisma/client';
import { JobMatcher } from './JobMatcher';
import { runAction } from '@/app/_utils/runAction';
import { ResumeTemplate } from '@/types/resume-template';
import { DEFAULT_RESUME_TEMPLATE } from '@/components/job-resumes/resume-renderer/default-resume-template';

export const ResumeBuilderPage = ({
  jobResume,
}: {
  jobResume: JobResume & { job: Job | null };
}) => {
  const handleUpdate = async (resume: ResumeContent) => {
    await runAction(
      updateJobResume,
      {
        successMessage: 'Resume updated successfully',
      },
      {
        id: jobResume.id,
        content: resume,
      },
    );
  };
  const handleResumeTemplateUpdated = async (template: ResumeTemplate) => {
    await runAction(
      updateJobResume,
      {
        successMessage: 'Resume template updated successfully',
      },
      {
        id: jobResume.id,
        template,
      },
    );
  };

  return (
    <ResumeBuilderProvider
      initialResume={jobResume.content as ResumeContent}
      initialResumeTemplate={(jobResume.template || DEFAULT_RESUME_TEMPLATE) as ResumeTemplate}
      initialResumeAnalyzeResults={jobResume.analyzeResults as ResumeAnalyzeResults}
      onUpdated={handleUpdate}
      onResumeTemplateUpdated={handleResumeTemplateUpdated}
    >
      <JobMatcher jobResume={jobResume} job={jobResume.job} />
    </ResumeBuilderProvider>
  );
};

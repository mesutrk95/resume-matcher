'use client';

import { updateResumeTemplate } from '@/actions/resume-template';
import { runAction } from '@/app/_utils/runAction';
import { ResumeBuilder } from '@/components/job-resumes/resume-builder';
import { ResumeBuilderProvider } from '@/components/job-resumes/resume-builder/context/ResumeBuilderProvider';
import { ImportExportBar } from '@/components/resume-templates/import-export-bar';
import { ResumeTemplateForm } from '@/components/resume-templates/resume-template-form';
import { ResumeContent } from '@/types/resume';
import { ResumeTemplate } from '@prisma/client';
import React from 'react';

export const ResumeTemplatePage = ({ resumeTemplate }: { resumeTemplate: ResumeTemplate }) => {
  const handleResumeUpdate = async (resumeContent: ResumeContent) => {
    await runAction(updateResumeTemplate, {
      ...resumeTemplate,
      content: resumeContent,
    });
  };
  return (
    <>
      <ResumeTemplateForm template={resumeTemplate} />
      <ResumeBuilderProvider
        initialResume={resumeTemplate.content as ResumeContent}
        initialDesign={null}
        onUpdated={handleResumeUpdate}
      >
        <ResumeBuilder />
      </ResumeBuilderProvider>

      <ImportExportBar resumeTemplate={resumeTemplate} />
    </>
  );
};

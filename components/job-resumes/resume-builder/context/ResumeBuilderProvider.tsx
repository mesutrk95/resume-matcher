'use client';

import { ResumeAnalyzeResults, ResumeContent } from '@/types/resume';
import { ResumeTemplate } from '@prisma/client';
// import { migrateResumeContent } from '@/utils/resume-migration';
import React, { createContext, useState } from 'react';

export type ICareerProfileEditor = {
  scheme?: 'cards' | 'accordion';

  resume: ResumeContent;
  saveResume: (resume: ResumeContent) => void;

  resumeTemplate: ResumeTemplate | null;
  saveResumeTemplate: (resumeTemplate: ResumeTemplate) => void;

  resumeAnalyzeResults?: ResumeAnalyzeResults;
  setResumeAnalyzeResults: React.Dispatch<React.SetStateAction<ResumeAnalyzeResults | undefined>>;
};

export const ResumeBuilderContext = createContext<ICareerProfileEditor>({
  scheme: 'cards',
} as ICareerProfileEditor);

export const ResumeBuilderProvider = ({
  children,
  initialResume,
  initialResumeTemplate,
  initialResumeAnalyzeResults,
  scheme,
  onUpdated,
  onResumeTemplateUpdated,
}: {
  children: React.ReactNode;
  initialResume: ResumeContent;
  initialResumeTemplate: ResumeTemplate | null;
  initialResumeAnalyzeResults?: ResumeAnalyzeResults;
  scheme?: 'cards' | 'accordion';
  onUpdated?: (resume: ResumeContent) => void;
  onResumeTemplateUpdated?: (t: ResumeTemplate) => void;
}) => {
  // const migratedResume = migrateResumeContent(initialResume);

  const [resume, setResume] = useState<ResumeContent>(initialResume);
  const [resumeTemplate, setResumeTemplate] = useState<ResumeTemplate | null>(
    initialResumeTemplate,
  );

  const [resumeAnalyzeResults, setResumeAnalyzeResults] = useState<
    ResumeAnalyzeResults | undefined
  >(initialResumeAnalyzeResults);

  const saveResume = (resume: ResumeContent) => {
    setResume(resume);
    onUpdated?.(resume);
  };

  const saveResumeTemplate = (t: ResumeTemplate) => {
    setResumeTemplate(t);
    onResumeTemplateUpdated?.(t);
  };

  return (
    <ResumeBuilderContext.Provider
      value={{
        // setScores,
        // scores,
        scheme,
        resume,
        saveResume,
        resumeTemplate,
        saveResumeTemplate,
        resumeAnalyzeResults,
        setResumeAnalyzeResults,
      }}
    >
      {children}
    </ResumeBuilderContext.Provider>
  );
};

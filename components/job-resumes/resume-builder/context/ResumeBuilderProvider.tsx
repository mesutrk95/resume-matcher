'use client';

import { ResumeAnalyzeResults, ResumeContent, ResumeDesign } from '@/types/resume';
// import { migrateResumeContent } from '@/utils/resume-migration';
import React, { createContext, useState } from 'react';

export type ICareerProfileEditor = {
  scheme?: 'cards' | 'accordion';

  resume: ResumeContent;
  saveResume: (resume: ResumeContent) => void;

  design: ResumeDesign | null;
  saveDesign: (design: ResumeDesign) => void;

  resumeAnalyzeResults?: ResumeAnalyzeResults;
  setResumeAnalyzeResults: React.Dispatch<React.SetStateAction<ResumeAnalyzeResults | undefined>>;
};

export const ResumeBuilderContext = createContext<ICareerProfileEditor>({
  scheme: 'cards',
} as ICareerProfileEditor);

export const ResumeBuilderProvider = ({
  children,
  initialResume,
  initialDesign,
  initialResumeAnalyzeResults,
  scheme,
  onUpdated,
  onDesignUpdated,
}: {
  children: React.ReactNode;
  initialResume: ResumeContent;
  initialDesign: ResumeDesign | null;
  initialResumeAnalyzeResults?: ResumeAnalyzeResults;
  scheme?: 'cards' | 'accordion';
  onUpdated?: (resume: ResumeContent) => void;
  onDesignUpdated?: (design: ResumeDesign) => void;
}) => {
  // const migratedResume = migrateResumeContent(initialResume);

  const [resume, setResume] = useState<ResumeContent>(initialResume);
  const [design, setDesign] = useState<ResumeDesign | null>(initialDesign);

  const [resumeAnalyzeResults, setResumeAnalyzeResults] = useState<
    ResumeAnalyzeResults | undefined
  >(initialResumeAnalyzeResults);

  const saveResume = (resume: ResumeContent) => {
    setResume(resume);
    onUpdated?.(resume);
  };

  const saveDesign = (design: ResumeDesign) => {
    setDesign(design);
    onDesignUpdated?.(design);
  };

  return (
    <ResumeBuilderContext.Provider
      value={{
        // setScores,
        // scores,
        scheme,
        resume,
        saveResume,
        design,
        saveDesign,
        resumeAnalyzeResults,
        setResumeAnalyzeResults,
      }}
    >
      {children}
    </ResumeBuilderContext.Provider>
  );
};

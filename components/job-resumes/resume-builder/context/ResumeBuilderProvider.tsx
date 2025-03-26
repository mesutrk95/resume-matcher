"use client";

import { ResumeAnalyzeResults, ResumeContent } from "@/types/resume";
import React, { createContext, useState } from "react";

export type IResumeTemplateEditor = {
  resume: ResumeContent;
  saveResume: (resume: ResumeContent) => void;

  resumeAnalyzeResults?: ResumeAnalyzeResults;
  setResumeAnalyzeResults: React.Dispatch<
    React.SetStateAction<ResumeAnalyzeResults | undefined>
  >;
};

export const ResumeBuilderContext = createContext<IResumeTemplateEditor>(
  {} as IResumeTemplateEditor
);

export const ResumeBuilderProvider = ({
  children,
  initialResume,
  initialResumeAnalyzeResults,
  onUpdated,
}: {
  children: React.ReactNode;
  initialResume: ResumeContent;
  initialResumeAnalyzeResults?: ResumeAnalyzeResults;
  onUpdated?: (resume: ResumeContent) => void;
}) => {
  const [resume, setResume] = useState<ResumeContent>(initialResume);
  const [resumeAnalyzeResults, setResumeAnalyzeResults] = useState<
    ResumeAnalyzeResults | undefined
  >(initialResumeAnalyzeResults);

  const saveResume = (resume: ResumeContent) => {
    setResume(resume);
    onUpdated?.(resume);
  };

  return (
    <ResumeBuilderContext.Provider
      value={{
        // setScores,
        // scores,
        resume,
        saveResume,
        resumeAnalyzeResults,
        setResumeAnalyzeResults,
      }}
    >
      {children}
    </ResumeBuilderContext.Provider>
  );
};

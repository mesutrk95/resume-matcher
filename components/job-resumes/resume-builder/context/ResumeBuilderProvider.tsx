"use client";

import { ResumeAnalyzeResults, ResumeContent } from "@/types/resume";
import { migrateResumeContent } from "@/utils/resume-migration";
import React, { createContext, useState } from "react";

export type IResumeTemplateEditor = {
  scheme?: "cards" | "accordion";

  resume: ResumeContent;
  saveResume: (resume: ResumeContent) => void;

  resumeAnalyzeResults?: ResumeAnalyzeResults;
  setResumeAnalyzeResults: React.Dispatch<
    React.SetStateAction<ResumeAnalyzeResults | undefined>
  >;
};

export const ResumeBuilderContext = createContext<IResumeTemplateEditor>({
  scheme: "cards",
} as IResumeTemplateEditor);

export const ResumeBuilderProvider = ({
  children,
  initialResume,
  initialResumeAnalyzeResults,
  scheme,
  onUpdated,
}: {
  children: React.ReactNode;
  initialResume: ResumeContent;
  initialResumeAnalyzeResults?: ResumeAnalyzeResults;
  scheme?: "cards" | "accordion";
  onUpdated?: (resume: ResumeContent) => void;
}) => {
  const migratedResume = migrateResumeContent(initialResume);

  const [resume, setResume] = useState<ResumeContent>(migratedResume);
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
        scheme,
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

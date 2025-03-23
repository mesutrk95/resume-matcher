"use client";

import { ResumeContent, ResumeItemScoreAnalyze } from "@/types/resume";
import React, { createContext, useState } from "react";

export type IResumeTemplateEditor = {
  scores: Record<string, ResumeItemScoreAnalyze> | undefined;
  setScores: React.Dispatch<
    React.SetStateAction<Record<string, ResumeItemScoreAnalyze> | undefined>
  >;
  resume: ResumeContent;
  // setResume: React.Dispatch<React.SetStateAction<ResumeContent>>;
  saveResume: (resume: ResumeContent) => void;
  cards: boolean;
};

export const ResumeBuilderContext = createContext<IResumeTemplateEditor>(
  {} as IResumeTemplateEditor
);

export const ResumeBuilderProvider = ({
  children,
  initialResume,
  onUpdated,
}: {
  children: React.ReactNode;
  initialResume: ResumeContent;
  onUpdated?: (resume: ResumeContent) => void;
}) => {
  const [scores, setScores] =
    useState<Record<string, ResumeItemScoreAnalyze>>();
  const [resume, setResume] = useState<ResumeContent>(initialResume);

  const saveResume = (resume: ResumeContent) => {
    setResume(resume);
    onUpdated?.(resume);
  };

  return (
    <ResumeBuilderContext.Provider
      value={{ setScores, scores, resume, saveResume, cards: false }}
    >
      {children}
    </ResumeBuilderContext.Provider>
  );
};

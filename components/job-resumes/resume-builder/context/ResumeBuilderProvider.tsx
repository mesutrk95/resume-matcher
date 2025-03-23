import { ResumeItemScoreAnalyze } from "@/types/resume";
import React, { createContext, useState } from "react";

export type IResumeTemplateEditor = {
  scores:
    | Record<string, ResumeItemScoreAnalyze>
    | undefined;
  setScores: React.Dispatch<
    React.SetStateAction<
    Record<string, ResumeItemScoreAnalyze> | undefined
    >
  >;
  cards: boolean
};

export const ResumeBuilderContext = createContext<IResumeTemplateEditor>(
  {} as IResumeTemplateEditor
);

export const ResumeBuilderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [scores, setScores] = useState<Record<string, ResumeItemScoreAnalyze>>();

  return (
    <ResumeBuilderContext.Provider value={{ setScores, scores, cards: false }}>
      {children}
    </ResumeBuilderContext.Provider>
  );
};

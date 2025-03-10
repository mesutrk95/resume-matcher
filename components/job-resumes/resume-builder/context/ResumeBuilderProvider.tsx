import { ResumeItemScoreAnalyze } from "@/types/resume";
import React, { createContext, useState } from "react";

export type IResumeTemplateEditor = {
  scores:
    | Record<string, { score: number; matched_keywords: string[] }>
    | undefined;
  setScores: React.Dispatch<
    React.SetStateAction<
      Record<string, { score: number; matched_keywords: string[] }> | undefined
    >
  >;
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

  // const getScoreById = (id: string) => {
  //   if (!scores?.[id]) return null;

  //   return scores[id];
  // };

  return (
    <ResumeBuilderContext.Provider value={{ setScores, scores }}>
      {children}
    </ResumeBuilderContext.Provider>
  );
};

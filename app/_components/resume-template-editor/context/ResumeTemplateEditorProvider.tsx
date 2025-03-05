import React, { createContext, useState } from "react";

export type ResumeScore = {
  id?: string;
  score: number;
  matched_keywords: string[];
};

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

export const ResumeTemplateEditorContext = createContext<IResumeTemplateEditor>(
  {} as IResumeTemplateEditor
);

export const ResumeTemplateEditorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [scores, setScores] = useState<Record<string, ResumeScore>>();

  return (
    <ResumeTemplateEditorContext.Provider value={{ setScores, scores }}>
      {children}
    </ResumeTemplateEditorContext.Provider>
  );
};

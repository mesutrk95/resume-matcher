"use client";

import { useEffect } from "react";

import type { ResumeAnalyzeResults } from "@/types/resume";
import { useResumeBuilder } from "./context/useResumeBuilder";
import { ContactInfoSection } from "./contact-information";
import { ProjectsSection } from "./projects";
import { ExperiencesSection } from "./experiences";
import { EducationsSection } from "./educations";
import { SummariesSection } from "./summaries";
import { TitlesSection } from "./titles";
import { SkillsSection } from "./skills";

type IPropsType = {
  resumeAnalyzeData?: ResumeAnalyzeResults;
};

export function ResumeBuilder({ resumeAnalyzeData }: IPropsType) {
  const { resume, saveResume, setScores } = useResumeBuilder();

  useEffect(() => {
    setScores(resumeAnalyzeData?.itemsScore);
  }, [resumeAnalyzeData?.itemsScore, setScores]);

  return (
    <div className="flex flex-col gap-5">
      <ContactInfoSection />
      <TitlesSection />
      <SummariesSection />
      <ExperiencesSection />
      <EducationsSection />
      <ProjectsSection />
      <SkillsSection />
    </div>
  );
}

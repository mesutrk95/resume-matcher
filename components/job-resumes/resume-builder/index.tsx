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

type IPropsType = {};

export function ResumeBuilder({}: IPropsType) {
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

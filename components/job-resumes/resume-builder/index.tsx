"use client";

import { useEffect, useState } from "react";

import type { ResumeAnalyzeResults, ResumeContent, ResumeItemScoreAnalyze } from "@/types/resume";
import { ResumeBuilderProvider } from "./context/ResumeBuilderProvider";
import { useResumeBuilder } from "./context/useResumeBuilder";
import { ContactInfoSection } from "./contact-information";
import { ProjectsSection } from "./projects";
import { ExperiencesSection } from "./experiences";
import { EducationsSection } from "./educations";
import { SummariesSection } from "./summaries";
import { TitlesSection } from "./titles";
import { SkillsSection } from "./skills";

type IPropsType = {
  data: ResumeContent;
  resumeAnalyzeData?: ResumeAnalyzeResults;
  onUpdate?: (t: ResumeContent) => void;
};

function ResumeBuilderComponent({
  data,
  resumeAnalyzeData,
  onUpdate,
}: IPropsType) {
  // Sample initial data
  const [lastTemplate, setLastTemplate] = useState<string>(
    JSON.stringify(data)
  );
  const [template, setTemplate] = useState<ResumeContent>(data);

  useEffect(() => {
    // console.log("updated", template);
    const newTemplate = JSON.stringify(template);

    if (newTemplate !== lastTemplate) {
      console.log("template updated");
      onUpdate?.(template);
      setLastTemplate(newTemplate);
    }
  }, [template, lastTemplate, onUpdate]);

  const { setScores } = useResumeBuilder();
  useEffect(() => {
    setScores(resumeAnalyzeData?.itemsScore);
  }, [resumeAnalyzeData?.itemsScore, setScores]);

  useEffect(() => {
    setTemplate(data);
  }, [data]);

  return (
    <div className="flex flex-col gap-5">
      <ContactInfoSection
        resume={template}
        onUpdate={(contactInfo) =>
          setTemplate((prev) => ({ ...prev, contactInfo }))
        }
      />

      <TitlesSection
        resume={template}
        onUpdate={(titles) => setTemplate((prev) => ({ ...prev, titles }))}
      />

      <SummariesSection
        resume={template}
        onUpdate={(summaries) =>
          setTemplate((prev) => ({ ...prev, summaries }))
        }
      />

      <ExperiencesSection
        resume={template}
        onUpdate={(experiences) =>
          setTemplate((prev) => ({ ...prev, experiences }))
        }
      />

      <EducationsSection
        resume={template}
        onUpdate={(educations) =>
          setTemplate((prev) => ({ ...prev, educations }))
        }
      />

      <ProjectsSection
        resume={template}
        onUpdate={(projects) => setTemplate({ ...template, projects })}
      />

      <SkillsSection
        resume={template}
        onUpdate={(skills) => setTemplate({ ...template, skills })}
      />
    </div>
  );
}

export function ResumeBuilder(props: IPropsType) {
  return (
    <ResumeBuilderProvider>
      <ResumeBuilderComponent {...props} />
    </ResumeBuilderProvider>
  );
}

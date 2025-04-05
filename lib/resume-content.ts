import { ResumeContent } from "@/types/resume";
import { randomNDigits } from "./utils";

export function findVariation(resume: ResumeContent, varId: string) {
  for (const exp of resume.experiences) {
    for (const expItem of exp.items) {
      for (const variation of expItem.variations) {
        if (variation.id === varId) return variation;
      }
    }
  }
}

export const resumeExperiencesToString = (
  resume: ResumeContent,
  withIdentifiers?: boolean,
  onlyEnabledItems?: boolean
) => {
  let content = "";
  resume.experiences.forEach((exp) => {
    if (onlyEnabledItems && !exp.enabled) return;
    const items = onlyEnabledItems
      ? exp.items.filter((i) => i.enabled)
      : exp.items;
    items.forEach((item) => {
      const variation = item.variations.find((v) => v.enabled);
      if (variation?.content)
        content += `${(withIdentifiers && `[${variation.id}]`) || ""} ${
          variation.content
        }\n`;
    });
  });
  return content;
};
export const resumeSkillsToString = (resume: ResumeContent) => {
  return resume.skills
    .filter((e) => e.enabled)
    .map((s) => s.content)
    .join(", ")
    .replace(/\u200B/g, "");
};

export const convertResumeObjectToString = (
  resume: ResumeContent,
  withIdentifiers?: boolean,
  onlyEnabledItems?: boolean
) => {
  let content = "";

  const title = resume.titles.find((t) => t.enabled)?.content;
  if (title) {
    content += title + "\n";
  }

  const summary = resume.summaries.find((t) => t.enabled)?.content;
  if (summary) {
    content += summary + "\n";
  }

  content += `Experiences:\n`;
  content += resumeExperiencesToString(resume, withIdentifiers, true);

  content += `Projects:\n`;
  resume.projects.forEach((prj) => {
    if (!prj.enabled) return;
    content += `${prj?.content}\n`;
  });

  content += `Educations:\n`;
  const edu = resume.educations.find((e) => e.enabled);
  if (edu) {
    content += `Education\n${edu.degree} • ${edu.institution} • ${edu.content} \n`;
  }
  content += "Skills: " + resumeSkillsToString(resume) + "\n";
  return content;
};

export function migrateResumeContent(resume: ResumeContent): ResumeContent {
  if (resume.version === 2) return resume;

  function migrateV1(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => migrateV1(item));
    } else if (typeof data === "object" && data !== null) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          if (key === "id" && typeof data[key] === "string") {
            let prefix = data[key].replace(/\d+/g, "");
            if (prefix.startsWith("skill")) prefix = "skill";
            data[key] = `${prefix}_${randomNDigits()}`;
          } else {
            data[key] = migrateV1(data[key]);
          }
        }
      }
      return data;
    }
    return data;
  }
  const newResume = migrateV1(resume);
  newResume.version = 2;
  return newResume;
}

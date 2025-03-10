import { JobKeyword } from "@/types/job";
import { ResumeContent, Variation } from "@/types/resume";

function findDuplicates(arr: string[]): { keyword: string; repeats: number }[] {
  const counts = arr.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([keyword, repeats]) => ({
    keyword,
    repeats,
  }));
}

function extractKeywords(jobDescription: string) {
  // Simple keyword extraction (split by space and filter out common words)
  const commonWords = new Set([
    "the",
    "and",
    "of",
    "in",
    "to",
    "a",
    "with",
    "for",
    "on",
    "at",
    "are",
    "you",
    "from",
    "our",
    "has",
    "that",
    "we",
    "need",
  ]);

  return findDuplicates(
    jobDescription
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2 && !commonWords.has(word))
  );
}

function scoreVariation(variation: Variation, keywords: JobKeyword[]): number {
  const contentWords = variation.content
    .toLowerCase()
    .split(/\W+/)
    .map((w) => w.toLowerCase());

  return keywords.filter((word) =>
    contentWords.includes(word.keyword.toLowerCase())
  ).length;
}

function selectBestVariations(
  resume: ResumeContent,
  keywords: JobKeyword[]
): ResumeContent {
  let scores: any = {};
  const selectedResume: ResumeContent = {
    ...resume,
    experiences: resume.experiences.map((experience, index) => {
      const items = experience.items.map((item) => {
        const bestVariation = item.variations.reduce(
          (best, variation) => {
            const score = scoreVariation(variation, keywords);
            scores[item.id + "-" + variation.id] = score;
            return score > best.score ? { variation, score } : best;
          },
          {
            variation: item.variations[0],
            score: scoreVariation(item.variations[0], keywords),
          }
        );
        item.variations.forEach((variation) => {
          variation.enabled = false;
        });
        bestVariation.variation.enabled = true;
        return item;
      });

      // Apply the rules for the number of items per experience
      let itemCount;
      if (index === 0) {
        itemCount = 5;
      } else if (index === 1) {
        itemCount = 3;
      } else {
        itemCount = 2;
      }

      return {
        ...experience,
        items: items.slice(0, itemCount), // Only keep the required number of items
      };
    }),
  };

  return selectedResume;
}

export const constructFinalResume = (
  templateContent: ResumeContent,
  keywords: JobKeyword[]
) => {
  // const keywords = extractKeywords(jobDescription);
  // setKeywords(keywords);
  // console.log("keywords", keywords);

  if (!keywords) return null;
  return selectBestVariations(templateContent, keywords);
};

export const convertResumeObjectToString = (resume: ResumeContent) => {
  let content = "";

  const title = resume.titles.find((t) => t.enabled)?.content;
  if (title) {
    content += title + "\n";
  }

  const summary = resume.summaries.find((t) => t.enabled)?.content;
  if (summary) {
    content += summary + "\n";
  }

  content += `Experiences\n`;
  resume.experiences.forEach((exp) => {
    if (!exp.enabled) return;
    exp.items.forEach((item) => {
      const variation = item.variations.find((v) => v.enabled);
      content += `${variation?.content}\n`;
    });
  });
  resume.projects.forEach((prj) => {
    if (!prj.enabled) return;
    content += `${prj?.content}\n`;
  });

  const edu = resume.educations.find((e) => e.enabled);
  if (edu) {
    content += `Education\n${edu.degree} • ${edu.institution} • ${edu.content} \n`;
  }
  if (edu) {
    content += `Skills\n${resume.skills.filter((e) => e.enabled).map(s => s.content).join(', ')} \n`;
  }
  return content;
};

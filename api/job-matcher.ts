import { JobKeyword } from "@/types/job";
import { ResumeContent, ResumeItemScoreAnalyze } from "@/types/resume";
import axios from "axios";

export const extractKeywords = (description: string) => {
  return axios
    .post<{ result: JobKeyword[] }>("/api/jd/keywords/analyze", { description })
    .then((res) => res.data.result || []);
};

export const getResumeScore = async (
  templateContent: ResumeContent,
  keywords: JobKeyword[]
) => {
  // const experience = templateContent.experiences[0]
  // const content = experience.items
  //     .map((item, index) =>
  //         `Experience Item ${index + 1}\n` +
  //         item.variations.map(v => `${v.id} - ${v.content}`).join('\n'))
  //     .flat().join('\n')

  // const keys = keywords.map(k => `${k.keyword} (${k.level})`).join(',')

  // return axios.post<{ result: ResumeScore[] }>('/api/jd/best-scores', { content, keywords: keys }).
  //     then(res => res.data.result || [])

  const result = await Promise.all(
    templateContent.experiences.map((experience) => {
      const content = experience.items
        .map(
          (item, index) =>
            `Experience Item ${index + 1}\n` +
            item.variations.map((v) => `${v.id} - ${v.content}`).join("\n")
        )
        .flat()
        .join("\n");

      const keys = keywords.map((k) => `${k.keyword} (${k.level})`).join(",");

      return axios
        .post<{ result: ResumeItemScoreAnalyze[] }>("/api/jd/best-scores", {
          content,
          keywords: keys,
        })
        .then((res) => res.data.result || []);
    })
  );

  return result.flat();
};

type ExtractedJD = {
  description: string;
  companyName: string;
  location: string;
  title: string;
  postedDate: string;
};

export const extractJobDetailsFromUrl = (url: string) => {
  return axios
    .get<{ result: ExtractedJD }>(`/api/jd/extract-form-url`, {
      params: { url },
    })
    .then((res) => res.data.result);
};

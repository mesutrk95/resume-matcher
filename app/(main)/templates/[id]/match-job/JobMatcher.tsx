"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Template, TemplateContent, Variation } from "@/types/resume";
import { ResumeTemplate } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

type Keyword = {
  keyword: string;
  level: number;
  skill: "soft" | "hard" | "none";
};
const ResumePreview = ({
  templateContent,
}: {
  templateContent: TemplateContent;
}) => {
  return (
    <div className="flex flex-col gap-4">
      {templateContent.experiences.map((experience, index) => (
        <div key={index}>
          <h2 className="text-lg font-bold">{experience.companyName}</h2>
          <h3 className="text-md font-bold">{experience.role}</h3>
          <p className="text-sm">
            {experience.startDate} - {experience.endDate}
          </p>
          <ul className="list-disc ml-4">
            {experience.items.map((item, index) => {
              return item.variations.map((variation) => (
                <li key={item.id + variation.id}>{variation.content}</li>
              ));
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

// function extractKeywords(jobDescription: string) {
//   // Simple keyword extraction (split by space and filter out common words)
//   const commonWords = new Set([
//     "the",
//     "and",
//     "of",
//     "in",
//     "to",
//     "a",
//     "with",
//     "for",
//     "on",
//     "at",
//     "are",
//     "you",
//     "from",
//     "our",
//     "has",
//     "that",
//     "we",
//     "need",
//   ]);

//   return findDuplicates(
//     jobDescription
//       .toLowerCase()
//       .split(/\W+/)
//       .filter((word) => word.length > 2 && !commonWords.has(word))
//   );
// }
export const JobMatcher = ({
  templateContent,
}: {
  templateContent: TemplateContent;
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [finalResume, setFinalResume] = useState<TemplateContent | null>(null);

  const constructFinalResume = (
    templateContent: TemplateContent,
    jobDescription: string
  ) => {
    function scoreVariation(variation: Variation, keywords: Keyword[]): number {
      const contentWords = variation.content.toLowerCase().split(/\W+/);
      return keywords.filter((word) => contentWords.includes(word.keyword))
        .length;
    }
    function selectBestVariations(
      resume: TemplateContent,
      keywords: Keyword[]
    ): TemplateContent {
      const selectedResume: TemplateContent = {
        experiences: resume.experiences.map((experience, index) => {
          const items = experience.items.map((item) => {
            const bestVariation = item.variations.reduce(
              (best, variation) => {
                const score = scoreVariation(variation, keywords);
                return score > best.score ? { variation, score } : best;
              },
              {
                variation: item.variations[0],
                score: scoreVariation(item.variations[0], keywords),
              }
            );

            return {
              ...item,
              variations: [bestVariation.variation], // Only keep the best variation
            };
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

    // const keywords = extractKeywords(jobDescription);

    // setKeywords(keywords);
    console.log("keywords", keywords);
    return selectBestVariations(templateContent, keywords);
  };

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setJobDescription(e.target.value);
    // const finalResume = constructFinalResume(templateContent, jobDescription);
    // console.log(finalResume);
    // setFinalResume(finalResume);
  };

  const getKeywords = () => {
    fetch("/api/jd", {
      method: "POST",
      body: JSON.stringify({
        description: jobDescription,
      }),
    })
      .then((res) => res.json())
      .then(
        (data: {
          result: { keyword: string; level: number; skill: "hard" | "soft" }[];
        }) => {
          console.log(data);
          if (data.result) {
            setKeywords(data.result);
            const finalResume = constructFinalResume(
              templateContent,
              jobDescription
            );
            console.log(finalResume);
            setFinalResume(finalResume);
          }
        }
      );
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      <div>
        <Textarea
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          placeholder="Job Description"
          className="mb-2"
          rows={20}
        />
      </div>
      <div>
        {finalResume && <ResumePreview templateContent={finalResume} />}
        <div className="mt-5 flex flex-col gap-4">
          <div>
            <Button onClick={() => getKeywords()}>Get Keywords</Button>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold">Hard Skills</h4>
              <ul className="  gap-2   ">
                {keywords
                  .filter((k) => k.skill === "hard")
                  .sort((k1, k2) => k2.level - k1.level)
                  .map((keyword) => (
                    <li className=" py-1  " key={keyword.keyword}>
                      {keyword.keyword} {keyword.level}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold">Soft Skills</h4>
              <ul className="  gap-2   ">
                {keywords
                  .filter((k) => k.skill === "soft")
                  .sort((k1, k2) => k2.level - k1.level)
                  .map((keyword) => (
                    <li className=" py-1  " key={keyword.keyword}>
                      {keyword.keyword} {keyword.level}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold">Other</h4>
              <ul className="  gap-2   ">
                {keywords
                  .filter((k) => k.skill === "none")
                  .sort((k1, k2) => k2.level - k1.level)
                  .map((keyword) => (
                    <li className=" py-1  " key={keyword.keyword}>
                      {keyword.keyword} {keyword.level}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

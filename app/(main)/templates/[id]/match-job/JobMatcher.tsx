"use client";

import { extractKeywords, getResumeScore, Keyword } from "@/api/job-matcher";
import { LoadingButton } from "@/components/ui/loading-button";
import { constructFinalResume } from "@/app/utils/job-matcher";
import { Textarea } from "@/components/ui/textarea";
import { TemplateContent } from "@/types/resume";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ResumeTemplateEditor } from "@/app/_components/resume-template-editor";

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
              return item.variations
                .filter((v) => v.enabled)
                .map((variation) => (
                  <li key={item.id + variation.id}>{variation.content}</li>
                ));
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

const KeywordBadge = ({ keyword }: { keyword: Keyword }) => {
  return (
    <li className="py-1" key={keyword.keyword}>
      {keyword.keyword}
      <span className="rounded-xl px-2 py-1 bg-slate-300 text-xs font-bold ml-1">
        {keyword.level}
      </span>
    </li>
  );
};

export const JobMatcher = ({
  templateContent,
}: {
  templateContent: TemplateContent;
}) => {
  const [jobDescription, setJobDescription] = useState("");
  // const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [finalResume, setFinalResume] = useState<TemplateContent | null>(null);

  const {
    data: keywords,
    refetch: refetchKeywords,
    isFetching: isFetchingKeywords,
  } = useQuery({
    queryKey: ["keywords", "jd"],
    queryFn: () => extractKeywords(jobDescription),
    enabled: false,
  });

  const {
    data: scores,
    refetch: refetchScores,
    isFetching: isFetchingScores,
  } = useQuery({
    queryKey: ["keywords", "jd", "scores"],
    queryFn: () => keywords && getResumeScore(templateContent, keywords),
    enabled: false,
  });

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setJobDescription(e.target.value);
  };

  useEffect(() => {
    if (!keywords) return;
    const finalResume = constructFinalResume(templateContent, keywords);
    const templateContentCopy = JSON.parse(
      JSON.stringify(templateContent)
    ) as TemplateContent;
    templateContentCopy.experiences.forEach((experience) => {
      const resultExp = finalResume?.experiences.find(
        (exp) => exp.id === experience.id
      );
      experience.items.forEach((item) => {
        const resultExpItem = resultExp?.items.find(
          (expItem) => expItem.id === item.id
        );
        item.variations.forEach((variation) => {
          const resultVariation = resultExpItem?.variations.find(
            (v) => v.id === variation.id
          );
          variation.enabled = !!resultVariation;
        });
      });
    });
    setFinalResume(templateContentCopy);
    console.log(finalResume, "copy", templateContentCopy);
  }, [keywords]);

  return (
    <div>
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
            <div className="flex gap-2">
              <LoadingButton
                onClick={() => refetchKeywords()}
                loading={isFetchingKeywords}
                loadingText="Thinking ..."
              >
                Get Keywords
              </LoadingButton>
              <LoadingButton
                onClick={() => refetchScores()}
                loading={isFetchingScores}
                loadingText="Thinking ..."
              >
                Analyze Scores
              </LoadingButton>
            </div>
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold">Hard Skills</h4>
                <ul className="  gap-2   ">
                  {keywords
                    ?.filter((k) => k.skill === "hard")
                    .sort((k1, k2) => k2.level - k1.level)
                    .map((keyword) => (
                      <KeywordBadge keyword={keyword} key={keyword.keyword} />
                    ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold">Soft Skills</h4>
                <ul className="  gap-2   ">
                  {keywords
                    ?.filter((k) => k.skill === "soft")
                    .sort((k1, k2) => k2.level - k1.level)
                    .map((keyword) => (
                      <KeywordBadge keyword={keyword} key={keyword.keyword} />
                    ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold">Other</h4>
                <ul className="  gap-2   ">
                  {keywords
                    ?.filter((k) => k.skill === "none")
                    .sort((k1, k2) => k2.level - k1.level)
                    .map((keyword) => (
                      <KeywordBadge keyword={keyword} key={keyword.keyword} />
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* builder preview */}
      <div>
        {finalResume && (
          <ResumeTemplateEditor data={{ name: "", content: finalResume }} resumeScores={scores}/>
        )}
      </div>
    </div>
  );
};

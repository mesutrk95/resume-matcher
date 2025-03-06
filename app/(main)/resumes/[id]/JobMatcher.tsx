"use client";

import { getResumeScore } from "@/api/job-matcher";
import { LoadingButton } from "@/components/ui/loading-button";
import { constructFinalResume } from "@/app/utils/job-matching";
import { ResumeContent } from "@/types/resume";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { ResumeBuilder } from "@/components/job-resumes/resume-builder";
import { Job } from "@prisma/client";
import { JobDescriptionPreview } from "@/components/jobs/job-description-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { analyzeJobByAI } from "@/actions/job";
import { JobAnalyzeResult, JobKeyword, JobKeywordType } from "@/types/job";

const ResumePreview = ({
  templateContent,
}: {
  templateContent: ResumeContent;
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

const KeywordBadge = ({ keyword }: { keyword: JobKeyword }) => {
  return (
    <li className="py-1 text-sm" key={keyword.keyword}>
      {keyword.keyword}
      {/* <span className="rounded-xl px-2 py-1 bg-slate-200 text-xxs font-bold ml-1">
        {keyword.level}
      </span> */}
    </li>
  );
};

export const JobMatcher = ({
  initialResume,
  initialJob,
}: {
  initialResume: ResumeContent;
  initialJob: Job;
}) => {
  const [finalResume, setFinalResume] = useState<ResumeContent>(initialResume);
  const [job, setJob] = useState<Job>(initialJob);

  // const {
  //   data: keywords,
  //   refetch: refetchKeywords,
  //   isFetching: isFetchingKeywords,
  // } = useQuery({
  //   queryKey: ["keywords", "jd"],
  //   queryFn: () => extractKeywords(job.description || ""),
  //   enabled: false,
  // });
  const [isAnalyzingJob, startJobAnalyzeTransition] = useTransition();
  const jobAnalyzeResults = job.analyzeResults as JobAnalyzeResult;

  const {
    data: scores,
    refetch: refetchScores,
    isFetching: isFetchingScores,
  } = useQuery({
    queryKey: ["keywords", "jd", "scores"],
    queryFn: () =>
      jobAnalyzeResults?.keywords &&
      getResumeScore(initialResume, jobAnalyzeResults.keywords),
    enabled: false,
  });

  useEffect(() => {
    if (!jobAnalyzeResults?.keywords) return;
    const fr = constructFinalResume(initialResume, jobAnalyzeResults?.keywords);
    if (!fr) {
      toast.error("Keywords are not extracted, please first analyze keywords.");
      return;
    }
    setFinalResume(fr);
  }, [jobAnalyzeResults?.keywords, initialResume]);

  const jobKeywords = useMemo(() => {
    const results = job.analyzeResults as { keywords: JobKeyword[] };
    return results?.keywords?.reduce((acc, keyword) => {
      const ks = acc[keyword.skill] || [];
      ks.push(keyword);
      acc[keyword.skill] = ks;
      return acc;
    }, {} as Record<JobKeywordType, JobKeyword[]>);
  }, [job]);

  const handleAnalyzeJob = async () => {
    startJobAnalyzeTransition(async () => {
      const result = await analyzeJobByAI(job.id);
      if (result.success) {
        toast.success("Job analyzed successfully.");
        setJob({
          ...job,
          analyzeResults: result.data,
        });
      } else {
        toast.error("Failed to analyze job.");
      }
    });
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Tabs defaultValue="jd" className=" ">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jd">Job Description</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="summary">Summary (AI)</TabsTrigger>
            </TabsList>
            <TabsContent className="px-2 pt-4" value="jd">
              <LoadingButton
                onClick={handleAnalyzeJob}
                loading={isAnalyzingJob}
                loadingText="Thinking ..."
              >
                Analyze Job
              </LoadingButton>
              <JobDescriptionPreview job={job} />
            </TabsContent>
            <TabsContent className="px-2 pt-4" value="keywords">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold">Hard Skills</h4>
                  <ul className="  gap-2   ">
                    {jobKeywords?.["hard"]
                      ?.sort((k1, k2) => k2.level - k1.level)
                      .map((keyword) => (
                        <KeywordBadge keyword={keyword} key={keyword.keyword} />
                      ))}

                    {/* {(jobKeywords?.["hard"]?.length || 0) > 15 && (
                      <li
                        onClick={() => {}}
                        className="py-1 text-sm text-primary"
                      >
                        Show + {(jobKeywords?.["hard"]?.length || 0) - 15} more
                      </li>
                    )} */}
                  </ul>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="  font-bold">Soft Skills</h4>
                  <ul className="  gap-2   ">
                    {jobKeywords?.["soft"]
                      ?.sort((k1, k2) => k2.level - k1.level)
                      .map((keyword) => (
                        <KeywordBadge keyword={keyword} key={keyword.keyword} />
                      ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="  font-bold">Other</h4>
                  <ul className="  gap-2   ">
                    {jobKeywords?.["none"]
                      ?.sort((k1, k2) => k2.level - k1.level)
                      .map((keyword) => (
                        <KeywordBadge keyword={keyword} key={keyword.keyword} />
                      ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent className="px-2 pt-4" value="summary">
              <div
                className="jd-preview"
                dangerouslySetInnerHTML={{
                  __html: (job.analyzeResults as { summary: string })?.summary,
                }}
              ></div>
            </TabsContent>
          </Tabs>
        </div>
        <div>
          {finalResume && <ResumePreview templateContent={finalResume} />}
          <div className="mt-5 flex flex-col gap-4">
            <div className="flex gap-2">
              <LoadingButton
                onClick={() => refetchScores()}
                loading={isFetchingScores}
                loadingText="Thinking ..."
              >
                Analyze Scores
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      {/* builder preview */}
      <div>
        {finalResume && (
          <ResumeBuilder
            data={finalResume}
            resumeScores={scores}
            onUpdate={(tmp) => {
              setFinalResume(tmp);
            }}
          />
        )}
      </div>
    </div>
  );
};

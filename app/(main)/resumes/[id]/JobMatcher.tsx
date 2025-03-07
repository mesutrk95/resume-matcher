"use client";

import { LoadingButton } from "@/components/ui/loading-button";
import { constructFinalResume } from "@/app/utils/job-matching";
import { ResumeContent } from "@/types/resume";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { ResumeBuilder } from "@/components/job-resumes/resume-builder";
import { Job } from "@prisma/client";
import { JobDescriptionPreview } from "@/components/jobs/job-description-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { analyzeJobByAI, analyzeJobScores } from "@/actions/job";
import { JobAnalyzeResult, JobKeyword, JobKeywordType } from "@/types/job";
import { useParams } from "next/navigation";
import { ResumeScore } from "@/components/job-resumes/resume-builder/context/ResumeBuilderProvider";
// import { useLayout } from "@/app/context/LayoutProvider";

const ResumePreview = ({ resume }: { resume: ResumeContent }) => {
  return (
    <div className="p-5">
      <div className="flex flex-col gap-4 shadow-lg px-10 py5">
        {resume.experiences
          .filter((e) => e.enabled)
          .map((experience, index) => (
            <div key={index}>
              <h2 className="text-lg font-bold">{experience.companyName}</h2>
              <h3 className="text-md font-bold">{experience.role}</h3>
              <p className="text-sm">
                {experience.startDate} - {experience.endDate}
              </p>
              <ul className="list-disc ml-4">
                {experience.items
                  .filter((e) => e.enabled)
                  .map((item, index) => {
                    return item.variations
                      .filter((v) => v.enabled)
                      .map((variation) => (
                        <li className="text-sm" key={item.id + variation.id}>
                          {variation.content}
                        </li>
                      ));
                  })}
              </ul>
            </div>
          ))}
      </div>
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

const JobTab = ({
  job,
  resume,
  onUpdateJob,
  onScoresUpdate,
}: {
  job: Job;
  resume: ResumeContent;
  onUpdateJob: (j: Job) => void;
  onScoresUpdate: (s: ResumeScore[]) => void;
}) => {
  const [isAnalyzingJob, startJobAnalyzeTransition] = useTransition();

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
      try {
        const result = await analyzeJobByAI(job.id);

        toast.success("Job analyzed successfully.");
        onUpdateJob({
          ...job,
          analyzeResults: result,
        });
      } catch (error) {
        toast.error("Failed to analyze job.");
      }
    });
  };

  return (
    <Tabs defaultValue="jd" className=" ">
      <TabsList className="grid w-full grid-cols-4" variant={"outline"}>
        <TabsTrigger value="jd" variant={"outline"}>
          Job Description
        </TabsTrigger>
        <TabsTrigger value="keywords" variant={"outline"}>
          Keywords
        </TabsTrigger>
        <TabsTrigger value="summary" variant={"outline"}>
          Job Summary by AI
        </TabsTrigger>
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
          className="jd-preview text-sm"
          dangerouslySetInnerHTML={{
            __html: (job.analyzeResults as { summary: string })?.summary,
          }}
        ></div>
      </TabsContent>
    </Tabs>
  );
};

export const JobMatcher = ({
  initialResume,
  initialJob,
}: {
  initialResume: ResumeContent;
  initialJob: Job;
}) => {
  const { id: jobResumeId } = useParams();
  const [resume, setResume] = useState<ResumeContent>(initialResume);
  const [scores, setScores] = useState<ResumeScore[]>();
  const [job, setJob] = useState<Job>(initialJob);

  const jobAnalyzeResults = job.analyzeResults as JobAnalyzeResult;

  const [isAnalyzingScores, startAnalyzeScoresTransition] = useTransition();
  const handleAnalyzeScores = async () => {
    startAnalyzeScoresTransition(async () => {
      try {
        const result = await Promise.all(
          resume.experiences.map((experience) => {
            const content = experience.items
              .map(
                (item, index) =>
                  `Experience Item ${index + 1}\n` +
                  item.variations
                    .map((v) => `${v.id} - ${v.content}`)
                    .join("\n")
              )
              .flat()
              .join("\n");
            return analyzeJobScores(jobResumeId as string, content);
          })
        );

        const scores = result.map((r) => r.result).flat() as ResumeScore[];
        setScores(scores);
        console.log(scores);
        toast.success("Analyze rate and scores are successfully done!");
      } catch (error) {
        toast.error("Failed to analyze scores.");
      }
    });
  };

  useEffect(() => {
    if (!jobAnalyzeResults?.keywords) return;
    const fr = constructFinalResume(initialResume, jobAnalyzeResults?.keywords);
    if (!fr) {
      toast.error("Keywords are not extracted, please first analyze keywords.");
      return;
    }
    setResume(fr);
  }, [jobAnalyzeResults?.keywords, initialResume]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Tabs defaultValue="builder" className=" ">
            <TabsList className="grid w-full grid-cols-3" variant={"outline"}>
              <TabsTrigger value="builder" variant={"outline"}>
                Resume Builder
              </TabsTrigger>
              <TabsTrigger value="jd" variant={"outline"}>
                Job Description
              </TabsTrigger>
              <TabsTrigger value="keywords" variant={"outline"}>
                Resume Score
              </TabsTrigger> 
            </TabsList>
            <TabsContent className="pt-4" value="builder">
              
              <div className="mb-4 flex flex-col gap-4">
                <div className="flex gap-2">
                  <LoadingButton
                    onClick={handleAnalyzeScores}
                    loading={isAnalyzingScores}
                    loadingText="Thinking ..."
                  >
                    Analyze Scores
                  </LoadingButton>
                </div>
              </div>
              
              {resume && (
                <ResumeBuilder
                  data={resume}
                  resumeScores={scores}
                  onUpdate={(tmp) => {
                    setResume(tmp);
                  }}
                />
              )}
            </TabsContent>
            <TabsContent className="" value="jd">
              <JobTab
                job={job}
                onUpdateJob={setJob}
                onScoresUpdate={setScores}
                resume={resume}
              />
            </TabsContent>
          </Tabs>
        </div>
        <div>{resume && <ResumePreview resume={resume} />}</div>
      </div>

      {/* builder preview */}
      {/* <div>
        {finalResume && (
          <ResumeBuilder
            data={finalResume}
            resumeScores={scores}
            onUpdate={(tmp) => {
              setFinalResume(tmp);
            }}
          />
        )}
      </div> */}
    </div>
  );
};

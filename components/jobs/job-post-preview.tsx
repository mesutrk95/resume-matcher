"use client";

import { JobKeyword, JobKeywordType } from "@/types/job";
import { Job } from "@prisma/client";
import { useMemo, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { JobDescriptionPreview } from "./job-description-preview";
import Moment from "react-moment";
import { Briefcase, LucideExternalLink } from "lucide-react";
import { LoadingButton } from "../ui/loading-button";
import { analyzeJobByAI } from "@/actions/job";
import { toast } from "sonner";
import { ContentPlaceholder } from "@/app/_components/content-placeholder";

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

const RequireAnalyzeAlert = () => {
  return (
    <div className="py-10 text-sm text-center">
      <h3 className="text-xl font-bold">Job is not analyzed yet!</h3>
      <span className="text-muted-foreground">
        Please analyze the job first
      </span>
    </div>
  );
};

export const JobPostPreview = ({
  job,
  onJobUpdated,
}: {
  job: Job;
  onJobUpdated?: (j: Job) => void;
}) => {
  const [isAnalyzingJob, startJobAnalyzeTransition] = useTransition();
  const handleAnalyzeJob = async () => {
    startJobAnalyzeTransition(async () => {
      try {
        const result = await analyzeJobByAI(job.id);

        toast.success("Job analyzed successfully.");
        onJobUpdated?.({
          ...job,
          analyzeResults: result,
        });
      } catch (error) {
        toast.error("Failed to analyze job.");
      }
    });
  };

  const jobKeywords = useMemo(() => {
    try {
      const results = job.analyzeResults as { keywords: JobKeyword[] };
      return results?.keywords?.reduce((acc, keyword) => {
        const ks = acc[keyword.skill] || [];
        ks.push(keyword);
        acc[keyword.skill] = ks;
        return acc;
      }, {} as Record<JobKeywordType, JobKeyword[]>);
    } catch (error) {
      return null;
    }
  }, [job.analyzeResults]);

  return (
    <>
      <div className="flex justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold">{job.title}</h3>
          <p className="text-sm text-muted-foreground">
            {job.companyName} - {job.location} - Posted at{" "}
            {job.postedAt && (
              <>
                <Moment format="YYYY/MM/DD" date={job.postedAt} utc />
                (<Moment date={job.postedAt} fromNow utc />)
              </>
            )}
          </p>
          {job.url && (
            <a
              href={job.url}
              className="inline-flex items-center text-sm gap-1 text-muted-foreground mt-1"
              target="_blank"
            >
              Job post Link
              <LucideExternalLink size={14} />
            </a>
          )}
        </div>
        <LoadingButton
          variant={"outline"}
          onClick={handleAnalyzeJob}
          loading={isAnalyzingJob}
          loadingText="Thinking ..."
        >
          <Briefcase size={16} />
          Analyze Job
        </LoadingButton>
      </div>
      <Tabs defaultValue="jd" className=" ">
        <TabsList className="grid w-full grid-cols-3" variant={"outline"}>
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
        <TabsContent className="px-2" value="jd">
          <JobDescriptionPreview job={job} />
        </TabsContent>
        <TabsContent className="px-2" value="keywords">
          <ContentPlaceholder
            show={!jobKeywords}
            placeholder={<RequireAnalyzeAlert />}
          >
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
                <h4 className="font-bold">Other</h4>
                <ul className="gap-2">
                  {jobKeywords?.["none"]
                    ?.sort((k1, k2) => k2.level - k1.level)
                    .map((keyword) => (
                      <KeywordBadge keyword={keyword} key={keyword.keyword} />
                    ))}
                </ul>
              </div>
            </div>
          </ContentPlaceholder>
        </TabsContent>
        <TabsContent className="px-2" value="summary">
          <ContentPlaceholder
            show={!jobKeywords}
            placeholder={<RequireAnalyzeAlert />}
          >
            <div
              className="jd-preview text-sm"
              dangerouslySetInnerHTML={{
                __html:
                  (job.analyzeResults as { summary: string })?.summary || "",
              }}
            ></div>
          </ContentPlaceholder>
        </TabsContent>
      </Tabs>
    </>
  );
};

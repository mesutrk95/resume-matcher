"use client";

import { JobKeyword, JobKeywordType } from "@/types/job";
import { Job } from "@prisma/client";
import { useMemo, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { JobDescriptionPreview } from "./job-description-preview";
import Moment from "react-moment";
import { Briefcase, Ellipsis, LucideExternalLink, Trash } from "lucide-react";
import { LoadingButton } from "../ui/loading-button";
import { analyzeJobByAI, deleteJob } from "@/actions/job";
import { toast } from "sonner";
import { ContentPlaceholder } from "@/app/_components/content-placeholder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { confirmDialog } from "../shared/confirm-dialog";
import { useRouter } from "next/navigation";

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

const RequireAnalyzeAlert = ({
  isAnalyzingJob,
  onAnalyzeJob,
}: {
  onAnalyzeJob: () => void;
  isAnalyzingJob: boolean;
}) => {
  return (
    <div className="py-10 text-sm text-center">
      <h3 className="text-xl font-bold">Job is not analyzed yet!</h3>
      <span className="text-muted-foreground">
        Please analyze the job first
      </span>
      <div className="mt-2">
        <LoadingButton
          variant={"outline"}
          onClick={onAnalyzeJob}
          loading={isAnalyzingJob}
          loadingText="Analyzing ..."
        >
          <Briefcase size={16} />
          Analyze Job
        </LoadingButton>
      </div>
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
  const [isDeletingJob, startDeletingJob] = useTransition();
  const router = useRouter();
  const handleAnalyzeJob = async () => {
    startJobAnalyzeTransition(async () => {
      try {
        const result = await analyzeJobByAI(job.id);

        toast.success("Job analyzed successfully.");
        onJobUpdated?.({
          ...job,
          analyzeResults: result.analyzeResults,
        });
      } catch (error) {
        toast.error("Failed to analyze job.");
      }
    });
  };
  const handleDeleteJob = async () => {
    if (await confirmDialog({
      title: `Delete Job Confirmation`
    })) {
      startDeletingJob(async () => {
        try {
          await deleteJob(job.id);
          toast.success("Job deleted successfully.");
          router.push("/jobs");
        } catch (error) {
          toast.error("Failed to delete job.");
        }
      });
    }
  };

  const jobKeywords = useMemo(() => {
    try {
      const results = job.analyzeResults as { keywords: JobKeyword[] };
      return results?.keywords?.reduce<Record<JobKeywordType, JobKeyword[]>>((acc, keyword) => {
        const ks = acc[keyword.skill] || [];
        ks.push(keyword);
        acc[keyword.skill] = ks;
        return acc;
      }, {});
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
            {job.companyName}

            {job.location && <> - {job.location}</>}
            {job.postedAt && (
              <>
                - Posted at{" "}
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
              {job.url}
              <LucideExternalLink size={14} />
            </a>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={handleDeleteJob}
              disabled={isDeletingJob}
              
            >
              <Trash size={16} />
              Delete Job
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleAnalyzeJob}
              disabled={isAnalyzingJob}
            >
              <Briefcase size={16} />
              {!isAnalyzingJob ? "Analyze Job" : "Analyzing Job ..."}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            placeholder={
              <RequireAnalyzeAlert
                onAnalyzeJob={handleAnalyzeJob}
                isAnalyzingJob={isAnalyzingJob}
              />
            }
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
            placeholder={
              <RequireAnalyzeAlert
                onAnalyzeJob={handleAnalyzeJob}
                isAnalyzingJob={isAnalyzingJob}
              />
            }
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

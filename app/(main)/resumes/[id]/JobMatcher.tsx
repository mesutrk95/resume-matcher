"use client";

import { LoadingButton } from "@/components/ui/loading-button";
import { constructFinalResume } from "@/utils/job-matching";
import { ResumeAnalyzeResults, ResumeContent } from "@/types/resume";
import React, { useState, useTransition } from "react";
import { ResumeBuilder } from "@/components/job-resumes/resume-builder";
import { Job, JobResume } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { JobAnalyzeResult } from "@/types/job";
import { useParams, useRouter } from "next/navigation";
import {
  analyzeResumeItemsScores,
  analyzeResumeScore,
  deleteJobResume,
  updateJobResume,
} from "@/actions/job-resume";
import CVPreview from "@/components/job-resumes/resume-pdf-preview";
import { updateResumeTemplateContent } from "@/actions/resume-template";
import {
  Briefcase,
  CheckCheck,
  CheckCircle,
  CircleX,
  Ellipsis,
  LucideCheck,
  LucideX,
  RefreshCw,
  Trash,
} from "lucide-react";
import { JobPostPreview } from "@/components/jobs/job-post-preview";
import { BlobProvider } from "@react-pdf/renderer";
import { ResumeDocument } from "@/components/job-resumes/resume-document";
import Moment from "react-moment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { confirmDialog } from "@/components/shared/confirm-dialog";

export const JobMatcher = ({
  jobResume,
  initialResume,
  initialJob,
}: {
  jobResume: JobResume;
  initialResume: ResumeContent;
  initialJob: Job;
}) => {
  const router = useRouter();
  const { id: jobResumeId } = useParams();
  const [resume, setResume] = useState<ResumeContent>(initialResume);
  const [resumeAnalyzeData, setResumeAnalyzeData] = useState<
    ResumeAnalyzeResults | undefined
  >(jobResume.analyzeResults as ResumeAnalyzeResults);
  const [job, setJob] = useState<Job>(initialJob);

  const jobAnalyzeResults = job.analyzeResults as JobAnalyzeResult;

  const [isDeleting, startDeletingTransition] = useTransition();
  const [isSyncingToTemplate, startSyncToTemplateTransition] = useTransition();
  const [isAnalyzingScores, startAnalyzeScoresTransition] = useTransition();
  const handleAnalyzeScores = async (forceRefresh: boolean) => {
    startAnalyzeScoresTransition(async () => {
      try {
        const results = await analyzeResumeItemsScores(jobResumeId as string);
        setResumeAnalyzeData(results);
        console.log(results);
        toast.success("Analyze resume rates and scores are successfully done!");
      } catch (error) {
        toast.error("Failed to analyze scores.");
      }
    });
  };
  const handleSyncToTemplate = async () => {
    if (
      !(await confirmDialog({
        confirmText: "Yes, Sync It!",
        title: "Are you absolutely sure!?",
        description: `By confirming this action, your resume template will be updated with the details from this job resume.`,
      }))
    )
      return;

    startSyncToTemplateTransition(async () => {
      try {
        await updateResumeTemplateContent(
          jobResume.baseResumeTemplateId!,
          resume
        );
        toast.success("Successfully synced to template!");
      } catch (error) {
        toast.error("Failed to sync.");
      }
    });
  };

  const [isRatingResume, startRatingResumeTransition] = useTransition();
  const handleResumeScore = (resumePdfBlob: Blob) => {
    startRatingResumeTransition(async () => {
      try {
        const file = new File([resumePdfBlob], "resume.pdf", {
          type: "application/pdf",
        });
        const formData = new FormData();
        formData.append("file", file);

        const analyzeResults = await analyzeResumeScore(formData, jobResume.id);
        setResumeAnalyzeData(analyzeResults);
        console.log(analyzeResults);
        toast.success("Successfully analyzed resume score!");
      } catch (error) {
        toast.error("Failed to analyze resume score.");
      }
    });
  };

  const handleDeleteJobResume = async () => {
    if (
      !(await confirmDialog({
        title: "Are you absolutely sure!?",
        description: `You are deleting the resume "${jobResume.name}".`,
      }))
    )
      return;

    startDeletingTransition(async () => {
      try {
        await deleteJobResume(jobResume.id);
        toast.success("Job resume deleted successfully");
        router.push("/resumes");
      } catch (error) {
        toast.error(error?.toString() || "Something went wrong");
      }
    });
  };

  return (
    <div className="h-[calc(100vh-56px)]">
      <Tabs
        defaultValue="builder"
        className="flex flex-col h-full justify-stretch "
      >
        {/* toolbar */}
        <div className="shrink-0 relative z-1 flex items-center border-b ">
          <div className="container">
            <div className="flex justify-between items-center py-2">
              <div>
                <h2 className="text-xl font-bold ">{jobResume.name} Resume</h2>
                <span className="text-muted-foreground text-xs">
                  Last updated <Moment date={jobResume.updatedAt} utc fromNow />
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      disabled={isDeleting}
                      onClick={handleDeleteJobResume}
                    >
                      <Trash size={14} />
                      Delete Resume
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={isAnalyzingScores}
                      onClick={() => handleAnalyzeScores(false)}
                    >
                      <Briefcase size={14} />
                      Analyze Scores
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={isAnalyzingScores}
                      onClick={() => handleAnalyzeScores(true)}
                    >
                      <Briefcase size={14} />
                      Clean & Analyze Scores
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={isAnalyzingScores}
                      onClick={() => {
                        if (!jobAnalyzeResults?.keywords) return;
                        const fr = constructFinalResume(
                          initialResume,
                          jobAnalyzeResults?.keywords
                        );
                        if (!fr) {
                          toast.error(
                            "Keywords are not extracted, please first analyze keywords."
                          );
                          return;
                        }
                        setResume(fr);
                        toast.success("Auto select has been done!");
                      }}
                    >
                      <CheckCheck size={14} />
                      Auto-choose by keywords
                    </DropdownMenuItem>

                    {jobResume.baseResumeTemplateId && (
                      <DropdownMenuItem
                        disabled={isSyncingToTemplate}
                        onClick={handleSyncToTemplate}
                      >
                        <RefreshCw size={14} />
                        Sync to Template
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <TabsList className=" " variant={"bottomline"}>
                <TabsTrigger value="builder" variant={"bottomline"}>
                  Resume Builder
                </TabsTrigger>
                <TabsTrigger value="jd" variant={"bottomline"}>
                  Job Description
                </TabsTrigger>
                <TabsTrigger value="score" variant={"bottomline"}>
                  Resume Score
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>
        <div className="flex-auto h-0 overflow-hidden">
          <div className="grid grid-cols-12 container overflow-hidden h-full relative">
            <div className="pe-2 col-span-7 overflow-auto h-full">
              <TabsContent className="pt-0 " value="builder">
                {resume && (
                  <ResumeBuilder
                    data={resume}
                    resumeAnalyzeData={resumeAnalyzeData}
                    onUpdate={async (tmp) => {
                      setResume(tmp);
                      try {
                        await updateJobResume({ ...jobResume, content: tmp });
                      } catch (ex) {
                        toast.error(
                          "Something went wrong when saving the resume changes."
                        );
                      }
                    }}
                  />
                )}
              </TabsContent>
              <TabsContent className="" value="jd">
                <JobPostPreview
                  job={job}
                  onJobUpdated={setJob}
                  // onScoresUpdate={setScores}
                  // resume={resume}
                />
              </TabsContent>
              <TabsContent className="" value="score">
                <BlobProvider document={<ResumeDocument resume={resume} />}>
                  {({ blob, url, loading, error }) => {
                    // if (error) {
                    //   return <div>Error: {error}</div>;
                    // }

                    return (
                      <LoadingButton
                        onClick={() => handleResumeScore(blob!)}
                        loading={loading || isRatingResume}
                        loadingText="Thinking ..."
                      >
                        Rate Resume!
                      </LoadingButton>
                    );
                  }}
                </BlobProvider>

                {/* <CustomPromptDialog /> */}

                {/* <CircleX className="text-red-500" /> Missed Keywords{" "} */}
                {resumeAnalyzeData?.missed_keywords && (
                  <div className="flex flex-col gap-5 mt-10">
                    <h3 className="text-xl font-bold">
                      Rate: {resumeAnalyzeData.score}%
                    </h3>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <CircleX className="text-red-500" size={18} />
                        Missed Keywords (
                        {resumeAnalyzeData.missed_keywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {resumeAnalyzeData.missed_keywords.map((k) => (
                          <span
                            key={k}
                            className="px-2 py-1 text-sm bg-slate-200 rounded-full"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={18} />
                        Matched Keywords (
                        {resumeAnalyzeData.matched_keywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {resumeAnalyzeData.matched_keywords.map((k) => (
                          <span
                            key={k}
                            className="px-2 py-1 text-sm bg-slate-200 rounded-full"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    {resumeAnalyzeData.notes?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          Notes ({resumeAnalyzeData.notes.length})
                        </h3>
                        <div className="flex flex-col gap-4">
                          {resumeAnalyzeData.notes.map((n, index) => (
                            <div className="flex flex-col gap-2" key={n.title}>
                              <h4 className=" font-bold">
                                {index + 1}. {n.title}
                              </h4>
                              <div className="flex ">
                                <div>
                                  <LucideX className="text-red-500" size={18} />
                                </div>
                                <p
                                  className="px-2 text-sm  "
                                  dangerouslySetInnerHTML={{ __html: n.text }}
                                ></p>
                              </div>
                              {n.improvement && (
                                <div className="flex ">
                                  <div>
                                    <LucideCheck
                                      className="text-green-500"
                                      size={18}
                                    />
                                  </div>
                                  <p
                                    className="px-2 text-sm  "
                                    dangerouslySetInnerHTML={{
                                      __html: n.improvement,
                                    }}
                                  ></p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
            <div className="col-span-5 overflow-auto h-full">
              <CVPreview data={resume} jobResume={jobResume} />
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

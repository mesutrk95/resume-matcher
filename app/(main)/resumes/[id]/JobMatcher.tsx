"use client";

import React, { useTransition } from "react";
import { ResumeBuilder } from "@/components/job-resumes/resume-builder";
import { Job, JobResume } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  analyzeResumeItemsScores,
  deleteJobResume,
} from "@/actions/job-resume";
import CVPreview from "@/components/job-resumes/resume-pdf-preview";
import { updateResumeTemplateContent } from "@/actions/resume-template";
import {
  BotMessageSquare,
  Briefcase,
  BriefcaseBusiness,
  Ellipsis,
  Gauge,
  NotebookPen,
  RefreshCw,
  Trash,
} from "lucide-react";
import { JobPostPreview } from "@/components/jobs/job-post-preview";
import Moment from "react-moment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { ChatInterface } from "@/components/chat";
import { useResumeBuilder } from "@/components/job-resumes/resume-builder/context/useResumeBuilder";
import { ResumeScoreTab } from "./ResumeScoreTab";

export const JobMatcher = ({
  jobResume,
  job,
}: {
  jobResume: JobResume;
  job: Job;
}) => {
  const router = useRouter();
  const { id: jobResumeId } = useParams();
  const { resume, setResumeAnalyzeResults } = useResumeBuilder();

  const [isDeleting, startDeletingTransition] = useTransition();
  const [isSyncingToTemplate, startSyncToTemplateTransition] = useTransition();
  const [isAnalyzingScores, startAnalyzeScoresTransition] = useTransition();
  const handleAnalyzeScores = async (forceRefresh: boolean) => {
    startAnalyzeScoresTransition(async () => {
      toast.info("Analyzing resume rates is in progress!");
      try {
        const results = await analyzeResumeItemsScores(
          jobResumeId as string,
          forceRefresh
        );
        setResumeAnalyzeResults(results);
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

  // console.log(resumeExperiencesToString(resume, true, true))

  return (
    // <PDFBuilderProvider resume={resume}>
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
                    {/* <DropdownMenuItem
                        disabled={isAnalyzingScores}
                        onClick={() => {
                          if (!jobAnalyzeResults?.keywords) return;
                          const fr = constructFinalResume(
                            resume,
                            jobAnalyzeResults?.keywords
                          );
                          if (!fr) {
                            toast.error(
                              "Keywords are not extracted, please first analyze keywords."
                            );
                            return;
                          }
                          saveResume(fr);
                          toast.success("Auto select has been done!");
                        }}
                      >
                        <CheckCheck size={14} />
                        Auto-choose by keywords
                      </DropdownMenuItem> */}

                    {jobResume.baseResumeTemplateId && (
                      <DropdownMenuItem
                        disabled={isSyncingToTemplate}
                        onClick={handleSyncToTemplate}
                      >
                        <RefreshCw size={14} />
                        Sync to Template
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      disabled={isDeleting}
                      onClick={handleDeleteJobResume}
                    >
                      <Trash size={14} />
                      Delete Resume
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <TabsList className=" " variant={"bottomline"}>
                <TabsTrigger value="builder" variant={"bottomline"}>
                  <NotebookPen className="me-2" size={18} />
                  Resume Builder
                </TabsTrigger>
                <TabsTrigger value="jd" variant={"bottomline"}>
                  <BriefcaseBusiness className="me-2" size={18} />
                  Job Description
                </TabsTrigger>
                <TabsTrigger value="score" variant={"bottomline"}>
                  <Gauge className="me-2" size={18} />
                  Resume Score
                </TabsTrigger>
                <TabsTrigger value="chat" variant={"bottomline"}>
                  <BotMessageSquare className="me-2" size={18} />
                  Ask AI
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>
        <div className="flex-auto h-0 overflow-hidden">
          <div className="grid grid-cols-12 container overflow-hidden h-full relative">
            <div className="pe-2 col-span-7 overflow-auto h-full">
              <TabsContent className="pt-0 " value="builder">
                <ResumeBuilder />
              </TabsContent>
              <TabsContent className="" value="jd">
                <JobPostPreview job={job} />
              </TabsContent>
              <TabsContent className="" value="score">
                <ResumeScoreTab jobResume={jobResume} />
              </TabsContent>
              <TabsContent className="h-full mt-0 py-5" value="chat">
                <ChatInterface jobResume={jobResume} resume={resume} />
              </TabsContent>
            </div>
            <div className="col-span-5 overflow-hidden h-full">
              <div className="p-0 h-full w-full relative">
                <CVPreview data={resume} jobResume={jobResume} />
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
    // </PDFBuilderProvider>
  );
};

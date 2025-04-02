"use client";

import React, { useMemo, useTransition } from "react";
import { AccordionResumeBuilder } from "@/components/job-resumes/resume-builder";
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
  ScanEye,
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
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubscription } from "@/providers/SubscriptionProvider";

export const JobMatcher = ({
  jobResume,
  job,
}: {
  jobResume: JobResume;
  job?: Job;
}) => {
  const router = useRouter();
  const { isTrialingBannerEnable } = useSubscription();
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

  const navbarHeight = useMemo(
    () => 58 + (isTrialingBannerEnable ? 52 : 0),
    [isTrialingBannerEnable]
  );

  return (
    // <PDFBuilderProvider resume={resume}>
    <div
      style={{
        height: `calc(100vh - ${navbarHeight}px)`,
      }}
    >
      <div
        defaultValue="builder"
        className="flex flex-col h-full justify-stretch"
      >
        {/* toolbar */}
        <div className="shrink-0 relative z-1 flex items-center border-b bg-white">
          <div className="container ">
            <div className="flex justify-between items-center py-2  ">
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
            {/* <div>
            </div> */}
          </div>
        </div>
        <div className="flex-auto h-0">
          <div className="grid grid-cols-12 gap-2 container h-full py-2 relative">
            <Card className="col-span-7 h-full border-r">
              <Tabs
                defaultValue="builder"
                className="flex flex-col h-full justify-stretch "
              >
                <TabsList
                  className="w-full shrink-0 border-b  "
                  variant={"bottomline"}
                >
                  <TabsTrigger value="builder" variant={"bottomline"}>
                    <NotebookPen className="me-2" size={18} />
                    Resume Builder
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
                <CardContent className="flex-grow h-0 p-0 relative">
                  <TabsContent className="p-0 mt-0 h-full" value="builder">
                    <ScrollArea className="h-full">
                      <AccordionResumeBuilder />
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent className="p-0 m-0 h-full" value="score">
                    <ScrollArea className="h-full">
                      <div className=" p-5">
                        <ResumeScoreTab jobResume={jobResume} />
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent className="h-full p-0 m-0" value="chat">
                    <ChatInterface jobResume={jobResume} resume={resume} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
            <Card className="col-span-5 overflow-hidden h-full">
              <Tabs
                defaultValue="preview"
                className="flex flex-col h-full justify-stretch "
              >
                <TabsList
                  className="w-full border-b bg-white"
                  variant={"bottomline"}
                >
                  <TabsTrigger value="preview" variant={"bottomline"}>
                    <ScanEye className="me-2" size={18} />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="jd" variant={"bottomline"}>
                    <BriefcaseBusiness className="me-2" size={18} />
                    {job ? "Job Description" : "Resume Job"}
                  </TabsTrigger>
                </TabsList>
                <CardContent className="overflow-auto h-full p-0">
                  <TabsContent className="p-5 pt-0 relative" value="preview">
                    <CVPreview data={resume} jobResume={jobResume} />
                  </TabsContent>

                  <TabsContent className="p-0 px-3 pb-3" value="jd">
                    {job && <JobPostPreview job={job} />}
                    {!job && <div>Please attach a job to this resume!</div>}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
    // </PDFBuilderProvider>
  );
};

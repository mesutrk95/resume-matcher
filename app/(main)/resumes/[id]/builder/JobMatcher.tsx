'use client';

import React, { useMemo, useTransition } from 'react';
import { ResumeBuilder } from '@/components/job-resumes/resume-builder';
import { Job, JobResume, ResumeTemplate } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { analyzeResumeItemsScores, deleteJobResume } from '@/actions/job-resume';
import { ResumePreview } from '@/components/job-resumes/resume-pdf-preview';
import { updateCareerProfileContent } from '@/actions/career-profiles';
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
} from 'lucide-react';
import { JobPostPreview } from '@/components/jobs/job-post-preview';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { confirmDialog } from '@/components/shared/confirm-dialog';
import { ChatInterface } from '@/components/chat';
import { useResumeBuilder } from '@/components/job-resumes/resume-builder/context/useResumeBuilder';
import { ResumeScoreTab } from './ResumeScoreTab';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/providers/SubscriptionProvider';
import { ConnectJobToResume } from '@/components/job-resumes/connect-job-to-resume';
import { ResumeHeader } from '../../../../../components/job-resumes/job-resume-builder-header';
import { ResumeTemplateContent } from '@/types/resume-template';

export const JobMatcher = ({ jobResume, job }: { jobResume: JobResume; job: Job | null }) => {
  const router = useRouter();
  const { isTrialingBannerEnable } = useSubscription();
  const { id: jobResumeId } = useParams();
  const { resume, resumeTemplate, setResumeAnalyzeResults } = useResumeBuilder();

  const [isDeleting, startDeletingTransition] = useTransition();
  const [isSyncingToCareerProfile, startSyncToCareerProfileTransition] = useTransition();
  const [isAnalyzingScores, startAnalyzeScoresTransition] = useTransition();
  const handleAnalyzeScores = async (forceRefresh: boolean) => {
    startAnalyzeScoresTransition(async () => {
      toast.info('Analyzing resume rates is in progress!');
      try {
        const results = await analyzeResumeItemsScores(jobResumeId as string, forceRefresh);
        if (!results.data) {
          toast.error(results.error?.message || 'Failed to analyze scores.');
          return;
        }
        setResumeAnalyzeResults(results.data);
        // console.log(results);
        toast.success('Analyze resume rates and scores are successfully done!');
      } catch (error) {
        toast.error('Failed to analyze scores.');
      }
    });
  };
  const handleSyncToCareerProfile = async () => {
    const careerProfileId = jobResume.baseCareerProfileId;
    if (!careerProfileId) {
      toast.error('This resume is not connected to any career profile!');
      return;
    }
    if (
      !(await confirmDialog({
        confirmText: 'Yes, Sync It!',
        title: 'Are you absolutely sure!?',
        description: `By confirming this action, your resume career profile will be updated with the details from this job resume.`,
      }))
    )
      return;

    startSyncToCareerProfileTransition(async () => {
      try {
        await updateCareerProfileContent(careerProfileId, resume);
        toast.success('Successfully synced to your Career Profile!');
      } catch (error) {
        toast.error('Failed to sync.');
      }
    });
  };
  const handleDeleteJobResume = async () => {
    if (
      !(await confirmDialog({
        title: 'Are you absolutely sure!?',
        description: `You are deleting the resume "${jobResume.name}".`,
      }))
    )
      return;

    startDeletingTransition(async () => {
      try {
        await deleteJobResume(jobResume.id);
        toast.success('Job resume deleted successfully');
        router.push('/resumes');
      } catch (error) {
        toast.error(error?.toString() || 'Something went wrong');
      }
    });
  };

  const navbarHeight = useMemo(() => 57, []);

  return (
    <div>
      <div defaultValue="builder" className="flex flex-col   justify-stretch">
        {/* toolbar */}
        <div className=" relative z-1 flex items-center pt-2 ">
          <div className="container">
            <div className="flex justify-between items-center py-2 ps-1 ">
              <ResumeHeader jobResume={jobResume} />

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

                    {jobResume.baseCareerProfileId && (
                      <DropdownMenuItem
                        disabled={isSyncingToCareerProfile}
                        onClick={handleSyncToCareerProfile}
                      >
                        <RefreshCw size={14} />
                        Sync to Career Profile
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem disabled={isDeleting} onClick={handleDeleteJobResume}>
                      <Trash size={14} />
                      Delete Resume
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        <div className=" container">
          <div className="grid grid-cols-12 gap-2 h-full relative">
            <div className="col-span-7 h-full">
              <Tabs
                defaultValue="builder"
                className="flex flex-col h-full justify-stretch shrink-0 w-full "
              >
                <div
                  className="pt-2 sticky z-10 bg-slate-100 rounded-xl-b"
                  style={{ top: navbarHeight + 'px' }}
                >
                  <TabsList className="w-full shrink-0 border-b bg-background" variant={'outline'}>
                    <TabsTrigger value="builder" variant={'outline'} className="px-5">
                      <NotebookPen className="me-2" size={18} />
                      Resume Builder
                    </TabsTrigger>
                    <TabsTrigger value="score" variant={'outline'} className="px-5">
                      <Gauge className="me-2" size={18} />
                      Resume Score
                    </TabsTrigger>
                    <TabsTrigger value="chat" variant={'outline'} className="px-5">
                      <BotMessageSquare className="me-2" size={18} />
                      Ask AI
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="mt-2 pb-2 px-[1px]">
                  <TabsContent className="p-0 mt-0 " value="builder">
                    <ResumeBuilder />
                  </TabsContent>
                  <TabsContent className="p-0 m-0 h-full" value="score">
                    <ResumeScoreTab jobResume={jobResume} />
                  </TabsContent>
                  <TabsContent className="p-0 m-0" value="chat">
                    <ChatInterface
                      jobResume={jobResume}
                      resume={resume}
                      resumeTemplate={resumeTemplate?.content as ResumeTemplateContent}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <div className="col-span-5">
              <div
                className={`w-full sticky py-2`}
                style={{
                  height: `calc(100vh - ${navbarHeight}px)`,
                  top: `${navbarHeight}px`,
                }}
              >
                <Tabs
                  defaultValue="preview"
                  className="flex flex-col justify-stretch h-full w-full"
                >
                  <TabsList className="w-full border-b bg-white shrink-0" variant={'outline'}>
                    <TabsTrigger value="preview" variant={'outline'} className="px-5">
                      <ScanEye className="me-2" size={18} />
                      Resume Preview
                    </TabsTrigger>
                    <TabsTrigger value="jd" variant={'outline'} className="px-5">
                      <BriefcaseBusiness className="me-2" size={18} />
                      {job ? 'Job Description' : 'Resume Job'}
                    </TabsTrigger>
                  </TabsList>
                  <Card className="col-span-5 overflow-hidden flex-auto h-0 mt-2">
                    <div className="flex flex-col h-full justify-stretch ">
                      <TabsContent
                        className="shrink-0 pt-0 relative w-full h-full p-0 m-0"
                        value="preview"
                      >
                        <ResumePreview resume={resume} jobResume={jobResume} />
                      </TabsContent>

                      <TabsContent className="flex-auto h-0 p-0 m-0" value="jd">
                        <CardContent className="overflow-auto h-full p-0">
                          {job && (
                            <div className="p-4">
                              <JobPostPreview job={job} />
                            </div>
                          )}
                          {!job && (
                            <div className="p-4 flex justify-center items-center ">
                              <div className="text-center py-5">
                                <h3 className="text-lg font-bold">Target a Job!</h3>
                                <p className="text-muted-foreground text-xs mb-4">
                                  Select the job you’re targeting so we can personalize this resume
                                  for you!
                                </p>
                                <ConnectJobToResume jobResumeId={jobResume.id} />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </TabsContent>
                    </div>
                  </Card>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

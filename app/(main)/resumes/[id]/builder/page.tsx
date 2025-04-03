import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { JobMatcher } from "./JobMatcher";
import { ResumeAnalyzeResults, ResumeContent } from "@/types/resume";
import { Metadata } from "next";
import { ResumeBuilderProvider } from "@/components/job-resumes/resume-builder/context/ResumeBuilderProvider";
import { updateJobResume } from "@/actions/job-resume";
import { toast } from "sonner";

interface EditResumePageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Build Resume for job",
  description: "Build your resume based on job description.",
};

export default async function EditResumePage({ params }: EditResumePageProps) {
  const user = await currentUser();

  // Fetch the ResumeJob record
  const jobResume = await db.jobResume.findUnique({
    where: {
      id: params.id,
      userId: user?.id,
    },
    include: {
      job: true,
      //   resumeTemplate: true,
    },
  });

  if (!jobResume) {
    notFound();
  }

  const content = jobResume?.content as ResumeContent;

  return (
    <ResumeBuilderProvider
      // scheme="accordion"
      initialResume={content}
      initialResumeAnalyzeResults={
        jobResume.analyzeResults as ResumeAnalyzeResults
      }
      onUpdated={async (resume) => {
        "use server";
        // console.log("resume updateddddddddd");
        try {
          await updateJobResume({ ...jobResume, content: resume });
        } catch (ex) {
          toast.error("Something went wrong when saving the resume changes.");
        }
      }}
    >
      <JobMatcher jobResume={jobResume} job={jobResume.job!}></JobMatcher>
    </ResumeBuilderProvider>
  );
}

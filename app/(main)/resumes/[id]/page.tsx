import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { JobMatcher } from "./JobMatcher";
import { ResumeContent } from "@/types/resume";
import { Metadata } from "next";

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Edit Resume for {jobResume.job.title}
      </h1>

      <JobMatcher
        jobResume={jobResume}
        initialResume={content}
        initialJob={jobResume.job}
      ></JobMatcher>
    </div>
  );
}

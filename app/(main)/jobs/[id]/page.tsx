import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { JobResumeCard } from "@/components/job-resumes/resume-card";
import { format } from "date-fns";

interface JobResumesPageProps {
  params: {
    id: string;
  };
}

export default async function JobResumesPage({ params }: JobResumesPageProps) {
  const user = await currentUser();

  // Fetch the job
  const job = await db.job.findUnique({
    where: {
      id: params.id,
      userId: user?.id,
    },
  });

  if (!job) {
    notFound();
  }

  // Fetch all ResumeJob records associated with this job
  const resumeJobs = await db.jobResume.findMany({
    where: {
      jobId: params.id,
      userId: user?.id,
    },
    // include: {
    //   resumeTemplate: true,
    // },
    // orderBy: {
    //   createdAt: "desc",
    // },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href={`/jobs`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      {/* <h1 className="text-3xl font-bold">Resumes for {job.title}</h1> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Job Description Column */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg  ">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">{job.title}</h3>
            <p className="text-sm text-muted-foreground">
              {job.companyName} - {job.location} - Posted at{" "}
              {job.postedAt && format(job.postedAt || "", "yyyy/MM/dd")}
            </p>
            <h3 className="text-xl font-bold">Job Description</h3>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: job.description || "" }}
            ></div>
          </div>
        </div>

        {/* Resumes Column */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg  ">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Resumes</h3>
            <div className="space-y-3">
              {resumeJobs.map((resumeJob) => (
                <JobResumeCard key={resumeJob.id} jobResume={resumeJob} />
              ))}
            </div>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href={`/jobs/${job.id}/create-resume`}>
                  Create a Resume
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
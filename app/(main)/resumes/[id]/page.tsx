import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

interface EditResumePageProps {
  params: {
    id: string;
  };
}

export default async function EditResumePage({ params }: EditResumePageProps) {
  const user = await currentUser();

  // Fetch the ResumeJob record
  const resumeJob = await db.jobResume.findUnique({
    where: {
      id: params.id,
      userId: user?.id,
    },
    include: {
      job: true,
      //   resumeTemplate: true,
    },
  });

  if (!resumeJob) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Edit Resume for {resumeJob.job.title}
      </h1>
      {/* <p>Template: {resumeJob.resumeTemplate.name}</p> */}
      {/* Add your resume editor here */}
    </div>
  );
}

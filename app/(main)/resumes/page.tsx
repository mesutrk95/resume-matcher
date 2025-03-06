import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { JobResumeCard } from "@/components/job-resumes/resume-card";

export default async function ResumesPage() {
  const user = await currentUser();

  if (!user) {
    notFound();
  }

  // Fetch all JobResume records for the current user
  const jobResumes = await db.jobResume.findMany({
    where: {
      userId: user.id,
    },
    include: {
      job: true,
      //   resumeTemplate: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Resumes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobResumes.length === 0 ? (
          <p className="text-muted-foreground">No resumes found.</p>
        ) : (
          jobResumes.map((jobResume) => (
            <JobResumeCard key={jobResume.id} jobResume={jobResume} />
          ))
        )}
      </div>
    </div>
  );
}

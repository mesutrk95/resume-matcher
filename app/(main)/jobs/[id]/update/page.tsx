import { JobForm } from "@/components/jobs/job-form";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Update Job",
};

export default async function UpdateJobPage({
  params,
}: {
  params: { id: string };
}) {
  const job = await db.job.findUnique({
    where: { id: params.id },
  });

  if (!job) return null;

  const initialData = {
    id: job.id,
    title: job.title || "",
    companyName: job.companyName || "",
    location: job.location || "",
    description: job.description || "",
    url: job.url || "",
    postedAt: (job.postedAt && format(job.postedAt, "yyyy-MM-dd")) || null,
  };

  return <JobForm initialData={initialData} />;
}

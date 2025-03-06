import { JobForm } from "@/components/form/job-form";
import { db } from "@/lib/db";
import { Metadata } from "next";

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
    description: job.description || "",
    url: job.url || "",
    postedAt: job.postedAt || null,
  };

  return <JobForm initialData={initialData} />;
}

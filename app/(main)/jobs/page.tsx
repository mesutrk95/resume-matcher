import { Metadata } from "next";
import { JobsDataTable } from "@/components/jobs/jobs-data-table";
import { JobStatus } from "@prisma/client";
import { getJobs } from "@/actions/job";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Manage your job listings",
};

interface JobsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const statuses = searchParams.status
    ? (searchParams.status?.split(",") as JobStatus[])
    : undefined;
  const result = await getJobs({ ...searchParams, statuses });

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-2">
            Manage your job listings and applications
          </p>
        </div>
      </div>
      <JobsDataTable
        data={result.jobs}
        total={result.total}
        currentPage={result.page}
        pageSize={result.pageSize}
        searchQuery={searchParams.search}
        statusFilter={statuses}
      />
    </div>
  );
}

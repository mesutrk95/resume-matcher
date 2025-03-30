import { Metadata } from "next";
import { JobsDataTable } from "@/components/jobs/jobs-data-table";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { JobStatus, Prisma } from "@prisma/client";

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
  const user = await currentUser();
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const search = searchParams.search || "";
  const statuses = searchParams.status
    ? searchParams.status.split(",")
    : undefined;
  const skip = (page - 1) * pageSize;

  // Prepare search filter
  const searchFilter = search
    ? {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            companyName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }
    : {};

  // Prepare status filter
  const statusFilter =
    statuses && statuses.length > 0
      ? { status: { in: statuses as JobStatus[] } }
      : {};

  // Get jobs with filters, pagination and sorting
  const jobs = await db.job.findMany({
    where: {
      userId: user?.id,
      ...searchFilter,
      ...statusFilter,
    },
    select: {
      id: true,
      title: true,
      companyName: true,
      location: true,
      createdAt: true,
      postedAt: true,
      status: true,
      url: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  // Get total count for pagination
  const totalJobs = await db.job.count({
    where: {
      userId: user?.id,
      ...searchFilter,
      ...statusFilter,
    },
  });


  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-2">
            Manage your job listings and applications
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/create">
            <Plus className="mr-2 h-4 w-4" />
            Add New Job
          </Link>
        </Button>
      </div>
      <JobsDataTable
        data={jobs}
        total={totalJobs}
        currentPage={page}
        pageSize={pageSize}
        searchQuery={search}
        statusFilter={statuses}
      />
    </div>
  );
}

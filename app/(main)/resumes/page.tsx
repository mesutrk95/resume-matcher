import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { JobResumeCard } from "@/components/job-resumes/resume-card";
import { JobResumesDataTable } from "@/components/job-resumes/resumes-data-table";
import { Prisma } from "@prisma/client";

interface ResumesPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
  };
}

export default async function ResumesPage({ searchParams }: ResumesPageProps) {
  const user = await currentUser();
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const search = searchParams.search || "";
  const skip = (page - 1) * pageSize;

  // Prepare search filter
  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  // Get templates with filters, pagination and sorting
  const jobResumes = await db.jobResume.findMany({
    where: {
      userId: user?.id,
      ...searchFilter,
    },
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  // Get total count for pagination
  const totalJobResume = await db.jobResume.count({
    where: {
      userId: user?.id,
      ...searchFilter,
    },
  });

  const totalPages = Math.ceil(totalJobResume / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Resumes</h1>
        <p className="text-muted-foreground mt-2">
          Manage your resumes and applications
        </p>
      </div>
      <JobResumesDataTable
        data={jobResumes}
        pageCount={totalPages}
        currentPage={page}
        pageSize={pageSize}
        searchQuery={search}
      />
    </div>
  );
}

import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { JobResumesDataTable } from '@/components/job-resumes/resumes-data-table';
import { Job, JobResume, Prisma } from '@prisma/client';
import { Metadata } from 'next';

interface ResumesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Resumes List',
  description: 'List of all resumes.',
};

export default async function ResumesPage({ searchParams }: ResumesPageProps) {
  const user = await currentUser();

  // Await searchParams before accessing its properties
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const search = params.search || '';
  const skip = (page - 1) * pageSize;

  // Prepare search filter
  const searchFilter = search
    ? {
        OR: [{ name: { contains: search, mode: Prisma.QueryMode.insensitive } }],
      }
    : {};

  // Get templates with filters, pagination and sorting
  const jobResumes = await db.jobResume.findMany({
    where: {
      userId: user?.id,
      ...searchFilter,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      job: {
        select: {
          id: true,
          companyName: true,
        },
      },
      template: false,
    },
    orderBy: {
      createdAt: 'desc',
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

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Resumes</h1>
        <p className="text-muted-foreground mt-2">Manage your resumes and applications</p>
      </div>
      <JobResumesDataTable
        data={jobResumes}
        total={totalJobResume}
        currentPage={page}
        pageSize={pageSize}
        searchQuery={search}
      />
    </div>
  );
}

import { Metadata } from 'next';
import { ResumeTemplatesDateTable } from '@/components/resume-templates/resume-templates-data-table';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Resume Templates',
  description: 'Manage your resume templates',
};

interface TemplatesPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
  };
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
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
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }
    : {};

  // Get templates with filters, pagination and sorting
  const templates = await db.resumeTemplate.findMany({
    where: {
      userId: user?.id,
      ...searchFilter,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: pageSize,
  });

  // Get total count for pagination
  const totalTemplates = await db.resumeTemplate.count({
    where: {
      userId: user?.id,
      ...searchFilter,
    },
  });

  const totalPages = Math.ceil(totalTemplates / pageSize);

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Templates</h1>
          <p className="text-muted-foreground mt-2">Manage your resume templates</p>
        </div>
      </div>

      <ResumeTemplatesDateTable
        data={templates}
        pageCount={totalPages}
        currentPage={page}
        pageSize={pageSize}
        searchQuery={search}
      />
    </div>
  );
}

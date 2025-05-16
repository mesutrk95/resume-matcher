'use client';

import { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Edit, Plus, Search, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Job, JobResume } from '@prisma/client'; // Assuming you have an action to delete a job resume
import { toast } from 'sonner';
import Moment from 'react-moment';
import { confirmDialog } from '../shared/confirm-dialog';
import { LinkableTableCell } from '../ui/linkable-table-cell';
import { trpc } from '@/providers/trpc';

type JobResumeItem = Omit<
  JobResume & { job: Pick<Job, 'companyName'> | null },
  'analyzeResults' | 'content' | 'jobId' | 'userId' | 'baseCareerProfileId' | 'templateId'
>;

interface JobResumesDataTableProps {
  data: JobResumeItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
}

export function JobResumesDataTable({
  data,
  total,
  currentPage,
  pageSize,
  searchQuery,
}: JobResumesDataTableProps) {
  const pageCount = Math.ceil(total / pageSize);
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchQuery);
  const deleteJobResume = trpc.jobResume.deleteJobResume.useMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', '1');
    params.set('pageSize', pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChangePage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteJobResume = async (jobResume: JobResumeItem) => {
    if (
      !(await confirmDialog({
        title: 'Are you absolutely sure!?',
        description: `You are deleting the resume "${jobResume.name}"${
          jobResume.job && ` at "${jobResume.job.companyName}"`
        }.`,
      }))
    )
      return;

    await deleteJobResume.mutateAsync(jobResume.id);
    toast.success('Job resume deleted successfully');
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search in resumes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant={'outline'}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Button asChild>
          <Link href="/resumes/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Resume
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No resumes found!
                </TableCell>
              </TableRow>
            ) : (
              data.map(jobResume => (
                <TableRow key={jobResume.id}>
                  <LinkableTableCell
                    className="font-medium"
                    href={`/resumes/${jobResume.id}/builder`}
                  >
                    {jobResume.name}
                  </LinkableTableCell>
                  <LinkableTableCell href={`/resumes/${jobResume.id}/builder`}>
                    {jobResume.job ? (
                      jobResume.job?.companyName
                    ) : (
                      <span className="text-muted-foreground">No attached job</span>
                    )}
                  </LinkableTableCell>
                  <LinkableTableCell href={`/resumes/${jobResume.id}/builder`}>
                    <Moment date={jobResume.createdAt} format="MMM d, yyyy HH:mm" utc />
                  </LinkableTableCell>
                  <LinkableTableCell href={`/resumes/${jobResume.id}/builder`}>
                    <Moment date={jobResume.updatedAt} format="MMM d, yyyy HH:mm" utc />
                  </LinkableTableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant={'outline-destructive'}
                      disabled={deleteJobResume.isPending}
                      onClick={() => handleDeleteJobResume(jobResume)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button asChild variant={'outline'} disabled={deleteJobResume.isPending}>
                      <Link href={`/resumes/${jobResume.id}/builder`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {data.length > 0 && (
            <>
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, (currentPage - 1) * pageSize + data.length)}
              </span>{' '}
              of <span className="font-medium">{total}</span> job resumes
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(currentPage + 1)}
            disabled={currentPage >= pageCount}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
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
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  GalleryVerticalEnd,
  LucideArchive,
  LucideCheckCircle,
  LucideFileX,
  LucideMessageCircleX,
  LucideScrollText,
  MapPin,
  Plus,
  Search,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Job, JobStatus } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { deleteJob, updateJobStatus } from '@/actions/job';
import { toast } from 'sonner';
import Moment from 'react-moment';
import { confirmDialog } from '../shared/confirm-dialog';
import { JobStatusIndicator } from './job-status-badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { getJobStatusLabel, JOB_STATUS_CONFIG } from './utils';
import clsx from 'clsx';
import { ContentLoading } from '@/app/_components/loading';
import { LinkableTableCell } from '../ui/linkable-table-cell';

type JobItem = Omit<Job, 'analyzeResults' | 'description' | 'userId' | 'moreDetails'>;

interface JobsDataTableProps {
  data: JobItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  searchQuery?: string;
  statusFilter?: string[];
}

export function JobsDataTable({
  data,
  total,
  currentPage,
  pageSize,
  searchQuery,
  statusFilter,
}: JobsDataTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchQuery);

  const [selectedStatus, setSelectedStatus] = useState<JobStatus | undefined>(
    statusFilter && statusFilter.length > 0 ? (statusFilter[0] as JobStatus) : undefined,
  );
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const doSearch = (filter: {
    page: number;
    pageSize: number;
    search?: string;
    status?: JobStatus;
  }) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.search) params.set('search', filter.search);
    if (filter.status) params.set('status', filter.status);
    params.set('page', filter.page.toString());
    params.set('pageSize', filter.pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    doSearch({
      page: 1,
      pageSize,
      search,
      status: selectedStatus,
    });
  };

  const handleChangePage = (page: number) => {
    doSearch({
      page,
      pageSize,
      search,
      status: selectedStatus,
    });
  };

  const handleDeleteJob = async (item: JobItem) => {
    if (
      await confirmDialog({
        title: 'Are you absolutely sure?!',
        description: `You are deleting the job "${item.title}" at "${item.companyName}".`,
      })
    ) {
      try {
        setIsDeleting(item.id);
        const result = await deleteJob(item.id);

        if (!result.success) {
          toast.error(result.error?.message || 'Failed to delete job');
          return;
        }

        toast.success('Job deleted successfully');
        router.refresh();
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleUpdateStatus = async (job: JobItem, status: JobStatus) => {
    updateJobStatus(job.id, status);
  };

  const handleOnStatusChanged = (status?: JobStatus) => {
    setSelectedStatus(status as JobStatus);
    doSearch({
      page: 1,
      pageSize,
      search,
      status,
    });
  };
  useEffect(() => {
    // This will run when the route changes
    setLoading(false);
  }, [pathname, searchParams]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="max-w-[400px]">
            <Select
              value={selectedStatus}
              onValueChange={s => handleOnStatusChanged(s === 'all' ? undefined : (s as JobStatus))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Status">
                  <span
                    {...(((selectedStatus as string) === 'all' || selectedStatus === undefined) && {
                      className: 'text-muted-foreground',
                    })}
                  >
                    {(selectedStatus as string) === 'all' || selectedStatus === undefined
                      ? 'Filter by Status'
                      : getJobStatusLabel(selectedStatus)}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Application Status</SelectLabel>
                  <SelectItem value="all">
                    <div className={clsx('flex items-center gap-2', ``)}>
                      <GalleryVerticalEnd size={14} />
                      All Jobs
                    </div>
                  </SelectItem>
                  {Object.values(JobStatus).map(status => {
                    const Icon = JOB_STATUS_CONFIG[status].icon;
                    return (
                      <SelectItem key={status} value={status}>
                        <div className={clsx('flex items-center gap-2', ``)}>
                          <Icon size={14} />
                          {getJobStatusLabel(status)}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* <MultipleSelector
              options={Object.values(JobStatus).map((status) => ({
                value: status,
                label: getJobStatusLabel(status),
              }))}
              value={selectedStatuses}
              onChange={setSelectedStatuses}
              maxSelected={3}
              placeholder="Filter by status..."
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                  no results found.
                </p>
              }
            /> */}
          </div>
          <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
            <Input
              placeholder="Search in jobs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
        <Button asChild>
          <Link href="/jobs/create">
            <Plus className="mr-2 h-4 w-4" />
            Add New Job
          </Link>
        </Button>
      </div>

      <ContentLoading loading={loading} className="my-10">
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                {/* <TableHead>Company</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No jobs found!
                  </TableCell>
                </TableRow>
              ) : (
                data.map(job => (
                  <TableRow key={job.id}>
                    <LinkableTableCell className="font-medium" href={`/jobs/${job.id}`}>
                      <h6 className="max-w-72 overflow-hidden text-ellipsis block text-nowrap">
                        {job.title}
                      </h6>

                      {job.companyName && (
                        <span className="text-muted-foreground text-xs">At {job.companyName}</span>
                      )}
                    </LinkableTableCell>
                    {/* <TableCell></TableCell> */}
                    <LinkableTableCell className="capitalize" href={`/jobs/${job.id}`}>
                      <JobStatusIndicator status={job.status} />
                    </LinkableTableCell>
                    <LinkableTableCell href={`/jobs/${job.id}`}>
                      <div className="flex gap-1 items-center">
                        {job.location ? (
                          <>
                            <MapPin className="text-muted-foreground" size={14} />
                            {job.location}
                          </>
                        ) : (
                          <span className="text-muted-foreground">No Location</span>
                        )}
                      </div>
                    </LinkableTableCell>
                    <LinkableTableCell href={`/jobs/${job.id}`}>
                      <div className="flex flex-col">
                        <Moment date={job.createdAt} format="yyyy/MM/DD HH:mm" utc />
                        <span className="text-xs text-muted-foreground">
                          <Moment date={job.createdAt} fromNow utc />
                        </span>
                      </div>
                    </LinkableTableCell>
                    <LinkableTableCell href={`/jobs/${job.id}`}>
                      {job.postedAt && (
                        <div className="flex flex-col">
                          <Moment date={job.postedAt} format="YYYY/MM/DD" utc />
                          <span className="text-xs text-muted-foreground">
                            <Moment date={job.postedAt} fromNow utc />
                          </span>
                        </div>
                      )}
                    </LinkableTableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/jobs/${job.id}/update`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/jobs/${job.id}/create-resume`}>
                              <LucideScrollText className="mr-2 h-4 w-4" />
                              Make Resume
                            </Link>
                          </DropdownMenuItem>
                          {job.url && (
                            <DropdownMenuItem asChild>
                              <a href={job.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View listing
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteJob(job)}
                            disabled={isDeleting === job.id}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>

                          {job?.status === JobStatus.BOOKMARKED && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleUpdateStatus(job, JobStatus.APPLIED)}
                              >
                                <LucideCheckCircle className="mr-2 h-4 w-4" />
                                Mark as Applied
                              </DropdownMenuItem>
                            </>
                          )}
                          {job?.status === JobStatus.APPLIED && (
                            <>
                              {/* <DropdownMenuLabel className="text-muted-foreground">Application Status</DropdownMenuLabel> */}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleUpdateStatus(job, JobStatus.REJECTED)}
                              >
                                <LucideFileX className="mr-2 h-4 w-4" />
                                Mark as Rejected
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleUpdateStatus(job, JobStatus.NO_ANSWER)}
                              >
                                <LucideMessageCircleX className="mr-2 h-4 w-4" />
                                Mark as No Response
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleUpdateStatus(job, JobStatus.ARCHIVED)}
                              >
                                <LucideArchive className="mr-2 h-4 w-4" />
                                Archive Job
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                of <span className="font-medium">{total}</span> jobs
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
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ContentLoading>
    </div>
  );
}

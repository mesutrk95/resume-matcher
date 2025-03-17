"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  LucideArchive,
  LucideCheckCircle,
  LucideFileX,
  LucideMessageCircleX,
  LucideScrollText,
  Search,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Job, JobStatus } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { deleteJob, updateJobStatus } from "@/actions/job";
import { toast } from "sonner";
import Moment from "react-moment";
import MultipleSelector, { Option } from "../ui/multiple-select";
import { capitalizeText } from "@/lib/utils";

interface JobsDataTableProps {
  data: Job[];
  pageCount: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: string[];
}

function getJobStatusLabel(s: JobStatus) {
  return capitalizeText(s.replaceAll("_", " "));
}

export function JobsDataTable({
  data,
  pageCount,
  currentPage,
  pageSize,
  searchQuery,
  statusFilter,
}: JobsDataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchQuery);

  const [selectedStatuses, setSelectedStatuses] = useState<Option[]>(
    statusFilter.map((s) => ({ value: s, label: getJobStatusLabel(s as JobStatus) }))
  );
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedStatuses.length > 0)
      params.set("status", selectedStatuses.map((s) => s.value).join(","));
    params.set("page", "1");
    params.set("pageSize", pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChangePage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedStatuses.length > 0)
      params.set("status", selectedStatuses.join(","));
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteJob = async (id: string) => {
    try {
      setIsDeleting(id);
      const result = await deleteJob(id);

      if (!result.success) {
        toast.error(result.error || "Failed to delete job");
        return;
      }

      toast.success("Job deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdateStatus = async (job: Job, status: JobStatus) => {
    updateJobStatus(job.id, status);
  };

  useEffect(() => {
    handleSearch();
  }, [selectedStatuses]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="max-w-[400px]">
            <MultipleSelector
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
            />
          </div>
        </div>
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
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
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No jobs found!
                </TableCell>
              </TableRow>
            ) : (
              data.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                  </TableCell>
                  <TableCell>{job.companyName}</TableCell>
                  <TableCell className="capitalize">
                    {job.status?.toLowerCase()}
                  </TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <Moment
                      date={job.createdAt}
                      format="yyyy/MM/DD HH:mm"
                      utc
                    />
                  </TableCell>
                  <TableCell>
                    {job.postedAt && (
                      <div className="flex flex-col">
                        <Moment date={job.postedAt} format="YYYY/MM/DD" utc />
                        <span className="text-xs text-muted-foreground">
                          <Moment date={job.postedAt} fromNow utc />
                        </span>
                      </div>
                    )}
                  </TableCell>
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
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View listing
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteJob(job.id)}
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
                              onClick={() =>
                                handleUpdateStatus(job, JobStatus.APPLIED)
                              }
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
                              onClick={() =>
                                handleUpdateStatus(job, JobStatus.REJECTED)
                              }
                            >
                              <LucideFileX className="mr-2 h-4 w-4" />
                              Mark as Rejected
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() =>
                                handleUpdateStatus(job, JobStatus.NO_ANSWER)
                              }
                            >
                              <LucideMessageCircleX className="mr-2 h-4 w-4" />
                              Mark as No Response
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() =>
                                handleUpdateStatus(job, JobStatus.ARCHIVED)
                              }
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
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * pageSize,
                  (currentPage - 1) * pageSize + data.length
                )}
              </span>{" "}
              of <span className="font-medium">{pageCount * pageSize}</span>{" "}
              jobs
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

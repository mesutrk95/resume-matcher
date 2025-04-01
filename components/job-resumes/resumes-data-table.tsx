"use client";

import { useState, useTransition } from "react";
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
import { ChevronLeft, ChevronRight, Edit, Search, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Job, JobResume } from "@prisma/client";
import { deleteJobResume } from "@/actions/job-resume"; // Assuming you have an action to delete a job resume
import { toast } from "sonner";
import Moment from "react-moment";
import { confirmDialog } from "../shared/confirm-dialog";

type JobResumeItem = Omit<
  JobResume & { job: Pick<Job, "companyName"> },
  "analyzeResults" | "content" | "jobId" | "userId" | "baseResumeTemplateId"
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
  const [isDeleting, startDeletingTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    params.set("pageSize", pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChangePage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteJobResume = async (jobResume: JobResumeItem) => {
    if (
      !(await confirmDialog({
        title: "Are you absolutely sure!?",
        description: `You are deleting the resume "${jobResume.name}" at "${jobResume.job.companyName}".`,
      }))
    )
      return;

    startDeletingTransition(async () => {
      try {
        await deleteJobResume(jobResume.id);
        toast.success("Job resume deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error(error?.toString() || "Something went wrong");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input
            placeholder="Search in resumes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant={'outline'}>
            <Search className="h-4 w-4"  />
          </Button>
        </form>
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
                <TableCell colSpan={6} className="h-24 text-center">
                  No job resumes found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((jobResume) => (
                <TableRow key={jobResume.id}>
                  <TableCell className="font-medium">
                    <Link href={`/resumes/${jobResume.id}`}>
                      {jobResume.name}
                    </Link>
                  </TableCell>
                  <TableCell>{jobResume.job.companyName}</TableCell>
                  <TableCell>
                    <Moment
                      date={jobResume.createdAt}
                      format="MMM d, yyyy HH:mm"
                      utc
                    />
                  </TableCell>
                  <TableCell>
                    <Moment
                      date={jobResume.updatedAt}
                      format="MMM d, yyyy HH:mm"
                      utc
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant={"outline"}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteJobResume(jobResume)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button asChild variant={"outline"} disabled={isDeleting}>
                      <Link href={`/resumes/${jobResume.id}`}>
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
              of <span className="font-medium">{total}</span> job
              resumes
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

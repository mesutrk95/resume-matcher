"use client";

import { Job, JobStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { updateJobStatus } from "@/actions/job";
import { useTransition } from "react";
import { toast } from "sonner";

export const JobStatusUpdateForm = ({ job }: { job: Job }) => {
  const [isPending, startTransition] = useTransition();
  const handleJobStatusUpdate = (value: any) => {
    startTransition(async () => {
      try {
        await updateJobStatus(job.id, value);
        toast.success("Job status udpated.");
      } catch (error) {
        toast.error("Failed to update job status.");
      }
    });
  };

  return (
    <Select
      onValueChange={handleJobStatusUpdate}
      defaultValue={job.status || JobStatus.BOOKMARKED}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(JobStatus).map((status) => (
          <SelectItem key={status} value={status}>
            <span className="capitalize">{status?.toLowerCase()}</span>
            
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

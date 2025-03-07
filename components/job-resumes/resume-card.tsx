"use client";

import { JobResume } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransition } from "react";
import { deleteJobResume } from "@/actions/job-resume";

interface JobResumeCardProps {
  jobResume: JobResume;
}

export function JobResumeCard({ jobResume }: JobResumeCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteJobResume(jobResume.id);
        toast.success("Resume deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <Link href={`/resumes/${jobResume.id}`}>
        <h3 className="text-lg font-semibold">{jobResume.name}</h3>
      </Link>
      <p className="text-sm text-muted-foreground">
        Created: {new Date(jobResume.createdAt).toLocaleDateString()}
      </p>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/resumes/${jobResume.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

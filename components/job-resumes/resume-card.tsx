"use client";

import { JobResume } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransition } from "react";
import { deleteJobResume } from "@/actions/job-resume";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import Moment from "react-moment";
import { Card, CardContent } from "../ui/card";

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
    <Card className="">
      <CardContent className="space-y-4 p-4">
        <div>
          <Link href={`/resumes/${jobResume.id}`}>
            <h3 className="text-lg font-semibold">{jobResume.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">
            Created at{" "}
            <Moment date={jobResume.createdAt} format="YYYY/MM/DD HH:mm" />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/resumes/${jobResume.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isPending}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  job resume and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Yes, Delete!
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeTemplate } from "@prisma/client";
import moment from "moment";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { deleteTemplate } from "@/api/templates";

export function ResumeTemplateItem({ template }: { template: ResumeTemplate }) {
  const queryClient = useQueryClient()
  
  const handleDeleteItem = async (templateId: string) => {
    await deleteTemplate(templateId)
    await queryClient.invalidateQueries({
      queryKey: ["/templates"],
    });
  };

  return (
    <Card className="">
      <CardHeader className="flex gap-2">
        <Link href={`/templates/${template.id}`}>
          <CardTitle className="text-2xl">{template.name}</CardTitle>
          <p className="text-muted-foreground mt-1">{template.description}</p>
          <p className="text-muted-foreground text-sm">
            {moment(template.createdAt).format("YYYY/MM/DD HH:MM:SS")} (
            {moment(template.createdAt).fromNow()})
          </p>
        </Link>
        <div className="flex justify-between">
          <Button asChild variant={"secondary"}>
            <Link href={`/templates/${template.id}/match-job`}>Match Job</Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant={"destructive"} className="">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  resume and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteItem?.(template.id)}
                >
                  Yes, Delete!
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
    </Card>
  );
}

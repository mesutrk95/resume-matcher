import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ResumeTemplateCard } from "@/components/resume-templates/resume-template-card";

interface CreateResumePageProps {
  params: {
    id: string;
  };
}

export default async function CreateResumePage({
  params,
}: CreateResumePageProps) {
  const user = await currentUser();

  // Fetch all resume templates for the user
  const resumeTemplates = await db.resumeTemplate.findMany({
    where: {
      userId: user?.id,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href={`/jobs`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Create a new Resume</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResumeTemplateCard />
        {resumeTemplates.map((template) => (
          <ResumeTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

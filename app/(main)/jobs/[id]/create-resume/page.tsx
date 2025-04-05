import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { ResumeTemplateCard } from "@/components/resume-templates/resume-template-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateResumeButton } from "@/components/job-resumes/create-resume-button";

interface CreateResumePageProps {
  params: {
    id: string;
  };
}

export default async function CreateResumePage({
  params,
}: CreateResumePageProps) {
  const user = await currentUser();
  const { id: jobId } = params;

  // Fetch the job
  const job = await db.job.findUnique({
    where: {
      id: jobId,
      userId: user?.id,
    },
  });

  if (!job) {
    notFound();
  }

  // Fetch all resume templates for the user
  const resumeTemplates = await db.resumeTemplate.findMany({
    where: {
      userId: user?.id,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Create Resume</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/jobs">Jobs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/jobs/${job.id}`}>
                {job.title} {job.companyName ? "at " + job.companyName : ""}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Resume</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div className="">
            <h3 className="text-lg font-semibold ">Start Fresh</h3>
            <p>Create a completely customized resume with a blank template</p>
          </div>
          <div>
            <CreateResumeButton jobId={jobId} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-5">
        <h2 className="text-xl font-bold">Resume Templates</h2>
        <p className="text-muted-foreground">
          Choose from one of your already designed templates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumeTemplates.map((template) => (
          <ResumeTemplateCard
            key={template.id}
            template={template}
            jobId={jobId}
          />
        ))}
      </div>
    </div>
  );
}

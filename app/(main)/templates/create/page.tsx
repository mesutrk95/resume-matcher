import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { ResumeTemplateCard } from "@/components/resume-templates/resume-template-card";
import { Card, CardContent } from "@/components/ui/card";
import { CreateResumeButton } from "@/components/job-resumes/create-resume-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateNewTemplateForm } from "@/components/resume-templates/create-new-template-button";

interface CreateResumePageProps {
  params: {};
}

export default async function CreateResumeTemplate({
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
      <div>
        <h2 className="text-2xl font-bold mb-1">Create Resume Template</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div className="">
            <h3 className="text-lg font-semibold ">Start Fresh</h3>
            <p>
              Create a completely customized resume template without content
            </p>
          </div>
          <div>
            {/* <CreateResumeButton /> */}
            <CreateNewTemplateForm blank />
          </div>
        </CardContent>
      </Card>

      {/* <div className="mt-5">
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
            // jobId={jobId}
          />
        ))}
      </div> */}
    </div>
  );
}

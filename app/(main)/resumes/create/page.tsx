import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { ResumeTemplateCard } from '@/components/resume-templates/resume-template-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface CreateResumePageProps {
  params: {
    id: string;
  };
}

export default async function CreateResumePage({ params }: CreateResumePageProps) {
  const user = await currentUser();

  // Fetch all resume templates for the user
  const resumeTemplates = await db.resumeTemplate.findMany({
    where: {
      userId: user?.id,
    },
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Create a new Resume</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resumes">Resumes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* 
      {resumeTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumeTemplates.map(template => (
            <ResumeTemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-6">
          <div className="col-span-4"> </div>
          <div className="col-span-4"></div>
        </div>
      )} */}
    </div>
  );
}

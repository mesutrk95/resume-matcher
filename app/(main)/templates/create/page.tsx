import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { TemplateGallery } from '@/components/resume-templates/template-gallery';
import { CreateTemplateOptions } from './create-template-options';

interface CreateResumePageProps {
  params: object;
}

export default async function CreateResumeTemplate({ params }: CreateResumePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Create Career Profile</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/templates">Career Profiles</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* <p className="text-muted-foreground mt-4">
          With resume templates, you only need to build your resume once. Easily
          clone and customize it for each job application, ensuring every
          submission is tailored and professional. Save time and stay organized
          with a dedicated resume for every opportunity.
        </p> */}
      </div>

      <CreateTemplateOptions />
      <TemplateGallery />
    </div>
  );
}

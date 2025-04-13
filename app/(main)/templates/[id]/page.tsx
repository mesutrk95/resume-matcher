import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { db } from '@/lib/db';
import { ResumeContent } from '@/types/resume';
import { Metadata } from 'next';
import { ResumeTemplatePage } from './resume-template-page';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Resume Template Builder',
};

export default async function TemplateBuilderPage({ params }: { params: { id: string } }) {
  const resumeTemplate = await db.resumeTemplate.findUnique({
    where: { id: params.id },
  });

  if (!resumeTemplate) return notFound();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Edit Resume Template</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{resumeTemplate.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <ResumeTemplatePage resumeTemplate={resumeTemplate} />
    </>
  );
}

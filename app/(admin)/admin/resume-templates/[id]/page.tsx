import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getResumeTemplateById } from '@/services/resume-template';
import { ResumeTemplateContentEditor } from './resume-template-content-editor';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Admin - Edit Resume Template',
  description: 'Edit Resume Template',
};

export default async function AdminEdiResumeTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: resumeTemplateId } = await params;
  const resumeTemplate = await getResumeTemplateById(resumeTemplateId);
  if (!resumeTemplate) return redirect('/admin/resume-templates');

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/resume-templates" className="text-blue-600 hover:text-blue-800">
          ← Back to Resume Templates
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Resume Template: {resumeTemplate.name}</h1>
      </div>

      <Card className="p-5">
        <ResumeTemplateContentEditor resumeTemplate={resumeTemplate} />
      </Card>
    </div>
  );
}

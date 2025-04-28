import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { Metadata } from 'next';
import { ResumeBuilderPage } from './resume-builder-page';
import { ResumeTemplate } from '@/types/resume-template';
import { getDefaultResumeTemplate, getResumeTemplateById } from '@/services/template';

interface EditResumePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Build Resume for job',
  description: 'Build your resume based on job description.',
};

export default async function EditResumePage({ params }: EditResumePageProps) {
  const user = await currentUser();
  const paramsResult = await params;

  // Fetch the ResumeJob record
  const jobResume = await db.jobResume.findUnique({
    where: {
      id: paramsResult.id,
      userId: user?.id,
    },
    include: {
      job: true,
    },
  });

  if (!jobResume) {
    notFound();
  }

  let resumeTemplate: ResumeTemplate | null = null;
  const resumeTemplateData = jobResume.template as {
    id: string;
    override?: Partial<ResumeTemplate>;
  } | null;

  if (resumeTemplateData?.id) {
    resumeTemplate = await getResumeTemplateById(resumeTemplateData.id);
  }
  if (!resumeTemplate) resumeTemplate = await getDefaultResumeTemplate();

  return <ResumeBuilderPage jobResume={jobResume} resumeTemplate={resumeTemplate} />;
}

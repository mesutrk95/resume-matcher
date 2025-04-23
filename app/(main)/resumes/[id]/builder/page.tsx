import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { ResumeContent } from '@/types/resume';
import { Metadata } from 'next';
import { ResumeBuilderPage } from './resume-builder-page';

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
      //   resumeTemplate: true,
    },
  });

  if (!jobResume) {
    notFound();
  }

  return <ResumeBuilderPage jobResume={jobResume} />;
}

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ResumeContent } from '@/types/resume';
import { CareerProfileResumeWizard } from './career-profile-resume-wizard';

interface CreateResumePageProps {
  searchParams: Promise<{
    profile: string;
  }>;
}

export default async function ResumeWizardPage({ searchParams }: CreateResumePageProps) {
  const user = await currentUser();
  const paramsResult = await searchParams;
  const careerProfileId = paramsResult.profile;
  const careerProfile = careerProfileId
    ? await db.careerProfile.findUnique({
        where: { id: careerProfileId, userId: user.id, draft: true },
      })
    : undefined;

  const resumeData = careerProfile?.content as ResumeContent;

  // const keys = ['experiences', 'skills', 'projects'];
  return <CareerProfileResumeWizard resumeData={resumeData} careerProfileId={careerProfile?.id} />;
}

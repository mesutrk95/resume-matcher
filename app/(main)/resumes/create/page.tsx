import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { CareerProfileCard } from '@/components/career-profiles/career-profile-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { NoCareerProfileWizard } from './no-career-profile-wizard';

interface CreateResumePageProps {
  params: {
    id: string;
  };
}

export default async function CreateResumePage({ params }: CreateResumePageProps) {
  const user = await currentUser();

  // Fetch all resume careerProfiles for the user
  const careerProfiles = await db.resumeTemplate.findMany({
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

      {careerProfiles.length === 0 && <NoCareerProfileWizard />}
    </div>
  );
}

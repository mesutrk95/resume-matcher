import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { NoCareerProfileWizard } from './no-career-profile-wizard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createJobResume } from '@/services/job-resume';

interface CreateResumePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CreateResumePage({ params }: CreateResumePageProps) {
  const user = await currentUser();
  const paramsResult = await params;

  // Fetch all resume careerProfiles for the user
  const allCareerProfiles = await db.careerProfile.findMany({
    where: {
      userId: user?.id,
    },
  });

  const careerProfiles = allCareerProfiles.filter(c => !c.draft);
  const draftCareerProfile = allCareerProfiles.find(c => c.draft);
  // console.log(draftCareerProfile);

  // don't wait directly create resume of the career profile!
  if (careerProfiles.length === 1) {
    try {
      const jobResumeResult = await createJobResume(user?.id!, careerProfiles[0].id);
      return redirect('/resumes/' + jobResumeResult?.id + '/builder');
    } catch (error: any) {
      return <>{error?.message || 'Ops! Something went wrong!'} </>;
    }
  }

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

      {draftCareerProfile && (
        <Alert variant="default" className="bg-yellow-50 flex justify-between items-center">
          <div className="flex gap-2">
            <AlertCircle className="text-yellow-600" />
            <div>
              <AlertTitle className="flex gap-2 font-bold text-yellow-600">
                Pending resume import
              </AlertTitle>
              <AlertDescription className="flex justify-between">
                <p>
                  It looks like you started importing a resume but didn’t complete the process.
                  {/* <br /> */}
                  Would you like to continue from where you left off?
                </p>
              </AlertDescription>
            </div>
          </div>
          <Button asChild variant={'outline'}>
            <Link href={'/build-resume?profile=' + draftCareerProfile.id}>
              Continue
              <ArrowRight size={16} />
            </Link>
          </Button>
        </Alert>
      )}

      {careerProfiles.length === 0 && <NoCareerProfileWizard />}
    </div>
  );
}

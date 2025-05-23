import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CreateResumeButton } from '@/components/job-resumes/create-resume-button';
import { CareerProfileCard } from '@/components/career-profiles/career-profile-card';
import { createJobResume } from '@/services/job-resume';

interface CreateResumePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CreateResumePage({ params }: CreateResumePageProps) {
  const user = await currentUser();
  const paramsResult = await params;
  const { id: jobId } = paramsResult;
  // Fetch the job
  const job = await db.job.findUnique({
    where: {
      id: jobId,
      userId: user.id,
    },
  });

  if (!job) {
    notFound();
  }

  // Fetch all resume careerProfiles for the user
  const careerProfiles = await db.careerProfile.findMany({
    where: {
      userId: user.id,
      draft: false,
    },
  });

  // don't wait directly create resume of the career profile!
  if (careerProfiles.length === 1) {
    try {
      const jobResumeResult = await createJobResume(user.id, careerProfiles[0].id, job.id);
      return redirect('/resumes/' + jobResumeResult?.id + '/builder');
    } catch (error: any) {
      return <>{error?.message || 'Ops! Something went wrong!'} </>;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Create Resume</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/jobs">Jobs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/jobs/${job.id}`}>
                {job.title} {job.companyName ? 'at ' + job.companyName : ''}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Resume</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div className="">
            <h3 className="text-lg font-semibold ">Start Fresh</h3>
            <p>Create a completely customized resume with a blank template</p>
          </div>
          <div>
            <CreateResumeButton jobId={jobId} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-5">
        <h2 className="text-xl font-bold">Career Profiles </h2>
        <p className="text-muted-foreground">Choose from one of your already designed profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {careerProfiles.map(careerProfile => (
          <CareerProfileCard key={careerProfile.id} careerProfile={careerProfile} jobId={jobId} />
        ))}
      </div>
    </div>
  );
}

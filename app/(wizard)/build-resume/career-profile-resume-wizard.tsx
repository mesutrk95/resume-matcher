'use client';

import { updateCareerProfile } from '@/actions/career-profiles';
import { createJobResume } from '@/actions/job-resume';
import { runAction } from '@/app/_utils/runAction';
import {
  ResumeWizard,
  ResumeWizardBody,
  ResumeWizardFooter,
  ResumeWizardHeader,
} from '@/components/career-profiles/create-career-profile-wizard';
import {
  coreSteps,
  optionalSteps,
} from '@/components/career-profiles/create-career-profile-wizard/resume-wizard-context';
import { WizardResumeContent } from '@/components/career-profiles/create-career-profile-wizard/types';
import VerticalWizardSteps, {
  Step,
} from '@/components/career-profiles/create-career-profile-wizard/vertical-wizard-steps';
import { Button } from '@/components/ui/button';
import { ResumeContent } from '@/types/resume';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';

const steps = [...coreSteps, ...optionalSteps];

export const CareerProfileResumeWizard = ({
  careerProfileId,
  resumeData,
}: {
  careerProfileId?: string;
  resumeData?: ResumeContent;
}) => {
  const router = useRouter();
  const [isFinalizingResume, setFinalizingResume] = useTransition();

  if (resumeData) {
    (resumeData as WizardResumeContent).includeOptionalSteps = true;
  }
  const onResumeWizardDone = (data: WizardResumeContent) => {
    setFinalizingResume(async () => {
      // user imported a resume & now finalizing career profile to make resume
      if (careerProfileId) {
        toast.info('Please wait ...', {
          description: `We are making a career profile for you, it may take some while!`,
        });

        const result = await runAction(
          updateCareerProfile({
            id: careerProfileId,
            content: data,
            draft: false,
          }),
        );
        if (!result.success) {
          toast.error('Failed action!', {
            description: `Something went wrong, Please try again!`,
          });
          return;
        }
        toast.info('Please wait ...', {
          description: `Profile successfully created, making a sample resume of it!`,
        });
        // const lastToast = toast.getToasts().find(t => t.id === toastId);

        const jobResumeResult = await runAction(createJobResume(careerProfileId));

        if (!jobResumeResult.success) {
          toast.error('Failure in making resume!', {
            description: `Something went wrong, Please try again!`,
          });
          return;
        }

        toast.success('Resume created!', {
          description: `Everything is set up to make resumes!`,
        });

        router.push('/resumes/' + jobResumeResult.data?.id + '/builder');
      }
    });
  };
  const [currentStepId, setCurrentStepId] = useState('title'); // Start in the middle to demonstrate scrolling

  // Generate a large number of steps (20)
  let completed = true;
  const allSteps: Step[] = steps.map((s, i) => {
    if (s.id === currentStepId) completed = false;
    return {
      id: s.id,
      name: s.label,
      status: completed ? 'completed' : s.id === currentStepId ? 'current' : 'upcoming',
    };
  });
  allSteps.push({
    id: 'completion',
    name: 'Review',
    status: 'completion' === currentStepId ? 'current' : 'upcoming',
  });

  const handleStepChanged = (stepId: string) => {
    setCurrentStepId(stepId);
  };

  return (
    <div className="" style={{ background: '#f0f0f2' }}>
      <div className="grid grid-cols-12">
        <div className="col-span-3 h-screen overflow-hidden flex  pt-10 ps-20 p-8">
          <div className="  ">
            <div>
              <Link href="/resumes" className="flex items-center gap-2 text-xl font-bold mb-4">
                <Image src="/logos/png/256/logo.png" width={24} height={24} alt="" />
                Minova
              </Link>
            </div>

            <h1 className="font-bold text-3xl">Build Your Resume</h1>
            <p className="mb-10 text-muted-foreground">
              We help you step by step to build your resume!
            </p>
            <VerticalWizardSteps
              steps={allSteps}
              onStepClick={handleStepChanged}
              maxHeight="350px"
            />
          </div>
        </div>
        <div className="col-span-9">
          <div className="p-8 h-screen ">
            <ResumeWizard
              className="bg-white h-full overflow-hidden rounded-2xl flex flex-col"
              initialResumeData={resumeData}
              onResumeWizardDone={onResumeWizardDone}
              onStepChanged={handleStepChanged}
            >
              <ResumeWizardHeader className="bg-white" />
              <ResumeWizardBody className="flex-grow overflow-auto  " />
              <ResumeWizardFooter className="bg-white" />
            </ResumeWizard>
          </div>
        </div>
      </div>
    </div>
  );
};

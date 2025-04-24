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
import { WizardResumeContent } from '@/components/career-profiles/create-career-profile-wizard/types';
import { ResumeContent } from '@/types/resume';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { toast } from 'sonner';

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

  return (
    <ResumeWizard
      className=" bg-white border-e border-s h-screen rounded-none flex flex-col"
      initialResumeData={resumeData}
      onResumeWizardDone={onResumeWizardDone}
    >
      <ResumeWizardHeader className="bg-white" />
      {/* <ScrollArea className="me-2" type="always"> */}
      <ResumeWizardBody className="flex-grow overflow-auto  " />
      <ResumeWizardFooter className="bg-white" />
    </ResumeWizard>
  );
};

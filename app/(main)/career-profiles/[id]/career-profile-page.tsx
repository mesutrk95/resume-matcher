'use client';

import { updateCareerProfile } from '@/actions/career-profiles';
import { runAction } from '@/app/_utils/runAction';
import { ResumeBuilder } from '@/components/job-resumes/resume-builder';
import { ResumeBuilderProvider } from '@/components/job-resumes/resume-builder/context/ResumeBuilderProvider';
import { ImportExportBar } from '@/components/career-profiles/import-export-bar';
import { CareerProfileForm } from '@/components/career-profiles/career-profile-form';
import { ResumeContent } from '@/types/resume';
import { CareerProfile } from '@prisma/client';
import React from 'react';

export const CareerProfilePage = ({ careerProfile }: { careerProfile: CareerProfile }) => {
  const handleResumeUpdate = async (resumeContent: ResumeContent) => {
    await runAction(
      updateCareerProfile,
      {
        successMessage: 'Career Profile updated successfully',
        errorMessage: 'Failed to update Career Profile',
      },
      {
        ...careerProfile,
        content: resumeContent,
      },
    );
  };
  return (
    <>
      <CareerProfileForm careerProfile={careerProfile} />
      <ResumeBuilderProvider
        initialResume={careerProfile.content as ResumeContent}
        initialDesign={null}
        onUpdated={handleResumeUpdate}
      >
        <ResumeBuilder />
      </ResumeBuilderProvider>

      <ImportExportBar careerProfile={careerProfile} />
    </>
  );
};

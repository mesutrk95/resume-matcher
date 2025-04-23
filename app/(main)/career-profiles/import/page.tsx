import React from 'react';
import { CreateCareerProfileOptions } from '../create/create-career-profile-options';
import { ResumeContent } from '@/types/resume';
import { ResumeWizard } from '@/components/career-profiles/create-career-profile-wizard';

export default async function CareerImportPage() {
  return (
    <div>
      {/* <ResumeWizard
        onResumeWizardDone={(resumeData: ResumeContent) => {}}
      /> */}
      <CreateCareerProfileOptions />
    </div>
  );
}

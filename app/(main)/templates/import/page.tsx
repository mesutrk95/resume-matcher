import React from 'react';
import { CreateTemplateOptions } from '../create/create-template-options';
import { ResumeContent } from '@/types/resume';
import { ResumeWizard } from '@/components/resume-templates/create-career-profile-wizard';

export default async function CareerImportPage() {
  return (
    <div>
      {/* <ResumeWizard
        onResumeWizardDone={(resumeData: ResumeContent) => {}}
      /> */}
      <CreateTemplateOptions />
    </div>
  );
}

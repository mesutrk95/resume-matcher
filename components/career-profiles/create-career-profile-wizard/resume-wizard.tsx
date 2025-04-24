'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ResumeWizardProvider } from './resume-wizard-context';
import { WizardResumeContent } from './types';

interface ResumeWizardProps {
  children: ReactNode;
  className?: string;
  initialResumeData?: WizardResumeContent;
  onResumeWizardDone?: (resumeData: WizardResumeContent) => void;
}

export function ResumeWizard({
  children,
  className,
  initialResumeData,
  onResumeWizardDone,
}: ResumeWizardProps) {
  console.log(initialResumeData);

  return (
    <ResumeWizardProvider
      onResumeWizardDone={onResumeWizardDone}
      initialResumeData={initialResumeData}
    >
      <div className={cn('', className)}>{children}</div>
    </ResumeWizardProvider>
  );
}

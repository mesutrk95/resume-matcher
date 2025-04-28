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
  onStepChanged?: (id: string, index: number) => void;
}

export function ResumeWizard({
  children,
  className,
  initialResumeData,
  onResumeWizardDone,
  onStepChanged,
}: ResumeWizardProps) {
  return (
    <ResumeWizardProvider
      onResumeWizardDone={onResumeWizardDone}
      onStepChanged={onStepChanged}
      initialResumeData={initialResumeData}
    >
      <div className={cn('', className)}>{children}</div>
    </ResumeWizardProvider>
  );
}

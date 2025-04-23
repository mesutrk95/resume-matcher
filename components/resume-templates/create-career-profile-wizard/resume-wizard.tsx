'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ResumeWizardProvider } from './resume-wizard-context';
import { ResumeContent } from '@/types/resume';

interface ResumeWizardProps {
  children: ReactNode;
  className?: string;
  onResumeWizardDone?: (resumeData: ResumeContent) => void;
}

export function ResumeWizard({ children, className, onResumeWizardDone }: ResumeWizardProps) {
  return (
    <ResumeWizardProvider onResumeWizardDone={onResumeWizardDone}>
      <div className={cn('', className)}>{children}</div>
    </ResumeWizardProvider>
  );
}

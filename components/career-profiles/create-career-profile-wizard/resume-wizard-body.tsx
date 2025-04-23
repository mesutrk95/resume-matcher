'use client';

import { cn } from '@/lib/utils';
import { useResumeWizard } from './resume-wizard-context';

interface ResumeWizardBodyProps {
  className?: string;
}

export function ResumeWizardBody({ className }: ResumeWizardBodyProps) {
  const { renderStep } = useResumeWizard();

  return <div className={cn('p-6', className)}>{renderStep()}</div>;
}

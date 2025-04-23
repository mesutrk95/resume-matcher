'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useResumeWizard } from './resume-wizard-context';

interface ResumeWizardHeaderProps {
  className?: string;
}

export function ResumeWizardHeader({ className }: ResumeWizardHeaderProps) {
  const { activeSteps, currentStep, progress } = useResumeWizard();

  // Get the current step icon
  //   const StepIcon = activeSteps[currentStep]?.icon

  return (
    <div className={cn('p-6 border-b', className)}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {/* {StepIcon && <StepIcon className="h-5 w-5 text-primary" />} */}
          Step {currentStep + 1} of {activeSteps.length - 1}: {activeSteps[currentStep]?.label}
        </h2>
        <span className="text-sm text-gray-500">{progress}% Completed</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResumeWizard } from './resume-wizard-context';

interface ResumeWizardFooterProps {
  className?: string;
}

export function ResumeWizardFooter({ className }: ResumeWizardFooterProps) {
  const {
    isLastStep,
    isFirstStep,
    step,
    isOptionalPromptStep,
    handleBack,
    handleNext,
    handleSkip,
  } = useResumeWizard();

  if (isOptionalPromptStep) {
    return null;
  }

  return (
    <div className={cn('p-6 border-t bg-gray-50 flex justify-between', className)}>
      <Button
        variant="outline"
        onClick={handleBack}
        disabled={isFirstStep}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex gap-2">
        {!isLastStep && step.optional && !isFirstStep && (
          <Button variant="ghost" onClick={handleSkip} className="flex items-center gap-2">
            Skip <SkipForward className="h-4 w-4" />
          </Button>
        )}

        {!isLastStep && (
          <Button onClick={handleNext} className="flex items-center gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

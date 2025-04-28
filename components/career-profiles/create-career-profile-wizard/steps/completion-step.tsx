'use client';

import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardResumeContent } from '../types';
import { useResumeWizard } from '../resume-wizard-context';

interface CompletionStepProps {
  resumeData: WizardResumeContent;
}

export function CompletionStep({ resumeData }: CompletionStepProps) {
  const { handleNext } = useResumeWizard();

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
      <div className="rounded-full bg-green-100 p-3">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold">All Set!</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You&apos;ve successfully completed all the steps to create your resume. Your information
          has been automatically saved.
        </p>
      </div>
      {/* <div className="space-y-4 w-full max-w-md">
        <Button onClick={handleNext} className="w-full">
          Finish!
        </Button>
      </div> */}
      {/* <div className="space-y-4 w-full max-w-md">
        <Button onClick={handleDownload} className="w-full">
          Download Resume Data
        </Button>

        <div className="text-sm text-gray-500">
          <p>
            Your data has been saved to your browser's local storage. You can return to this wizard anytime to continue
            editing.
          </p>
        </div>
      </div> */}
    </div>
  );
}

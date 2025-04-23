'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Plus, ThumbsUp } from 'lucide-react';

interface OptionalStepsPromptProps {
  onContinue: (includeOptionalSteps: boolean) => void;
}

export function OptionalStepsPrompt({ onContinue }: OptionalStepsPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-8 text-center">
      <div className="rounded-full bg-green-100 p-3">
        <ThumbsUp className="h-12 w-12 text-green-600" />
      </div>

      <div className="space-y-4 max-w-lg">
        <h3 className="text-2xl font-bold">Great progress!</h3>
        <p className="text-gray-600">
          You&apos;ve completed the essential parts of your resume. Would you like to add more
          details to make your resume even more comprehensive?
        </p>

        <div className="bg-gray-50 p-4 rounded-lg text-left">
          <p className="font-medium mb-2">Additional sections include:</p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-400" />
              Education history
            </li>
            <li className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-400" />
              Professional certifications
            </li>
            <li className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-400" />
              Language proficiencies
            </li>
            <li className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-400" />
              Notable projects
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button onClick={() => onContinue(false)} variant="outline" className="flex-1" size="lg">
          No, finish now!
        </Button>
        <Button onClick={() => onContinue(true)} className="flex-1" size="lg">
          Yes, add more details!
        </Button>
      </div>
    </div>
  );
}

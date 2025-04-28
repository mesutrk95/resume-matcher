'use client';

import type React from 'react';

import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import clsx from 'clsx';

export type Step = {
  id: string;
  name: string;
  icon?: React.ElementType;
  status: 'upcoming' | 'current' | 'completed';
};

interface VerticalWizardStepsProps {
  steps: Step[];
  onStepClick?: (stepId: string) => void;
  className?: string;
  maxHeight?: string | number;
}

export default function VerticalWizardSteps({
  steps,
  onStepClick,
  className,
  maxHeight = '300px',
}: VerticalWizardStepsProps) {
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Scroll to active step when it changes
  useEffect(() => {
    if (stepsContainerRef.current && activeStepRef.current) {
      const container = stepsContainerRef.current;
      const activeStep = activeStepRef.current;

      // Calculate the scroll position to center the active step in the container
      const containerHeight = container.clientHeight;
      const activeStepTop = activeStep.offsetTop;
      const activeStepHeight = activeStep.clientHeight;

      const scrollTo = activeStepTop - containerHeight / 2 + activeStepHeight / 2;

      // Smooth scroll to the active step
      container.scrollTo({
        top: Math.max(0, scrollTo),
        behavior: 'smooth',
      });
    }
  }, [steps]);

  return (
    <div
      ref={stepsContainerRef}
      className={cn('overflow-hidden relative', className)}
      style={{ maxHeight }}
    >
      {/* <div className="h-5 w-full absolute left-0 bottom-0 bg-red-300"></div> */}
      <div className="space-y-3 ">
        {steps.map((step, index) => {
          const isActive = step.status === 'current';
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={step.id}
              ref={isActive ? activeStepRef : null}
              className={cn('flex items-center cursor-pointer transition-all  ', isActive && ' ')}
              onClick={() => onStepClick?.(step.id)}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full mr-3 transition-colors shrink-0',
                  isActive
                    ? 'bg-primary text-white'
                    : isCompleted
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600',
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className={clsx('text-xs', isActive && 'font-medium')}>{index + 1}</span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <span
                  className={cn(
                    'font-medium',
                    isActive
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-primary'
                        : 'text-muted-foreground',
                  )}
                >
                  {step.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React, { ReactNode } from 'react';
import { useResumeBuilder } from './context/useResumeBuilder';

export const ResumeBuilderCard = ({
  children,
  onAdd,
  isAdding,
  addButtonText,
  title,
  buttons,
}: {
  children: ReactNode;
  onAdd?: () => void;
  isAdding?: boolean;
  addButtonText?: string;
  buttons?: ReactNode;
  title: string;
}) => {
  const { scheme } = useResumeBuilder();

  if (scheme === 'accordion') {
    return (
      <div className="border-none shadow-none px-3 ">
        <div className="my-3 flex justify-end">
          {buttons}
          {typeof isAdding !== 'undefined' && !isAdding ? (
            <Button variant={'default'} onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              {addButtonText}
            </Button>
          ) : null}
        </div>
        <div className="pt-0">{children}</div>
      </div>
    );
  }
  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {buttons}
        {typeof isAdding !== 'undefined' && !isAdding ? (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        ) : null}
      </CardHeader>

      <div className="p-4 pt-0">{children}</div>
    </Card>
  );
};

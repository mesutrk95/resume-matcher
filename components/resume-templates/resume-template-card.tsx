'use client';

import { ResumeTemplate } from '@prisma/client';
import Moment from 'react-moment';
import { Card, CardContent } from '../ui/card';
import { CreateResumeButton } from '../job-resumes/create-resume-button';

interface ResumeTemplateCardProps {
  template: ResumeTemplate;
  jobId?: string;
}

export function ResumeTemplateCard({ template, jobId }: ResumeTemplateCardProps) {
  return (
    <Card className="p-0">
      <CardContent className="h-[180px] space-y-5 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated at <Moment date={template.updatedAt} format="yyyy/MM/DD HH:mm" utc />
          </p>
        </div>
        <CreateResumeButton resumeTemplateId={template?.id} jobId={jobId} />
      </CardContent>
    </Card>
  );
}

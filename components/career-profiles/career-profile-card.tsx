'use client';

import Moment from 'react-moment';
import { Card, CardContent } from '../ui/card';
import { CreateResumeButton } from '../job-resumes/create-resume-button';
import { CareerProfile } from '@prisma/client';

interface CareerProfileCardProps {
  careerProfile: CareerProfile;
  jobId?: string;
}

export function CareerProfileCard({ careerProfile, jobId }: CareerProfileCardProps) {
  return (
    <Card className="p-0">
      <CardContent className="h-[180px] space-y-5 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold">{careerProfile.name}</h3>
          <p className="text-sm text-muted-foreground">{careerProfile.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated at <Moment date={careerProfile.updatedAt} format="yyyy/MM/DD HH:mm" utc />
          </p>
        </div>
        <CreateResumeButton careerProfileId={careerProfile?.id} jobId={jobId} />
      </CardContent>
    </Card>
  );
}

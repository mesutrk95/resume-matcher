'use client';

import { Job } from '@prisma/client';
import React from 'react';

export const JobDescriptionPreview = ({ job }: { job: Job }) => {
  return (
    <div className="md:col-span-2 rounded-lg  ">
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Job Description</h3>
        <div
          className="prose prose-sm max-w-none jd-preview"
          dangerouslySetInnerHTML={{ __html: job.description || '' }}
        ></div>
      </div>
    </div>
  );
};

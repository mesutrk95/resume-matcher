'use server';

import { db } from '@/lib/db';
import { NotFoundException } from '@/lib/exceptions';
import { JobResumeStatusFlags } from '@/types/job-resume';
import { JobResume } from '@prisma/client';

export const getJobResumeStatusFlags = async (
  id: string,
  userId?: string,
): Promise<JobResumeStatusFlags> => {
  const jobResume = await db.jobResume.findUnique({
    where: { id, userId },
    select: {
      statusFlags: true,
    },
  });
  return jobResume?.statusFlags as JobResumeStatusFlags;
};

export const updateJobResumeStatusFlags = async (
  jobResume: string | JobResume,
  statusFlags: Partial<JobResumeStatusFlags>,
): Promise<JobResumeStatusFlags> => {
  let jb =
    typeof jobResume === 'string'
      ? await db.jobResume.findUnique({ where: { id: jobResume } })
      : jobResume;

  if (!jb) throw new NotFoundException('Job Resume not found');

  const newFlags = { ...(jb.statusFlags as JobResumeStatusFlags), ...statusFlags };
  await db.jobResume.update({
    where: { id: jb.id },
    data: { statusFlags: newFlags, updatedAt: new Date() },
  });

  return newFlags;
};

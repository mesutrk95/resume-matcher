'use server';

import { db } from '@/lib/db';
import { NotFoundException } from '@/lib/exceptions';
import { JobResumeStatusFlags } from '@/types/job-resume';
import { JobResume } from '@prisma/client';

export const updateJobResumeStatusFlags = async (
  jobResume: string | JobResume,
  statusFlags: Partial<JobResumeStatusFlags>,
) => {
  let jb =
    typeof jobResume === 'string'
      ? await db.jobResume.findUnique({ where: { id: jobResume } })
      : jobResume;

  if (!jb) throw new NotFoundException('Job Resume not found');

  return await db.jobResume.update({
    where: { id: jb.id },
    data: { statusFlags: { ...(jb.statusFlags as JobResumeStatusFlags), ...statusFlags } },
  });
};

'use server';

import { withErrorHandling } from '@/lib/with-error-handling';
import {
  getResumeTemplateById,
  getResumeTemplates,
  updateResumeTemplate as updateRT,
} from '@/services/resume-template';
import { ResumeTemplate, ResumeTemplateStatus } from '@prisma/client';

export const getAllResumeTemplates = withErrorHandling(
  async (status?: ResumeTemplateStatus): Promise<ResumeTemplate[]> => {
    return getResumeTemplates({ status });
  },
);

export const getResumeTemplate = withErrorHandling(
  async (id: string): Promise<ResumeTemplate | null> => {
    return getResumeTemplateById(id);
  },
);
export const updateResumeTemplate = withErrorHandling(
  async (rt: ResumeTemplate): Promise<ResumeTemplate | null> => {
    return updateRT(rt);
  },
);

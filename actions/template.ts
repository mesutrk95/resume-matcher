'use server';

import { withErrorHandling } from '@/lib/with-error-handling';
import { getResumeTemplateById, getResumeTemplates } from '@/services/template';
import { ResumeTemplate } from '@prisma/client';

export const getAllResumeTemplates = withErrorHandling(async (): Promise<ResumeTemplate[]> => {
  return getResumeTemplates();
});

export const getResumeTemplate = withErrorHandling(
  async (id: string): Promise<ResumeTemplate | null> => {
    return getResumeTemplateById(id);
  },
);

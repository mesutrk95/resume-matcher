'use server';

import { withErrorHandling } from '@/lib/with-error-handling';
import { getResumeTemplateById, getResumeTemplates } from '@/services/template';

export const getAllResumeTemplates = withErrorHandling(async () => {
  return getResumeTemplates();
});

export const getResumeTemplate = withErrorHandling(async (id: string) => {
  return getResumeTemplateById(id);
});

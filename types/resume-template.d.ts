import {
  resumeTemplateSchema,
  resumeTemplateElementSchema,
  resumeTemplateClassSchema,
  resumeTemplateStyleSchema,
} from '@/schemas/resume-template.schema';
import { z } from 'zod';

export type ResumeTemplate = z.infer<typeof resumeTemplateSchema>;
export type ResumeTemplateClass = z.infer<typeof resumeTemplateClassSchema>;
export type ResumeTemplateStyle = z.infer<typeof resumeTemplateStyleSchema>;
export type ResumeTemplateElement = z.infer<typeof resumeTemplateElementSchema>;

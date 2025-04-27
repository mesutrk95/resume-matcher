import {
  resumeTemplateSchema,
  elementStyleSchema,
  resumeDesignClassSchema,
  resumeDesignStyleSchema,
  resumeTemplateElementSchema,
} from '@/schemas/resume-template.schema';
import { z } from 'zod';

export type ResumeTemplate = z.infer<typeof resumeTemplateSchema>;
export type ResumeTemplateClass = z.infer<typeof resumeDesignClassSchema>;
export type ResumeTemplateStyle = z.infer<typeof resumeDesignStyleSchema>;
export type ResumeTemplateElementStyle = z.infer<typeof elementStyleSchema>;
export type ResumeTemplateElement = z.infer<typeof resumeTemplateElementSchema>;

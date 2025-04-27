import {
  elementStyleSchema,
  resumeDesignClassSchema,
  resumeDesignSchema,
  resumeDesignStyleSchema,
  sectionNamesSchema,
  sectionSchema,
  sectionSubheaderSchema,
} from '@/schemas/resume-design.schema';
import { z } from 'zod';

export type ResumeDesign = z.infer<typeof resumeDesignSchema>;
export type ResumeDesignClass = z.infer<typeof resumeDesignClassSchema>;
export type ResumeDesignStyle = z.infer<typeof resumeDesignStyleSchema>;
export type ResumeDesignElementStyle = z.infer<typeof elementStyleSchema>;
export type ResumeDesignSection = z.infer<typeof sectionSchema>;
export type ResumeDesignSectionSubHeader = z.infer<typeof sectionSubheaderSchema>;
export type ResumeDesignSectionName = z.infer<typeof sectionNamesSchema>;

import { z } from 'zod';
import {
  variationSchema,
  experienceItemSchema,
  experienceSchema,
  resumeProfessionalSummarySchema,
  resumeSkillSchema,
  resumeProjectSchema,
  resumeContactInfoSchema,
  resumeTargetTitleSchema,
  resumeEducationSchema,
  resumeContentSchema,
  resumeItemScoreAnalyzeSchema,
  resumeAnalyzedImprovementNoteSchema,
  resumeAnalyzeResultsSchema,
  resumeSkillSetSchema,
  resumeSkillItemSchema,
  resumeAwardSchema,
  resumeCertificationSchema,
  resumeLanguageSchema,
  resumeReferenceSchema,
  resumeInterestSchema,
} from '@/schemas/resume';

// Infer types from Zod schemas
export type Variation = z.infer<typeof variationSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type ResumeProfessionalSummary = z.infer<typeof resumeProfessionalSummarySchema>;
export type ResumeSkillSet = z.infer<typeof resumeSkillSetSchema>;
export type ResumeSkillItem = z.infer<typeof resumeSkillItemSchema>;
export type ResumeProject = z.infer<typeof resumeProjectSchema>;
export type ResumeContactInfo = z.infer<typeof resumeContactInfoSchema>;
export type ResumeTargetTitle = z.infer<typeof resumeTargetTitleSchema>;
export type ResumeEducation = z.infer<typeof resumeEducationSchema>;
export type ResumeAward = z.infer<typeof resumeAwardSchema>;
export type ResumeCertification = z.infer<typeof resumeCertificationSchema>;
export type ResumeLanguage = z.infer<typeof resumeLanguageSchema>;
export type ResumeReference = z.infer<typeof resumeReferenceSchema>;
export type ResumeInterest = z.infer<typeof resumeInterestSchema>;

export type ResumeContent = z.infer<typeof resumeContentSchema>;

export type ResumeItemScoreAnalyze = z.infer<typeof resumeItemScoreAnalyzeSchema>;
export type ResumeAnalyzedImprovementNote = z.infer<typeof resumeAnalyzedImprovementNoteSchema>;
export type ResumeAnalyzeResults = z.infer<typeof resumeAnalyzeResultsSchema>;

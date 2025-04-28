import { z } from 'zod';

const variationSchema = z.object({
  id: z.string(),
  content: z.string().nullish(),
  enabled: z.boolean(),
});

const experienceItemSchema = z.object({
  id: z.string(),
  description: z.string().nullish(),
  enabled: z.boolean(),
  variations: z.array(variationSchema),
  skills: z.array(z.string()).optional(),
});

const experienceSchema = z.object({
  id: z.string(),
  companyName: z.string().nullish(),
  role: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  enabled: z.boolean(),
  items: z.array(experienceItemSchema),
  location: z.string().nullish(),
  type: z.string().nullish(),
});

const resumeProfessionalSummarySchema = z.object({
  id: z.string(),
  content: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeSkillItemSchema = z.object({
  id: z.string(),
  content: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeSkillSetSchema = z.object({
  category: z.string().nullish(),
  enabled: z.boolean(),
  skills: z.array(resumeSkillItemSchema),
});

const resumeProjectSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  link: z.string().nullish(),
  content: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeContactInfoSchema = z.object({
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  linkedIn: z.string().nullish(),
  github: z.string().nullish(),
  website: z.string().nullish(),
  twitter: z.string().nullish(),
  address: z.string().nullish(),
  country: z.string().nullish(),
  pronouns: z.string().nullish(),
});

const resumeTargetTitleSchema = z.object({
  id: z.string(),
  content: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeEducationSchema = z.object({
  id: z.string(),
  content: z.string().nullish(),
  enabled: z.boolean(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  institution: z.string().nullish(),
  location: z.string().nullish(),
  degree: z.string().nullish(),
});

const resumeAwardSchema = z.object({
  id: z.string(),
  description: z.string().nullish(),
  issuer: z.string().nullish(),
  date: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeCertificationSchema = z.object({
  id: z.string(),
  description: z.string().nullish(),
  name: z.string().nullish(),
  issuer: z.string().nullish(),
  date: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeLanguageSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  level: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeInterestSchema = z.object({
  id: z.string(),
  description: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeReferenceSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  title: z.string().nullish(),
  company: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  relationship: z.string().nullish(),
  description: z.string().nullish(),
  enabled: z.boolean(),
});

const resumeContentSchema = z.object({
  experiences: z.array(experienceSchema),
  titles: z.array(resumeTargetTitleSchema),
  summaries: z.array(resumeProfessionalSummarySchema),
  educations: z.array(resumeEducationSchema),
  skills: z.array(resumeSkillSetSchema),
  projects: z.array(resumeProjectSchema),
  contactInfo: resumeContactInfoSchema,
  awards: z.array(resumeAwardSchema),
  languages: z.array(resumeLanguageSchema),
  certifications: z.array(resumeCertificationSchema),
  interests: z.array(resumeInterestSchema),
  references: z.array(resumeReferenceSchema),
  version: z.number().optional(),
});

// Define the resumeItemScoreAnalyze schema
const resumeItemScoreAnalyzeSchema = z.object({
  id: z.string(),
  score: z.number(),
  matched_keywords: z.array(z.string()),
  hash: z.string().nullish(),
});

// Define the resumeAnalyzedImprovementNote schema
const resumeAnalyzedImprovementNoteSchema = z.object({
  title: z.string().nullish(),
  explanation: z.string().nullish(),
  text: z.string().nullish(),
  id: z.string(),
  action_type: z.enum(['update', 'delete', 'create']),
  action_text: z.string().nullish(),
});

// Define the resumeAnalyzeResults schema
const resumeAnalyzeResultsSchema = z.object({
  itemsScore: z.record(resumeItemScoreAnalyzeSchema).optional(),
  missed_keywords: z.array(z.string()),
  matched_keywords: z.array(z.string()),
  notes: z.array(resumeAnalyzedImprovementNoteSchema),
  score: z.number(),
});

export {
  variationSchema,
  experienceItemSchema,
  experienceSchema,
  resumeProfessionalSummarySchema,
  resumeSkillItemSchema,
  resumeSkillSetSchema,
  resumeProjectSchema,
  resumeContactInfoSchema,
  resumeTargetTitleSchema,
  resumeEducationSchema,
  resumeAwardSchema,
  resumeCertificationSchema,
  resumeLanguageSchema,
  resumeInterestSchema,
  resumeReferenceSchema,
  resumeContentSchema,
  resumeItemScoreAnalyzeSchema,
  resumeAnalyzedImprovementNoteSchema,
  resumeAnalyzeResultsSchema,
};

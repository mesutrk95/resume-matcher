import { z } from 'zod';

const variationSchema = z.object({
  id: z.string(),
  content: z.string().optional(),
  enabled: z.boolean(),
});

const experienceItemSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
  variations: z.array(variationSchema),
  skills: z.array(z.string()).optional(),
});

const experienceSchema = z.object({
  id: z.string(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  enabled: z.boolean(),
  items: z.array(experienceItemSchema),
  location: z.string().optional(),
  type: z.string().optional(),
});

const resumeProfessionalSummarySchema = z.object({
  id: z.string(),
  content: z.string(),
  enabled: z.boolean(),
});

const resumeSkillItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  enabled: z.boolean(),
});
const resumeSkillSetSchema = z.object({
  category: z.string(),
  enabled: z.boolean(),
  skills: z.array(resumeSkillItemSchema),
});

const resumeProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string(),
  content: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  enabled: z.boolean(),
});

const resumeContactInfoSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
  twitter: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  pronouns: z.string().optional(),
});

const resumeTargetTitleSchema = z.object({
  id: z.string(),
  content: z.string(),
  enabled: z.boolean(),
});

const resumeEducationSchema = z.object({
  id: z.string(),
  content: z.string(),
  enabled: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  institution: z.string(),
  location: z.string().optional(),
  degree: z.string(),
});

const resumeAwardSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  enabled: z.boolean(),
});

const resumeCertificationSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  enabled: z.boolean(),
});

const resumeLanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string(),
  enabled: z.boolean(),
});

const resumeInterestSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
});

const resumeReferenceSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
  description: z.string().optional(),
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
  hash: z.string().optional(),
});

// Define the resumeAnalyzedImprovementNote schema
const resumeAnalyzedImprovementNoteSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  text: z.string(),
  id: z.string(),
  action_type: z.enum(['update', 'delete', 'create']),
  action_text: z.string(),
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

import { z } from "zod";

// Define the variation schema
const variationSchema = z.object({
  id: z.string(),
  content: z.string().optional(),
  enabled: z.boolean(),
});

// Define the experienceItem schema
const experienceItemSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
  variations: z.array(variationSchema),
  skills: z.array(z.string()).optional(),
});

// Define the experience schema
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

// Define the resumeProfessionalSummary schema
const resumeProfessionalSummarySchema = z.object({
  id: z.string(),
  content: z.string(),
  enabled: z.boolean(),
});

// Define the resumeSkill schema
const resumeSkillSchema = z.object({
  id: z.string(),
  content: z.string(),
  category: z.string(),
  enabled: z.boolean(),
});

// Define the resumeProject schema
const resumeProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string(),
  content: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  enabled: z.boolean(),
});

// Define the resumeContactInfo schema
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

// Define the resumeTargetTitle schema
const resumeTargetTitleSchema = z.object({
  id: z.string(),
  content: z.string(),
  enabled: z.boolean(),
});

// Define the resumeEducation schema
const resumeEducationSchema = z.object({
  id: z.string(),
  content: z.string(),
  enabled: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  institution: z.string(),
  location: z.string(),
  degree: z.string(),
});

// Define the resumeContent schema
const resumeContentSchema = z.object({
  experiences: z.array(experienceSchema),
  titles: z.array(resumeTargetTitleSchema),
  summaries: z.array(resumeProfessionalSummarySchema),
  educations: z.array(resumeEducationSchema),
  skills: z.array(resumeSkillSchema),
  projects: z.array(resumeProjectSchema),
  contactInfo: resumeContactInfoSchema,
  version: z.number().optional(),
  languages: z.array(z.any()),
  certifications: z.array(z.any()),
  awards: z.array(z.any()),
  interests: z.array(z.any()),
  references: z.array(z.any()),
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
  action_type: z.enum(["update", "delete", "create"]),
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
  resumeSkillSchema,
  resumeProjectSchema,
  resumeContactInfoSchema,
  resumeTargetTitleSchema,
  resumeEducationSchema,
  resumeContentSchema,
  resumeItemScoreAnalyzeSchema,
  resumeAnalyzedImprovementNoteSchema,
  resumeAnalyzeResultsSchema,
};

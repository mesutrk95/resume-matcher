import { z } from 'zod';
import { ProficiencyLevel } from '../domains/enums/proficiency-level';

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
  level: z.nativeEnum(ProficiencyLevel),
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

const MatchedKeywordSchema = z.string().min(1);

// Define the resumeAnalyzeResults schema
const resumeAnalyzeResultsSchema = z.object({
  itemsScore: z.record(resumeItemScoreAnalyzeSchema).optional(),
  missed_keywords: z.array(z.string()),
  matched_keywords: z.array(z.string()),
  notes: z.array(resumeAnalyzedImprovementNoteSchema),
  score: z.number(),
});

const ProjectMatchSchema = z.object({
  id: z
    .string()
    .min(1, 'Project ID is required')
    .regex(/^project_/, "Project ID must start with 'project_'"),
  score: z
    .number()
    .min(0, 'Match score must be at least 0')
    .max(1, 'Match score must be at most 1')
    .describe('Match score from 0 to 1, where 1 is a perfect match'),
  matched_keywords: z
    .array(MatchedKeywordSchema)
    .describe('Keywords from the job description that match this project'),
});

// Define the schema for the entire matching result
const ProjectMatchingResultSchema = z
  .array(ProjectMatchSchema)
  .nonempty('Result must contain at least one project match');

// Type inference
export type ProjectMatch = z.infer<typeof ProjectMatchSchema>;
export type ProjectMatchingResult = z.infer<typeof ProjectMatchingResultSchema>;

// Define schema for individual experience improvement suggestion
const ExperienceImprovementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .startsWith('Correct', "Title must start with 'Correct'"),
  explanation: z.string().min(1, 'Explanation is required'),
  id: z.string().min(1, 'Experience ID is required'),
  action_type: z.enum(['update', 'create'], {
    description: "Action type must be either 'update' or 'create'",
  }),
  action_text: z.string().min(1, 'Action text is required'),
});

const ExperienceImprovementsSchema = z
  .array(ExperienceImprovementSchema)
  .nonempty('Response must contain at least one improvement suggestion');

// Type inference
export type ExperienceImprovement = z.infer<typeof ExperienceImprovementSchema>;
export type ExperienceImprovements = z.infer<typeof ExperienceImprovementsSchema>;

// Define schema for skill alignment suggestion
const SkillAlignmentSchema = z.object({
  title: z.literal('Correct Skill Alignment').describe('Title of the skill alignment suggestion'),

  text: z
    .string()
    .min(1, 'Source text is required')
    .describe('Original skill text from the resume'),

  improvement: z
    .string()
    .min(1, 'Improvement suggestion is required')
    .describe('Suggested improvement with optional Tailwind CSS formatting'),

  id: z.literal('skills').describe('Identifier for the skills section'),

  action_type: z.literal('update').describe('Type of action to be performed'),

  action_text: z
    .string()
    .min(1, 'Action text is required')
    .describe('Comma-separated list of suggested skills'),
});

// Type inference
export type SkillAlignment = z.infer<typeof SkillAlignmentSchema>;

// Define schema for resume score breakdown
const ResumeScoreBreakdownSchema = z.object({
  keyword_score: z
    .number()
    .int('Keyword score must be an integer')
    .min(0, 'Keyword score must be at least 0')
    .max(40, 'Keyword score must be at most 40')
    .describe('Score based on keyword matching (0-40)'),

  skills_score: z
    .number()
    .int('Skills score must be an integer')
    .min(0, 'Skills score must be at least 0')
    .max(30, 'Skills score must be at most 30')
    .describe('Score based on skills matching (0-30)'),

  experience_score: z
    .number()
    .int('Experience score must be an integer')
    .min(0, 'Experience score must be at least 0')
    .max(20, 'Experience score must be at most 20')
    .describe('Score based on experience relevance (0-20)'),

  education_score: z
    .number()
    .int('Education score must be an integer')
    .min(0, 'Education score must be at least 0')
    .max(10, 'Education score must be at most 10')
    .describe('Score based on education relevance (0-10)'),
});

// Define schema for overall resume score
const ResumeScoreSchema = z.object({
  score: z
    .number()
    .int('Score must be an integer')
    .min(0, 'Score must be at least 0')
    .max(100, 'Score must be at most 100')
    .describe('Overall resume score (0-100)'),

  breakdown: ResumeScoreBreakdownSchema.describe('Detailed breakdown of score components'),
});

// Type inference
export type ResumeScoreBreakdown = z.infer<typeof ResumeScoreBreakdownSchema>;
export type ResumeScore = z.infer<typeof ResumeScoreSchema>;

const KeywordMatchingResultSchema = z.object({
  matched_keywords: z.array(z.string()).describe('Array of important keywords found in the resume'),

  missed_keywords: z
    .array(z.string())
    .describe('Array of important keywords missing from the resume'),
});

// Type inference
export type KeywordMatchingResult = z.infer<typeof KeywordMatchingResultSchema>;

const ProjectVariationScoreSchema = z.object({
  id: z
    .string()
    .min(1, 'Variation ID is required')
    .describe('Unique identifier for the project variation'),

  score: z
    .number()
    .min(0, 'Score must be at least 0')
    .max(1, 'Score must be at most 1')
    .describe('Match score from 0 to 1, where 1 is a perfect match'),

  matched_keywords: z
    .array(z.string())
    .describe('Array of exact keywords that matched between the project and job description'),
});

const ProjectVariationScoresSchema = z
  .array(ProjectVariationScoreSchema)
  .nonempty('Result must contain at least one project variation score');

export type ProjectVariationScore = z.infer<typeof ProjectVariationScoreSchema>;
export type ProjectVariationScores = z.infer<typeof ProjectVariationScoresSchema>;

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
  ProjectMatchSchema,
  ProjectMatchingResultSchema,
  ExperienceImprovementSchema,
  ExperienceImprovementsSchema,
  SkillAlignmentSchema,
  ResumeScoreSchema,
  ResumeScoreBreakdownSchema,
  KeywordMatchingResultSchema,
  ProjectVariationScoresSchema,
};

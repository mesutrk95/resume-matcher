import { z } from 'zod';

const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color');

const spacingSchema = z.object({
  unit: z.number().default(4), // Base spacing unit in points
  sectionGap: z.number().default(3), // Gap between sections in units
  itemGap: z.number().default(1), // Gap between items in units
  pagePadding: z.object({
    top: z.number().default(30),
    right: z.number().default(30),
    bottom: z.number().default(30),
    left: z.number().default(30),
  }),
});
export const resumeDesignPageSize = z.enum(['A4', 'LETTER', 'A5']).default('A4');
export const resumeDesignOrientation = z.enum(['portrait', 'landscape']).default('portrait');
export const resumeDesignClassSchema = z.string();
export const resumeDesignStyleSchema = z.object({
  textDecoration: z
    .enum(['line-through', 'underline', 'none', 'line-through underline', 'underline line-through'])
    .optional(),
  justifyContent: z
    .enum(['flex-start', 'flex-end', 'center', 'space-around', 'space-between', 'space-evenly'])
    .optional(),
  textDecorationColor: colorSchema.optional(),
  textDecorationStyle: z.enum(['dashed', 'dotted', 'solid']).optional(),
  display: z.enum(['none', 'flex']).default('flex').optional(),
  textAlign: z.enum(['left', 'right', 'center']).default('left').optional(),
  fontSize: z.number().min(10).max(30).default(24).optional(),
  fontWeight: z.enum(['normal', 'medium', 'semibold', 'bold']).default('bold').optional(),
  letterSpacing: z.number().default(0).optional(),
  marginBottom: z.number().default(0).optional(),
  marginLeft: z.number().default(0).optional(),
  marginRight: z.number().default(0).optional(),
  marginTop: z.number().default(0).optional(),
  margin: z.number().default(0).optional(),
  paddingBottom: z.number().default(0).optional(),
  paddingLeft: z.number().default(0).optional(),
  paddingRight: z.number().default(0).optional(),
  paddingTop: z.number().default(0).optional(),
  padding: z.number().default(0).optional(),
  flexDirection: z.enum(['row', 'column']).default('row').optional(),
  flexWrap: z.enum(['wrap', 'nowrap']).optional(),

  height: z.number().or(z.string()).default(0).optional(),
  width: z.number().or(z.string()).default(0).optional(),
  maxHeight: z.number().or(z.string()).default(0).optional(),
  maxWidth: z.number().or(z.string()).default(0).optional(),
  minHeight: z.number().or(z.string()).default(0).optional(),
  minWidth: z.number().or(z.string()).default(0).optional(),

  gap: z.number().default(0).optional(),
  color: colorSchema.optional(),
  backgroundColor: colorSchema.optional(),

  border: z.union([z.number(), z.string()]).optional(),
  borderTop: z.union([z.number(), z.string()]).optional(),
  borderRight: z.union([z.number(), z.string()]).optional(),
  borderBottom: z.union([z.number(), z.string()]).optional(),
  borderLeft: z.union([z.number(), z.string()]).optional(),
  borderColor: z.string().optional(),
  borderRadius: z.union([z.number(), z.string()]).optional(),
  borderStyle: z.enum(['dashed', 'dotted', 'solid']).optional(),
  borderWidth: z.union([z.number(), z.string()]).optional(),
});
const typographyClassesSchema = z.object({
  h6: resumeDesignStyleSchema.optional(),
  h5: resumeDesignStyleSchema.optional(),
  h4: resumeDesignStyleSchema.optional(),
  h3: resumeDesignStyleSchema.optional(),
  h2: resumeDesignStyleSchema.optional(),
  h1: resumeDesignStyleSchema.optional(),
  p: resumeDesignStyleSchema.optional(),
  'text-muted': resumeDesignStyleSchema.optional(),
});

const fontSchema = z.object({
  family: z.string(),
  headingFamily: z.string().optional(), // Optional different font for headings
  fallback: z.string().default("'Helvetica', 'Arial', sans-serif"),
  baseSize: z.number().min(8).max(14).default(10), // Base font size in points
});

export const baseResumeTemplateElementSchema = z.object({
  type: z.enum(['Text', 'View']),
  style: resumeDesignStyleSchema.optional(),
  path: z.string().optional(),
  render: z.string().optional(),
  data: z.string().optional(),
  class: z.string().optional(),
});

type ResumeTemplateElement = z.infer<typeof baseResumeTemplateElementSchema> & {
  elements?: ResumeTemplateElement[];
};

export const resumeTemplateElementSchema: z.ZodType<ResumeTemplateElement> =
  baseResumeTemplateElementSchema.extend({
    elements: z.lazy(() => resumeTemplateElementSchema.array()).optional(),
  });

const dateFormatSchema = z.enum(['YYYY/MM', 'YYYY MM', 'MM/YYYY', 'MMM YYYY']).default('MM/YYYY');

export const resumeTemplateSchema = z.object({
  name: z.string().default('Default'),
  version: z.number().default(1),
  pageSize: resumeDesignPageSize,
  orientation: resumeDesignOrientation,
  fonts: fontSchema,
  classDefs: z.record(z.string(), resumeDesignStyleSchema).and(typographyClassesSchema),
  spacing: spacingSchema,
  dateFormat: dateFormatSchema.optional(),

  elements: resumeTemplateElementSchema.array(),
});

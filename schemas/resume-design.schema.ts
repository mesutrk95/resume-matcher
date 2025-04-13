import { z } from 'zod';

const fontSchema = z.object({
  family: z.string(),
  headingFamily: z.string().optional(), // Optional different font for headings
  fallback: z.string().default("'Helvetica', 'Arial', sans-serif"),
  baseSize: z.number().min(8).max(14).default(10), // Base font size in points
});

const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color');

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

export const elementStyleSchema = z.object({
  class: resumeDesignClassSchema.optional(),
  style: resumeDesignStyleSchema.optional(),
});

export const sectionSchema = elementStyleSchema.extend({
  label: z.object({ text: z.string().optional(), enable: z.boolean().optional() }).optional(),
  container: elementStyleSchema.extend({}).optional(),
  heading: elementStyleSchema.extend({}).optional(),
  item: elementStyleSchema.extend({}).optional(),
});

const sectionRowItemSchema = z.lazy(() =>
  z.union([
    z.string(), // Simple item key
    z.object({
      items: z.array(z.string()), // Group of item keys
      separator: z.string().optional(), // Separator for this group
    }),
  ]),
);

const sectionRowSchema = elementStyleSchema.extend({
  separator: z.string().optional(),
  items: z.array(sectionRowItemSchema),
});

// Update the sectionSubheaderSchema to be more generic
export const sectionSubheaderSchema = elementStyleSchema.extend({
  rows: z.array(sectionRowSchema),
});

// Define spacing schema
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

// Define section schema for layout customization
export const sectionNamesSchema = z.enum([
  'contactInfo',
  'fullname',
  'title',
  'summary',
  'experiences',
  'educations',
  'skills',
  'projects',
  'languages',
  'certifications',
  'awards',
  'interests',
  'references',
]);

// Define column layout options
const columnLayoutSchema = z.enum(['single', 'two-columns']);

const dateFormatSchema = z.enum(['YYYY/MM', 'YYYY MM', 'MM/YYYY', 'MMM YYYY']).default('MM/YYYY');

// Define section specific layout settings
const sectionsSchema = elementStyleSchema.extend({
  heading: elementStyleSchema.optional(),
  container: elementStyleSchema.optional(),

  experiences: sectionSchema.extend({
    company: elementStyleSchema.extend({
      enable: z.boolean().default(true).optional(),
    }),
    bullets: elementStyleSchema
      .extend({
        enable: z.boolean().default(true).optional(),
        size: z.number().default(1).optional(),
        symbol: z.string().default('•').optional(),
      })
      .optional(),
    items: elementStyleSchema
      .extend({
        item: elementStyleSchema.optional(),
      })
      .optional(),
    subheader: sectionSubheaderSchema
      .extend({
        role: elementStyleSchema.extend({}).optional(),
        metadata: elementStyleSchema.extend({}).optional(),
        company: elementStyleSchema.extend({}).optional(),
        dates: elementStyleSchema
          .extend({
            enable: z.boolean().default(true).optional(),
            format: dateFormatSchema.optional(),
          })
          .optional(),
        location: elementStyleSchema
          .extend({
            enable: z.boolean().default(true),
            format: dateFormatSchema.optional(),
          })
          .optional(),
        positionType: elementStyleSchema.extend({}).optional(),
      })
      .optional(),
    group: elementStyleSchema.extend({}).optional(),
  }),
  projects: sectionSchema.extend({
    subheader: sectionSubheaderSchema
      .extend({
        url: elementStyleSchema.optional(),
        date: elementStyleSchema.optional(),
        name: elementStyleSchema.optional(),
      })
      .optional(),
  }),
  educations: sectionSchema.extend({
    item: elementStyleSchema.optional(),
    subheader: sectionSubheaderSchema.extend({}).optional(),
  }),
  summary: sectionSchema.extend({}),
  skills: sectionSchema.extend({
    groupByCategory: z.boolean().default(true),

    list: elementStyleSchema.extend({ itemsSeparator: z.string().optional() }),
    category: elementStyleSchema.extend({
      itemsSeparator: z.string().optional(),
    }),
  }),
  contactInfo: sectionSchema.extend({
    showIcons: z.boolean().default(true),
    separator: z.string().optional(),
    items: z.array(
      z.enum(['email', 'phone', 'linkedIn', 'github', 'website', 'address', 'country']),
    ),
  }),
  references: sectionSchema.extend({
    subheader: sectionSubheaderSchema.extend({}).optional(),
  }),
  interests: sectionSchema.extend({
    itemsSeperator: z.string().optional(),
  }),
  certifications: sectionSchema.extend({
    subheader: sectionSubheaderSchema.extend({}).optional(),
  }),
  awards: sectionSchema.extend({
    subheader: sectionSubheaderSchema.extend({}).optional(),
  }),
  licenses: sectionSchema.extend({}),
  languages: sectionSchema.extend({
    itemsSeperator: z.string().optional(),
  }),
  fullname: sectionSchema.extend({}),
  title: sectionSchema.extend({}),
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

// Define the main resume design schema
export const resumeDesignSchema = z.object({
  name: z.string().default('Default'),
  version: z.number().default(1),
  pageSize: resumeDesignPageSize,
  orientation: resumeDesignOrientation,
  fonts: fontSchema,
  classDefs: z.record(z.string(), resumeDesignStyleSchema).and(typographyClassesSchema),
  spacing: spacingSchema,
  columnLayout: columnLayoutSchema.default('single'),
  sectionOrder: z
    .array(sectionNamesSchema)
    .default([
      'title',
      'fullname',
      'contactInfo',
      'summary',
      'experiences',
      'educations',
      'skills',
      'projects',
      'languages',
      'certifications',
      'awards',
      'interests',
      'references',
    ])
    .optional(),
  leftColumn: elementStyleSchema
    .extend({
      sections: z.array(sectionNamesSchema).optional(),
    })
    .optional(),
  rightColumn: elementStyleSchema
    .extend({
      sections: z.array(sectionNamesSchema).optional(),
    })
    .optional(),
  header: elementStyleSchema
    .extend({
      sections: z.array(sectionNamesSchema).optional(),
    })
    .optional(),
  sections: sectionsSchema,
  enablePageNumbers: z.boolean().default(true),
  dateFormat: dateFormatSchema,
  customCss: z.string().optional(),
});

// Export the default resume design
export const DEFAULT_RESUME_DESIGN: z.infer<typeof resumeDesignSchema> = {
  name: 'Two Column Gray',
  version: 1,
  pageSize: 'A4',
  orientation: 'portrait',
  fonts: {
    family: 'Open Sans',
    fallback: 'Helvetica, Arial, sans-serif',
    baseSize: 10,
  },
  columnLayout: 'two-columns',
  header: {
    sections: ['title', 'fullname', 'contactInfo', 'summary'],
    style: {
      paddingBottom: 20,
    },
  },
  rightColumn: {
    style: {
      width: '30%',
      paddingLeft: 30,
      borderLeft: 1,
      borderColor: '#aeaeae',
    },
    sections: ['skills', 'languages', 'interests'],
  },
  leftColumn: {
    style: { width: '70%', paddingRight: 30 },
    sections: ['experiences', 'certifications', 'references', 'awards', 'educations', 'projects'],
  },
  classDefs: {
    'text-muted': { color: '#666' },
    h1: { fontSize: 24, fontWeight: 'bold' },
    h2: { fontSize: 18, fontWeight: 'bold' },
    h3: { fontSize: 16, fontWeight: 'bold' },
    h4: { fontSize: 14, fontWeight: 'bold' },
    h5: { fontSize: 12, fontWeight: 'bold' },
    h6: { fontSize: 10, fontWeight: 'bold' },
    p: { fontSize: 10, fontWeight: 'normal' },
    'flex-between': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  },
  spacing: {
    unit: 4,
    sectionGap: 3,
    itemGap: 1,
    pagePadding: { top: 30, right: 30, bottom: 30, left: 30 },
  },
  sections: {
    container: { class: 'p', style: { paddingBottom: 10 } },
    heading: {
      class: 'h4',
      style: {
        marginBottom: 3,
        borderBottom: 2,
        borderColor: '#15803d',
        paddingBottom: 2,
      },
    },
    projects: {
      label: { enable: true },
      subheader: {
        name: { class: 'h5' },
        url: { class: 'text-muted' },
        date: { class: 'text-muted' },
        rows: [{ items: ['name', 'date'], class: 'flex-between' }, { items: ['url'] }],
      },
      item: { style: { paddingBottom: 5 } },
      style: {},
    },
    certifications: {
      label: { enable: true },
      subheader: {
        rows: [{ items: ['issuer', 'date'], class: 'flex-between' }, { items: ['name'] }],
      },
    },
    interests: { label: { enable: true } },
    awards: {
      label: { enable: true },
      subheader: {
        rows: [{ items: ['name', 'date'], class: 'flex-between' }, { items: ['issuer'] }],
      },
    },
    languages: { label: { enable: true } },
    licenses: { label: { enable: true } },
    references: {
      label: { enable: true },
      subheader: {
        rows: [
          {
            items: ['name', 'title', 'company', 'email', 'phone', 'relationship'],
            separator: '|',
          },
        ],
      },
      item: { style: { paddingBottom: 10 } },
    },
    experiences: {
      label: { enable: true },
      company: {},
      bullets: { symbol: '•' },
      items: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          marginBottom: 5,
        },
        item: {
          style: {
            marginLeft: 5,
            display: 'flex',
            flexDirection: 'row',
            gap: 3,
          },
        },
      },
      subheader: {
        rows: [
          { class: 'flex-between', items: ['role', 'date'] },
          {
            style: { display: 'flex', flexDirection: 'row', gap: 5 },
            separator: '•',
            items: ['company', 'location', 'positionType'],
          },
        ],
        style: { marginBottom: 2 },
        role: { class: 'h5' },
        company: { class: 'h6' },
        metadata: { class: 'text-muted' },
        dates: { format: 'MMM YYYY' },
      },
      style: {},
    },
    skills: {
      label: { enable: true },
      groupByCategory: true,
      category: {
        style: { fontWeight: 'bold', marginBottom: 5 },
        itemsSeparator: '\n',
      },
      list: { style: { fontWeight: 'normal' }, itemsSeparator: '\n' },
    },
    educations: {
      label: { enable: true },
      subheader: {
        rows: [
          { class: 'flex-between', items: ['degree', 'date'] },
          { separator: ' • ', items: ['institution', 'location'] },
        ],
      },
      item: { style: { paddingBottom: 10 } },
    },
    summary: {
      label: { enable: false },
      style: {},
    },
    title: {
      class: 'h1',
      container: { class: 'h1' },
      label: { enable: false },
    },
    fullname: { container: { class: 'h2' }, label: { enable: false } },
    contactInfo: {
      container: { class: 'text-muted' },
      label: { enable: false, text: 'Profile' },
      separator: ' | ',
      items: ['country', 'email', 'phone', 'linkedIn', 'github', 'website', 'address'],
      showIcons: true,
    },
  },
  enablePageNumbers: true,
  dateFormat: 'MM/YYYY',
};

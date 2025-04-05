import { z } from "zod";

const fontSchema = z.object({
  family: z.string(),
  headingFamily: z.string().optional(), // Optional different font for headings
  fallback: z.string().default("'Helvetica', 'Arial', sans-serif"),
  baseSize: z.number().min(8).max(14).default(10), // Base font size in points
});

const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color");

export const typographySchema = z.enum([
  "h6",
  "h5",
  "h4",
  "h3",
  "h2",
  "h1",
  "p",
  "text-muted",
]);
const cssStyleSchema = z.object({
  textDecoration: z
    .enum([
      "line-through",
      "underline",
      "none",
      "line-through underline",
      "underline line-through",
    ])
    .optional(),
  textDecorationColor: colorSchema.optional(),
  textDecorationStyle: z.enum(["dashed", "dotted", "solid"]).optional(),
  display: z.enum(["none", "flex"]).default("flex").optional(),
  textAlign: z.enum(["left", "right", "center"]).default("left").optional(),
  fontSize: z.number().min(10).max(30).default(24).optional(),
  fontWeight: z
    .enum(["normal", "medium", "semibold", "bold"])
    .default("bold")
    .optional(),
  letterSpacing: z.number().default(0).optional(),
  marginBottom: z.number().default(0).optional(),
  marginLeft: z.number().default(0).optional(),
  marginRight: z.number().default(0).optional(),
  marginTop: z.number().default(0).optional(),
  paddingBottom: z.number().default(0).optional(),
  paddingLeft: z.number().default(0).optional(),
  paddingRight: z.number().default(0).optional(),
  paddingTop: z.number().default(0).optional(),
  flexDirection: z.enum(["row", "column"]).default("row").optional(),
  gap: z.number().default(0).optional(),
  color: colorSchema.optional(),
  border: z.union([z.number(), z.string()]).optional(),
  borderTop: z.union([z.number(), z.string()]).optional(),
  borderRight: z.union([z.number(), z.string()]).optional(),
  borderBottom: z.union([z.number(), z.string()]).optional(),
  borderLeft: z.union([z.number(), z.string()]).optional(),
  borderColor: z.string().optional(),
  borderRadius: z.union([z.number(), z.string()]).optional(),
  borderStyle: z.enum(["dashed", "dotted", "solid"]).optional(),
  borderWidth: z.union([z.number(), z.string()]).optional(),
});

export const elementStyleSchema = z.object({
  typo: typographySchema.optional(),
  style: cssStyleSchema.optional(),
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

export const resumeDesignPageSize = z
  .enum(["A4", "LETTER", "A5"])
  .default("A4");

export const resumeDesignOrientation = z
  .enum(["portrait", "landscape"])
  .default("portrait");

// Define section schema for layout customization
const sectionSchema = z.enum([
  "contactInfo",
  "title",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "languages",
  "certifications",
  "awards",
  "interests",
  "references",
]);

// Define column layout options
const columnLayoutSchema = z.enum([
  "single",
  "two-equal",
  "main-sidebar",
  "sidebar-main",
]);

const dateFormatSchema = z
  .enum(["YYYY/MM", "YYYY MM", "MM/YYYY", "MMM YYYY"])
  .default("MM/YYYY");

// Define section specific layout settings
const sectionsSchema = z.object({
  style: z.object({
    section: elementStyleSchema,
    sectionHeading: elementStyleSchema,
    sectionContainer: elementStyleSchema,
  }),
  experiences: z.object({
    company: elementStyleSchema.extend({
      enable: z.boolean().default(true).optional(),
    }),
    location: elementStyleSchema
      .extend({
        enable: z.boolean().default(true),
        format: dateFormatSchema.optional(),
      })
      .optional(),
    dates: elementStyleSchema
      .extend({
        enable: z.boolean().default(true).optional(),
        format: dateFormatSchema.optional(),
      })
      .optional(),
    bullets: elementStyleSchema
      .extend({
        enable: z.boolean().default(true).optional(),
        size: z.number().default(1).optional(),
        symbol: z.string().default("•").optional(),
      })
      .optional(),
    items: elementStyleSchema
      .extend({
        item: elementStyleSchema.optional(),
      })
      .optional(),
    subheader: elementStyleSchema
      .extend({
        title: elementStyleSchema.optional(),
        metadata: elementStyleSchema.optional(),
        company: elementStyleSchema.optional(),
      })
      .optional(),
    group: elementStyleSchema.extend({}).optional(),
    style: cssStyleSchema.optional(),
  }),
  projects: elementStyleSchema.extend({
    url: elementStyleSchema.optional(),
    date: elementStyleSchema.optional(),
    name: elementStyleSchema.optional(),
    subheader: elementStyleSchema.optional(),
  }),
  skills: z.object({
    display: z.enum(["inline", "list", "grid", "tag"]).default("tag"),
    groupByCategory: z.boolean().default(true),
    skillsList: z.object({
      typo: typographySchema.optional(),
      style: cssStyleSchema.optional(),
    }),
    skillsCategory: z.object({
      typo: typographySchema.optional(),
      style: cssStyleSchema.optional(),
    }),
    style: cssStyleSchema.optional(),
  }),
  contactInfo: z.object({
    showIcons: z.boolean().default(true),
    alignment: z.enum(["left", "center", "right"]).default("left"),
    style: cssStyleSchema.optional(),
  }),
});

// Define the main resume design schema
export const resumeDesignSchema = z.object({
  name: z.string().default("Default"),
  version: z.number().default(1),
  pageSize: resumeDesignPageSize,
  orientation: resumeDesignOrientation,
  fonts: fontSchema,
  typography: z.object({
    h6: cssStyleSchema.optional(),
    h5: cssStyleSchema.optional(),
    h4: cssStyleSchema.optional(),
    h3: cssStyleSchema.optional(),
    h2: cssStyleSchema.optional(),
    h1: cssStyleSchema.optional(),
    p: cssStyleSchema.optional(),
    "text-muted": cssStyleSchema.optional(),
  }),
  spacing: spacingSchema,
  columnLayout: columnLayoutSchema.default("single"),
  sectionOrder: z
    .array(sectionSchema)
    .default([
      "title",
      "contactInfo",
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "languages",
      "certifications",
      "awards",
      "interests",
      "references",
    ]),
  leftColumnSections: z.array(sectionSchema).optional(), // For two-column layouts
  rightColumnSections: z.array(sectionSchema).optional(), // For two-column layouts
  sections: sectionsSchema,
  enablePageNumbers: z.boolean().default(true),
  customCss: z.string().optional(), // For advanced customization
});

// Export the default resume design
export const DEFAULT_RESUME_DESIGN: z.infer<typeof resumeDesignSchema> = {
  name: "Classic",
  version: 1,
  pageSize: "A4" as z.infer<typeof resumeDesignPageSize>,
  orientation: "portrait" as z.infer<typeof resumeDesignOrientation>,
  fonts: {
    family: "Open Sans",
    fallback: "Helvetica, Arial, sans-serif",
    baseSize: 10,
  },
  typography: {
    "text-muted": {
      color: "#666",
    },
    h1: {
      fontSize: 24,
      fontWeight: "bold",
    },
    h2: {
      fontSize: 18,
      fontWeight: "bold",
    },
    h3: {
      fontSize: 16,
      fontWeight: "bold",
    },
    h4: {
      fontSize: 14,
      fontWeight: "bold",
    },
    h5: {
      fontSize: 12,
      fontWeight: "bold",
    },
    h6: {
      fontSize: 10,
      fontWeight: "bold",
    },
    p: {
      fontSize: 10,
      fontWeight: "normal",
    },
  },
  spacing: {
    unit: 4,
    sectionGap: 3,
    itemGap: 1,
    pagePadding: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
  },
  columnLayout: "single",
  sectionOrder: [
    "contactInfo",
    "title",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "languages",
    "certifications",
  ],
  sections: {
    style: {
      sectionContainer: { typo: "p" },
      sectionHeading: {
        typo: "h4",
        style: {
          marginBottom: 3,
          borderBottom: 2,
          borderColor: "#15803d",
          paddingBottom: 2,
        },
      },
      section: { style: { marginBottom: 10 } },
    },
    projects: {
      name: { typo: "h5" },
      url: { typo: "text-muted" },
      date: { typo: "text-muted" },
      subheader: {},
      style: { display: "flex", gap: 5, flexDirection: "column" },
    },
    experiences: {
      company: {},
      dates: {
        format: "MMM YYYY",
      },
      bullets: {
        symbol: "•",
      },
      items: {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginBottom: 5,
        },
        item: {
          style: {
            marginLeft: 5,
            display: "flex",
            flexDirection: "row",
            gap: 3,
          },
        },
      },
      subheader: {
        style: { marginBottom: 2 },
        title: { typo: "h5" },
        company: { typo: "h6" },
        metadata: { typo: "text-muted" },
      },
      style: {},
    },
    skills: {
      display: "tag",
      groupByCategory: true,
      skillsCategory: {
        style: { fontWeight: "bold" },
      },
      skillsList: {
        style: { fontWeight: "normal" },
      },
    },
    contactInfo: {
      showIcons: true,
      alignment: "left",
    },
  },
  enablePageNumbers: true,
};

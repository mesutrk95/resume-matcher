import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";
import {
  ResumeContent,
  ResumeDesign,
  ResumeDesignElementStyle,
  ResumeDesignTypography,
} from "@/types/resume";
// import { ResumeDesign } from "@/types/resume-design";
// import { SeperateList } from "../shared/seperate-list";
import React, { useMemo } from "react";
// import { DEFAULT_RESUME_DESIGN } from "@/config/resume-designs";
import {
  AwardsSection,
  CertificationsSection,
  ContactInfoSection,
  EducationSection,
  ExperienceSection,
  FullNameSection,
  InterestsSection,
  LanguagesSection,
  ProjectsSection,
  ReferencesSection,
  SkillsSection,
  SummarySection,
  TitleSection,
} from "./sections";
import { DEFAULT_RESUME_DESIGN } from "@/schemas/resume-design.schema";
import { ResumeRendererProvider, useResumeRenderer } from "./provider";

// Register fonts (optional but recommended for professional CVs)
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
  ],
});

// Helper function to register additional custom fonts if needed
const registerFonts = (design: ResumeDesign) => {
  // If the design uses a different font than what we already registered, register it here
  if (
    design.fonts.family !== "Open Sans" &&
    !Font.getRegisteredFontFamilies().includes(design.fonts.family)
  ) {
    // Logic to register additional fonts if needed
    // This would require a font registry/lookup table to map font names to CDN URLs
  }

  // Same for heading font if specified separately
  if (
    design.fonts.headingFamily &&
    design.fonts.headingFamily !== design.fonts.family &&
    !Font.getRegisteredFontFamilies().includes(design.fonts.headingFamily)
  ) {
    // Register heading font
  }
};

// Helper to dynamically render sections in order
const renderSection = (
  sectionName: string,
  resume: ResumeContent,
  styles: any,
  withIdentifiers?: boolean
) => {
  switch (sectionName) {
    case "contactInfo":
      return <ContactInfoSection resume={resume} />;
    case "fullname":
      return <FullNameSection resume={resume} />;
    case "title":
      return <TitleSection resume={resume} />;
    case "summary":
      return <SummarySection resume={resume} />;
    case "experiences":
      return (
        <>
          <ExperienceSection
            resume={resume}
            withIdentifiers={withIdentifiers}
          />
        </>
      );
    case "educations":
      return (
        <EducationSection resume={resume} withIdentifiers={withIdentifiers} />
      );
    case "skills":
      return (
        <SkillsSection resume={resume} withIdentifiers={withIdentifiers} />
      );
    case "projects":
      return (
        <ProjectsSection resume={resume} withIdentifiers={withIdentifiers} />
      );
    case "languages":
      return (
        <LanguagesSection resume={resume} withIdentifiers={withIdentifiers} />
      );
    case "certifications":
      return (
        <CertificationsSection
          resume={resume}
          withIdentifiers={withIdentifiers}
        />
      );
    case "awards":
      return (
        <AwardsSection resume={resume} withIdentifiers={withIdentifiers} />
      );
    case "interests":
      return (
        <InterestsSection resume={resume} withIdentifiers={withIdentifiers} />
      );
    case "references":
      return (
        <ReferencesSection resume={resume} withIdentifiers={withIdentifiers} />
      );
    default:
      return null;
  }
};

export const ResumeDocument = ({
  resumeDesign = DEFAULT_RESUME_DESIGN,
  ...props
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
  skipFont?: boolean;
  resumeDesign?: ResumeDesign;
}) => {
  return (
    <ResumeRendererProvider initialResumeDesign={DEFAULT_RESUME_DESIGN}>
      <ResumeDocumentRenderer {...props} />
    </ResumeRendererProvider>
  );
};

// Main ResumeDocument component
const ResumeDocumentRenderer = ({
  resume,
  withIdentifiers,
  skipFont,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
  skipFont?: boolean;
}) => {
  const { design } = useResumeRenderer();
  // Register any custom fonts needed by this design
  if (!skipFont) {
    registerFonts(design);
  }

  // Generate styles based on the resume design configuration
  const styles = useMemo(() => {
    const spacing = (units: number) => units * design.spacing.unit;
    const typo = (name?: ResumeDesignTypography) =>
      (name && design.typography[name]) || {};

    const getComputedStyle = (elementStyle?: ResumeDesignElementStyle) =>
      elementStyle
        ? {
            ...typo(elementStyle.typo),
            ...(elementStyle.style || {}),
          }
        : {};

    const styles = StyleSheet.create({
      page: {
        // flexDirection: "column",
        // backgroundColor: design.colors.background,
        padding: `${design.spacing.pagePadding.top}pt ${design.spacing.pagePadding.right}pt ${design.spacing.pagePadding.bottom}pt ${design.spacing.pagePadding.left}pt`,
        margin: 0,
        fontFamily: skipFont ? undefined : design.fonts.family,
        fontSize: design.fonts.baseSize,
        // color: design.colors.text,
      },
      twoColumnContainer: {
        flexDirection: "row",
        flexGrow: 1,
      },
      leftColumn: getComputedStyle(design.leftColumn),
      rightColumn: getComputedStyle(design.rightColumn),

      fullName: getComputedStyle(design.sections.fullname),

      pageNumber: {
        borderBottom: "",
        position: "absolute",
        bottom: design.spacing.pagePadding.bottom / 2,
        right: design.spacing.pagePadding.right,
        fontSize: 9,
      },
    });
    return styles;
  }, [design, skipFont]);

  // For single column layout
  if (design.columnLayout === "single") {
    return (
      <Document>
        <Page
          size={design.pageSize}
          style={styles.page}
          orientation={design.orientation}
        >
          {design.sectionOrder?.map((sectionName, index) => (
            <React.Fragment key={sectionName}>
              {/* style={styles.section}  */}
              {renderSection(sectionName, resume, styles, withIdentifiers)}
            </React.Fragment>
          ))}

          {design.enablePageNumbers && (
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
              fixed
            />
          )}
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page
        size={design.pageSize}
        style={styles.page}
        orientation={design.orientation}
      >
        <View style={styles.twoColumnContainer}>
          {/* Left/Main Column */}
          <View style={styles.leftColumn}>
            {design.leftColumn.sections?.map((sectionName, index) => (
              <React.Fragment key={sectionName}>
                {renderSection(sectionName, resume, styles, withIdentifiers)}
              </React.Fragment>
            ))}
          </View>

          {/* Right/Side Column */}
          <View style={styles.rightColumn}>
            {design.rightColumn.sections?.map((sectionName, index) => (
              <React.Fragment key={sectionName}>
                {renderSection(sectionName, resume, styles, withIdentifiers)}
              </React.Fragment>
            ))}
          </View>
        </View>

        {design.enablePageNumbers && (
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
            fixed
          />
        )}
      </Page>
    </Document>
  );
};

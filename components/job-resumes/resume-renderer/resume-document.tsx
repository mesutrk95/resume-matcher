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
  resumeDesign: ResumeDesign,
  styles: any,
  withIdentifiers?: boolean
) => {
  switch (sectionName) {
    case "contactInfo":
      return (
        <ContactInfoSection
          resume={resume}
          styles={styles}
          resumeDesign={resumeDesign}
        />
      );
    case "fullname":
      return (
        <FullNameSection
          resume={resume}
          styles={styles}
          resumeDesign={resumeDesign}
        />
      );
    case "title":
      return (
        <TitleSection
          resume={resume}
          styles={styles}
          resumeDesign={resumeDesign}
        />
      );
    case "summary":
      return (
        <SummarySection
          resume={resume}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    case "experience":
      return (
        <>
          <ExperienceSection
            resume={resume}
            styles={styles}
            resumeDesign={resumeDesign}
            withIdentifiers={withIdentifiers}
          />
        </>
      );
    case "education":
      return (
        <EducationSection
          resume={resume}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    case "skills":
      return (
        <SkillsSection
          resume={resume}
          resumeDesign={resumeDesign}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    case "projects":
      return (
        <ProjectsSection
          resume={resume}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    case "languages":
      return (
        <LanguagesSection
          resume={resume}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    case "certifications":
      return (
        <CertificationsSection
          resume={resume}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    case "awards":
      return (
        <AwardsSection
          resume={resume}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    case "interests":
      return (
        <InterestsSection
          resume={resume}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    case "references":
      return (
        <ReferencesSection
          resume={resume}
          styles={styles}
          withIdentifiers={withIdentifiers}
        />
      );
    default:
      return null;
  }
};

// Main ResumeDocument component
export const ResumeDocument = ({
  resume,
  withIdentifiers,
  skipFont,
  resumeDesign = DEFAULT_RESUME_DESIGN,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
  skipFont?: boolean;
  resumeDesign?: ResumeDesign;
}) => {
  // Register any custom fonts needed by this design
  if (!skipFont) {
    registerFonts(resumeDesign);
  }

  // Generate styles based on the resume design configuration
  const styles = useMemo(() => {
    const design = resumeDesign || DEFAULT_RESUME_DESIGN;
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

      // contactInfo: {},
      section: getComputedStyle(design.sections.style.section),
      sectionHeading: getComputedStyle(design.sections.style.sectionHeading),
      sectionContainer: getComputedStyle(
        design.sections.style.sectionContainer
      ),
      experience: getComputedStyle(design.sections.experiences),
      experienceItems: getComputedStyle(design.sections.experiences.items),
      experienceItem: getComputedStyle(design.sections.experiences.items?.item),
      experienceItemBullet: getComputedStyle(
        design.sections.experiences.bullets
      ),
      experienceSubheader: getComputedStyle(
        design.sections.experiences.subheader
      ),
      experienceSubheaderCompany: getComputedStyle(
        design.sections.experiences.subheader?.company
      ),
      experienceSubheaderTitle: getComputedStyle(
        design.sections.experiences.subheader?.title
      ),
      experienceSubheaderMetadata: getComputedStyle(
        design.sections.experiences.subheader?.metadata
      ),

      projects: getComputedStyle(design.sections.projects),
      projectDate: getComputedStyle(design.sections.projects.date),
      projectUrl: getComputedStyle(design.sections.projects.url),
      projectName: getComputedStyle(design.sections.projects.name),
      projectSubheader: getComputedStyle(design.sections.projects.subheader),

      skills: getComputedStyle(design.sections.skills),
      skillsCategory: getComputedStyle(design.sections.skills.category),
      skillsList: getComputedStyle(design.sections.skills.list),

      fullName: getComputedStyle(design.sections.fullName),

      pageNumber: {
        borderBottom: "",
        position: "absolute",
        bottom: design.spacing.pagePadding.bottom / 2,
        right: design.spacing.pagePadding.right,
        fontSize: 9,
        // color: design.colors.secondary,
      },
    });
    return styles;
  }, [resumeDesign, skipFont]);

  // For single column layout
  if (resumeDesign.columnLayout === "single") {
    return (
      <Document>
        <Page
          size={resumeDesign.pageSize}
          style={styles.page}
          orientation={resumeDesign.orientation}
        >
          {resumeDesign.sectionOrder?.map((sectionName, index) => (
            <React.Fragment key={sectionName}>
              {/* style={styles.section}  */}
              {renderSection(
                sectionName,
                resume,
                resumeDesign,
                styles,
                withIdentifiers
              )}
            </React.Fragment>
          ))}

          {resumeDesign.enablePageNumbers && (
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
        size={resumeDesign.pageSize}
        style={styles.page}
        orientation={resumeDesign.orientation}
      >
        <View style={styles.twoColumnContainer}>
          {/* Left/Main Column */}
          <View style={styles.leftColumn}>
            {resumeDesign.leftColumn.sections?.map((sectionName, index) => (
              <View key={sectionName} style={styles.section}>
                {renderSection(
                  sectionName,
                  resume,
                  resumeDesign,
                  styles,
                  withIdentifiers
                )}
              </View>
            ))}
          </View>

          {/* Right/Side Column */}
          <View style={styles.rightColumn}>
            {resumeDesign.rightColumn.sections?.map((sectionName, index) => (
              <View key={sectionName} style={styles.section}>
                {renderSection(
                  sectionName,
                  resume,
                  resumeDesign,
                  styles,
                  withIdentifiers
                )}
              </View>
            ))}
          </View>
        </View>

        {resumeDesign.enablePageNumbers && (
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

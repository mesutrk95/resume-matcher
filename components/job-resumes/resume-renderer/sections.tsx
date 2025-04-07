import { renderList, SeperateList } from "@/components/shared/seperate-list";
import { parseDate } from "@/components/ui/year-month-picker";
import {
  Experience,
  ResumeContent,
  ResumeDesignElementStyle,
  ResumeDesignSection,
  ResumeDesignSectionName,
  ResumeDesignSectionSubHeader,
  ResumeEducation,
  ResumeProject,
} from "@/types/resume";
import { Text, View } from "@react-pdf/renderer";
import moment from "moment";
import React from "react";
import { useResumeRenderer } from "./provider";

interface SectionHeaderProps {
  sectionName: ResumeDesignSectionName;
  data: Record<string, any>;
  getItemValue: (
    itemType: string,
    data: Record<string, any>
  ) => string | undefined;
}

/**
 * A reusable component for rendering section headers with configurable rows and items
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionName,
  data,
  getItemValue,
}) => {
  const { resolveStyle, design } = useResumeRenderer();

  const section = design.sections[sectionName] as ResumeDesignSection & {
    subheader: ResumeDesignSectionSubHeader;
  };
  const subheader = section.subheader;
  if (!subheader) return null;

  // Default item style getter if not provided
  const styleGetter = (itemType: string) => {
    const itemStyleKey = itemType as keyof typeof subheader;
    return subheader[itemStyleKey] as ResumeDesignElementStyle;
  };

  if (!subheader?.rows || subheader.rows.length === 0) {
    return null;
  }

  return (
    <View style={resolveStyle(subheader)}>
      {subheader.rows.map((row, rowIndex) => (
        <View key={rowIndex} style={resolveStyle(row)}>
          {!row.separator ? (
            // If no separator, render each item as a separate Text component
            row.items.map((itemType: string, itemIndex: number) => {
              const value = getItemValue(itemType, data);
              if (!value) return null;

              return (
                <Text
                  key={`${itemType}-${itemIndex}`}
                  style={resolveStyle(styleGetter(itemType))}
                >
                  {value}
                </Text>
              );
            })
          ) : (
            // With separator, render as a single Text component with separator between items
            <Text>
              {row.items.map((itemType: string, itemIndex: number) => {
                const value = getItemValue(itemType, data);
                if (!value) return null;

                // Check if this is the last valid item to avoid trailing separator
                const nextValidItemIndex = row.items.findIndex(
                  (nextItem, i) =>
                    i > itemIndex && !!getItemValue(nextItem, data)
                );
                const hasNextValidItem = nextValidItemIndex !== -1;

                return (
                  <React.Fragment key={`${itemType}-${itemIndex}`}>
                    <Text style={resolveStyle(styleGetter(itemType))}>
                      {value}
                    </Text>
                    {hasNextValidItem && <Text> {row.separator} </Text>}
                  </React.Fragment>
                );
              })}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const RenderSection = ({
  sectionName,
  defaultLabel,
  children,
}: {
  children: React.ReactNode;
  defaultLabel?: string;
  sectionName: ResumeDesignSectionName;
}) => {
  const { design, resolveStyle } = useResumeRenderer();
  const section = design.sections[sectionName] as ResumeDesignSection;

  return (
    <View style={resolveStyle(design.sections, section)}>
      {section.label?.enable && (
        <Text style={resolveStyle(design.sections.heading, section.heading)}>
          {section.label.text || defaultLabel}
        </Text>
      )}
      <View style={resolveStyle(design.sections.container, section?.container)}>
        {children}
      </View>
    </View>
  );
};

export const ContactInfoSection = ({ resume }: { resume: ResumeContent }) => {
  const { design, resolveStyle } = useResumeRenderer();
  // Helper function to get the value for a specific item type
  const getItemValue = (itemType: string) => {
    switch (itemType) {
      case "email":
        return resume.contactInfo.email;
      case "phone":
        return resume.contactInfo.phone;
      case "linkedIn":
        return resume.contactInfo.linkedIn;
      case "github":
        return resume.contactInfo.github;
      case "website":
        return resume.contactInfo.website;
      case "address":
        return resume.contactInfo.address;
      case "country":
        return resume.contactInfo.country;
      default:
        return "";
    }
  };

  // Get the configured items and separator
  const configuredItems = design.sections.contactInfo?.items || [
    "email",
    "phone",
    "linkedIn",
    "github",
    "website",
    "address",
    "country",
  ];
  const separator = design.sections.contactInfo?.separator;

  // Filter out items with empty values
  const validItems = configuredItems
    .map((itemType) => ({
      type: itemType,
      value: getItemValue(itemType),
    }))
    .filter((item) => item.value);

  return (
    <RenderSection sectionName="contactInfo">
      <Text>
        {renderList({
          data: validItems.map((item) => item.value),
          by: separator,
        })}
      </Text>

      {/* 
      {validItems.map((item, index) => (
        <React.Fragment key={item.type}>
            
          <Text>{item.value}</Text>
          {index < validItems.length - 1 && <Text>{separator}</Text>}
        </React.Fragment>
      ))} */}
    </RenderSection>
  );
};

export const FullNameSection = ({ resume }: { resume: ResumeContent }) => {
  //   const { design, resolveStyle } = useResumeRenderer();

  return (
    <RenderSection sectionName="fullname">
      <Text>
        {resume.contactInfo.firstName} {resume.contactInfo.lastName}
      </Text>
    </RenderSection>
  );
};

export const TitleSection = ({ resume }: { resume: ResumeContent }) => {
  //   const { design, resolveStyle } = useResumeRenderer();
  const title = resume.titles.find((t) => t.enabled);
  if (!title) return null;

  return (
    <RenderSection sectionName="title">
      <Text>{title.content}</Text>
    </RenderSection>
  );
};

export const SummarySection = ({ resume }: { resume: ResumeContent }) => {
  //   const { design, resolveStyle } = useResumeRenderer();
  const summary = resume.summaries.find((s) => s.enabled);
  if (!summary) return null;

  return (
    <RenderSection sectionName="summary" defaultLabel="Professional Summary">
      <Text>{summary.content}</Text>
    </RenderSection>
  );
};

// Helper function to get the formatted date string
const getFormattedDate = (
  dateString: string | undefined,
  format: string | undefined
) => {
  if (!dateString) return "";
  if (dateString === "Present") return "Present";
  return moment(parseDate(dateString)).format(format || "MMM YYYY");
};
export const ExperienceSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const { resolveStyle, design } = useResumeRenderer();
  const experiences = resume.experiences.filter((e) => e.enabled);
  if (experiences.length === 0) return null;

  // Define the value getter function for experience section
  const getExperienceItemValue = (itemType: string, experience: Experience) => {
    switch (itemType) {
      case "company":
        return experience.companyName;
      case "role":
        return experience.role;
      case "date":
        const startDate = getFormattedDate(
          experience.startDate,
          design.sections.experiences.subheader?.dates?.format
        );
        const endDate = getFormattedDate(
          experience.endDate,
          design.sections.experiences.subheader?.dates?.format
        );
        return `${startDate} - ${endDate}`;
      case "positionType":
        return experience.type;
      case "location":
        return experience.location;
      default:
        return "";
    }
  };

  return (
    <RenderSection sectionName="experiences" defaultLabel="Experiences">
      {experiences.map((experience) => (
        <View
          key={experience.id}
          style={resolveStyle(design.sections.experiences)}
        >
          <SectionHeader
            sectionName="experiences"
            data={experience}
            getItemValue={getExperienceItemValue as any}
          />

          <View style={resolveStyle(design.sections.experiences.items)}>
            {experience.items
              .filter((item) => item.enabled)
              .map((item) =>
                item.variations
                  .filter((v) => v.enabled)
                  .map((variation) => (
                    <View
                      key={variation.id}
                      style={resolveStyle(
                        design.sections.experiences.items?.item
                      )}
                    >
                      <Text
                        style={resolveStyle(
                          design.sections.experiences.bullets
                        )}
                      >
                        •
                      </Text>
                      <Text style={undefined}>
                        {withIdentifiers && <>[{variation.id}] </>}
                        {variation.content}
                      </Text>
                    </View>
                  ))
              )}
          </View>
        </View>
      ))}
    </RenderSection>
  );
};

export const EducationSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const { design, resolveStyle } = useResumeRenderer();
  const educations = resume.educations.filter((edu) => edu.enabled);
  if (educations.length === 0) return null;

  const getEducationItemValue = (
    itemType: string,
    education: ResumeEducation
  ) => {
    switch (itemType) {
      case "degree":
        return education.degree;
      case "institution":
        return education.institution;
      case "date":
        return `${education.startDate || ""} - ${education.endDate || ""}`;
      case "location":
        return education.location;
      default:
        return "";
    }
  };

  return (
    <RenderSection sectionName="educations" defaultLabel="Education">
      {educations.map((education) => (
        <View
          key={education.id}
          style={resolveStyle(design.sections.educations.item)}
        >
          {/* Use our new SectionHeader component */}
          <SectionHeader
            sectionName="educations"
            data={education}
            getItemValue={getEducationItemValue as any}
          />

          {education.content && (
            <Text style={undefined}>
              {withIdentifiers && <>[{education.id}] </>}
              {education.content}
            </Text>
          )}
        </View>
      ))}
    </RenderSection>
  );
};

export const SkillsSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const { design, resolveStyle } = useResumeRenderer();
  // Get enabled skill sets and their enabled skills
  const enabledSkillSets = resume.skills
    .filter((set) => set.enabled)
    .map((set) => ({
      ...set,
      skills: set.skills.filter((skill) => skill.enabled),
    }))
    .filter((set) => set.skills.length > 0);

  if (enabledSkillSets.length === 0) return null;

  const hasMultipleCategories =
    design.sections?.skills?.groupByCategory && enabledSkillSets.length > 1;

  return (
    <RenderSection sectionName="skills" defaultLabel="Skills">
      {design.sections?.skills?.groupByCategory ? (
        // Render skills grouped by category
        enabledSkillSets.map((skillSet, index) => (
          <View key={skillSet.category}>
            {hasMultipleCategories ? (
              <Text style={resolveStyle(design.sections.skills.category)}>
                {skillSet.category !== "Default" && skillSet.category.length > 0
                  ? skillSet.category +
                    (design.sections.skills.category.itemsSeparator || ": ")
                  : ""}
                <Text style={resolveStyle(design.sections.skills.list)}>
                  {renderList({
                    data: skillSet.skills.map(
                      (skill) =>
                        `${withIdentifiers ? `[${skill.id}] ` : ""}${
                          skill.content
                        }`
                    ),
                    by: design.sections.skills.list.itemsSeparator,
                  })}
                </Text>
              </Text>
            ) : (
              <Text style={resolveStyle(design.sections.skills.list)}>
                {renderList({
                  data: skillSet.skills.map(
                    (skill) =>
                      `${withIdentifiers ? `[${skill.id}] ` : ""}${
                        skill.content
                      }`
                  ),
                  by: ", ",
                })}
              </Text>
            )}
          </View>
        ))
      ) : (
        // Render all skills in a flat list
        <View style={resolveStyle(design.sections.skills.list)}>
          <Text>
            {renderList({
              data: enabledSkillSets.flatMap((set) =>
                set.skills.map(
                  (skill) =>
                    `${withIdentifiers ? `[${skill.id}] ` : ""}${skill.content}`
                )
              ),
              by: ", ",
            })}
          </Text>
        </View>
      )}
    </RenderSection>
  );
};

export const ProjectsSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const { design, resolveStyle } = useResumeRenderer();
  const projects = resume.projects.filter((p) => p.enabled);
  if (projects.length === 0) return null;

  // Define the value getter function for project section
  const getProjectItemValue = (itemType: string, project: ResumeProject) => {
    switch (itemType) {
      case "name":
        return project.name;
      case "url":
        return project.link;
      case "date":
        return `${project.startDate || ""} - ${project.endDate || ""}`;
      default:
        return "";
    }
  };

  return (
    <RenderSection sectionName="projects" defaultLabel="Projects">
      {projects.map((project) => (
        <View
          key={project.id}
          style={resolveStyle(design.sections.projects.item)}
        >
          <SectionHeader
            sectionName="projects"
            data={project}
            getItemValue={getProjectItemValue as any}
          />

          <Text style={undefined}>
            {withIdentifiers && <>[{project.id}] </>}
            {project.content}
          </Text>
        </View>
      ))}
    </RenderSection>
  );
};

export const LanguagesSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  //   const { design, resolveStyle } = useResumeRenderer();
  const languages = resume.languages;
  if (languages.length === 0) return null;

  return (
    <RenderSection sectionName="languages" defaultLabel="Languages">
      {languages.map((language, index) => (
        <Text key={index} style={undefined}>
          {withIdentifiers && language.id && <>[{language.id}] </>}
          {language.name}
          {language.level && ` (${language.level})`}
        </Text>
      ))}
    </RenderSection>
  );
};

// Certifications Section using SectionHeader
export const CertificationsSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const { design, resolveStyle } = useResumeRenderer();
  const certifications = resume.certifications;
  if (certifications.length === 0) return null;

  // Define the value getter function for certification section
  const getCertificationItemValue = (itemType: string, certification: any) => {
    if (typeof certification === "string") {
      return itemType === "name" ? certification : "";
    }

    switch (itemType) {
      case "name":
        return certification.name;
      case "issuer":
        return certification.issuer;
      case "date":
        return certification.date;
      default:
        return "";
    }
  };

  return (
    <RenderSection sectionName="certifications" defaultLabel="Certifications">
      {certifications.map((certification, index) => (
        <View
          key={index}
          style={resolveStyle(design.sections.certifications.item)}
        >
          <SectionHeader
            sectionName="certifications"
            data={certification}
            getItemValue={getCertificationItemValue}
          />
          {/* 
          {certification.description && (
            <Text style={undefined}>{certification.description}</Text>
          )} */}
        </View>
      ))}
    </RenderSection>
  );
};

// Awards Section using SectionHeader
export const AwardsSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const { design, resolveStyle } = useResumeRenderer();
  const awards = resume.awards;
  if (awards.length === 0) return null;

  // Define the value getter function for award section
  const getAwardItemValue = (itemType: string, award: any) => {
    if (typeof award === "string") {
      return itemType === "title" ? award : "";
    }

    switch (itemType) {
      case "title":
        return award.title;
      case "name":
        return award.name;
      case "description":
        return award.description;
      case "issuer":
        return award.issuer;
      case "date":
        return award.date;
      default:
        return "";
    }
  };

  return (
    <RenderSection sectionName="awards" defaultLabel="Awards & Achievements">
      {awards.map((award, index) => (
        <View key={index} style={resolveStyle(design.sections.awards.item)}>
          {/* Use SectionHeader component */}
          <SectionHeader
            sectionName="awards"
            data={award}
            getItemValue={getAwardItemValue}
          />

          {/* Render description if it exists and is not rendered in the header */}
          {award.description && (
            <Text style={undefined}>{award.description}</Text>
          )}
        </View>
      ))}
    </RenderSection>
  );
};

export const InterestsSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const interests = resume.interests;
  if (interests.length === 0) return null;

  return (
    <RenderSection sectionName="interests" defaultLabel="Interests">
      {interests.map((interest, index) => (
        <Text key={index} style={undefined}>
          {withIdentifiers && interest.id && <>[{interest.id}] </>}
          {typeof interest === "string" ? interest : interest.description}
        </Text>
      ))}
    </RenderSection>
  );
};

// References Section using SectionHeader
export const ReferencesSection = ({ resume }: { resume: ResumeContent }) => {
  const { design, resolveStyle } = useResumeRenderer();
  const references = resume.references;
  if (references.length === 0) return null;

  // Define the value getter function for reference section
  const getReferenceItemValue = (itemType: string, reference: any) => {
    if (typeof reference === "string") {
      return itemType === "name" ? reference : "";
    }

    switch (itemType) {
      case "name":
        return reference.name;
      case "title":
        return reference.title;
      case "relationship":
        return reference.relationship;
      case "company":
        return reference.company;
      case "email":
        return reference.email;
      case "phone":
        return reference.phone;
      default:
        return "";
    }
  };

  return (
    <RenderSection sectionName="references" defaultLabel="References">
      {references.map((reference, index) => (
        <View key={index} style={resolveStyle(design.sections.references.item)}>
          {/* Use SectionHeader component */}
          <SectionHeader
            sectionName="references"
            data={reference}
            getItemValue={getReferenceItemValue}
          />

          {/* Render description if it exists and is not rendered in the header */}
          {reference.description && (
            <Text style={undefined}>{reference.description}</Text>
          )}
        </View>
      ))}
    </RenderSection>
  );
};

import { renderList, SeperateList } from "@/components/shared/seperate-list";
import { parseDate } from "@/components/ui/year-month-picker";
import {
  Experience,
  ResumeContent,
  ResumeDesignSection,
  ResumeDesignSectionName,
} from "@/types/resume";
import { Text, View } from "@react-pdf/renderer";
import moment from "moment";
import React from "react";
import { useResumeRenderer } from "./provider";

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

  // Helper function to get the value for a specific item type
  const getItemValue = (experience: any, itemType: string) => {
    switch (itemType) {
      case "company":
        return experience.companyName;
      case "title":
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

  // Helper function to get style for a specific item type
  const getItemStyle = (itemType: string) => {
    switch (itemType) {
      case "company":
        return resolveStyle(design.sections.experiences.subheader?.company);
      case "title":
        return resolveStyle(design.sections.experiences.subheader?.title);
      case "metadata":
        return resolveStyle(design.sections.experiences.subheader?.metadata);
      case "date":
      case "positionType":
      case "location":
      default:
        return undefined;
    }
  };

  // Helper function to render row items with optional separator
  const renderRowItems = (row: any, experience: Experience) => {
    const { items, separator } = row;

    if (!separator) {
      // If no separator, render each item as a separate Text component
      return items.map((itemType: string, itemIndex: number) => (
        <Text key={`${itemType}-${itemIndex}`} style={getItemStyle(itemType)}>
          {getItemValue(experience, itemType)}
        </Text>
      ));
    }

    // With separator, render as a single Text component with separator between items
    return (
      <Text style={{}}>
        {items.map((itemType: string, itemIndex: number) => {
          const value = getItemValue(experience, itemType);
          if (!value) return null;

          return (
            <React.Fragment key={`${itemType}-${itemIndex}`}>
              <Text style={getItemStyle(itemType)}>{value}</Text>
              {itemIndex < items.length - 1 &&
                value &&
                getItemValue(experience, items[itemIndex + 1]) && (
                  <Text> {separator} </Text>
                )}
            </React.Fragment>
          );
        })}
      </Text>
    );
  };

  return (
    <RenderSection sectionName="experiences" defaultLabel="Experiences">
      {experiences.map((experience) => (
        <View
          key={experience.id}
          style={resolveStyle(design.sections.experiences)}
        >
          <View style={resolveStyle(design.sections.experiences.subheader)}>
            {design.sections.experiences.subheader?.rows?.map(
              (row, rowIndex) => (
                <View key={rowIndex} style={row.style || {}}>
                  {renderRowItems(row, experience)}
                </View>
              )
            )}
          </View>

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

  return (
    <RenderSection sectionName="educations" defaultLabel="Educations">
      {educations.map((edu) => (
        <View
          key={edu.id}
          style={resolveStyle(design.sections.educations.item)}
        >
          <Text style={undefined}>{edu.degree}</Text>
          <Text style={undefined}>{edu.institution}</Text>
          <Text style={undefined}>
            <SeperateList
              data={[edu.location, `${edu.startDate} - ${edu.endDate}`]}
            />
          </Text>
          {edu.content && (
            <Text style={undefined}>
              {withIdentifiers && <>[{edu.id}] </>}
              {edu.content}
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

  return (
    <RenderSection sectionName="projects" defaultLabel="Projects">
      {projects.map((project) => (
        <View key={project.id} style={undefined}>
          <Text style={resolveStyle(design.sections.projects.name)}>
            {project.name}
          </Text>
          {project.link && (
            <Text style={resolveStyle(design.sections.projects.url)}>
              {project.link}
            </Text>
          )}
          <Text style={resolveStyle(design.sections.projects.date)}>
            {project.startDate &&
              project.endDate &&
              `${project.startDate} - ${project.endDate}`}
          </Text>
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
          {typeof language === "string" ? language : language.name}
          {typeof language !== "string" &&
            language.proficiency &&
            ` (${language.proficiency})`}
        </Text>
      ))}
    </RenderSection>
  );
};

export const CertificationsSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const certifications = resume.certifications;
  if (certifications.length === 0) return null;

  return (
    <RenderSection sectionName="certifications" defaultLabel="Certifications">
      {certifications.map((cert, index) => (
        <View key={index} style={undefined}>
          <Text style={undefined}>
            {withIdentifiers && cert.id && <>[{cert.id}] </>}
            {typeof cert === "string" ? cert : cert.name}
          </Text>
          {typeof cert !== "string" && cert.issuer && (
            <Text style={undefined}>{cert.issuer}</Text>
          )}
          {typeof cert !== "string" && cert.date && (
            <Text style={undefined}>{cert.date}</Text>
          )}
          {typeof cert !== "string" && cert.description && (
            <Text style={undefined}>{cert.description}</Text>
          )}
        </View>
      ))}
    </RenderSection>
  );
};

export const AwardsSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const awards = resume.awards;
  if (awards.length === 0) return null;

  return (
    <RenderSection sectionName="awards" defaultLabel="Awards & Achievements">
      {awards.map((award, index) => (
        <View key={index} style={undefined}>
          <Text style={undefined}>
            {withIdentifiers && award.id && <>[{award.id}] </>}
            {typeof award === "string" ? award : award.title}
          </Text>
          {typeof award !== "string" && award.issuer && (
            <Text style={undefined}>{award.issuer}</Text>
          )}
          {typeof award !== "string" && award.date && (
            <Text style={undefined}>{award.date}</Text>
          )}
          {typeof award !== "string" && award.description && (
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
          {typeof interest === "string" ? interest : interest.name}
        </Text>
      ))}
    </RenderSection>
  );
};

export const ReferencesSection = ({
  resume,
  withIdentifiers,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
}) => {
  const references = resume.references;
  if (references.length === 0) return null;

  return (
    <RenderSection sectionName="references" defaultLabel="References">
      {references.map((reference, index) => (
        <View key={index}>
          <Text style={undefined}>
            {withIdentifiers && reference.id && <>[{reference.id}] </>}
            {typeof reference === "string" ? reference : reference.name}
          </Text>
          {typeof reference !== "string" && reference.position && (
            <Text style={undefined}>{reference.position}</Text>
          )}
          {typeof reference !== "string" && reference.company && (
            <Text style={undefined}>{reference.company}</Text>
          )}
          {typeof reference !== "string" && reference.email && (
            <Text style={undefined}>{reference.email}</Text>
          )}
          {typeof reference !== "string" && reference.phone && (
            <Text style={undefined}>{reference.phone}</Text>
          )}
        </View>
      ))}
    </RenderSection>
  );
};

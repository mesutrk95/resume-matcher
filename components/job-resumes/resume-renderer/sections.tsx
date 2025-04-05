import { renderList, SeperateList } from "@/components/shared/seperate-list";
import { ResumeContent, ResumeDesign, ResumeSkill } from "@/types/resume";
import { Text, View } from "@react-pdf/renderer";
import React from "react";

export const ContactInfoSection = ({
  resume,
  styles,
}: {
  resume: ResumeContent;
  styles: any;
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Contact Information</Text>
      <Text style={styles.contactInfo}>
        <SeperateList
          data={[
            resume.contactInfo.email,
            resume.contactInfo.phone,
            resume.contactInfo.linkedIn,
            resume.contactInfo.github,
            resume.contactInfo.website,
            resume.contactInfo.address,
            resume.contactInfo.country,
          ]}
        />
      </Text>
    </View>
  );
};

export const TitleSection = ({
  resume,
  styles,
}: {
  resume: ResumeContent;
  styles: any;
}) => {
  const title = resume.titles.find((t) => t.enabled);
  if (!title) return null;

  return (
    <View style={styles.header}>
      <Text style={styles.name}>
        <SeperateList
          data={[resume.contactInfo.firstName, resume.contactInfo.lastName]}
          by=" "
        />
      </Text>
      <Text style={styles.title}>{title.content}</Text>
    </View>
  );
};

export const SummarySection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const summary = resume.summaries.find((s) => s.enabled);
  if (!summary) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Professional Summary</Text>
      <Text style={styles.sectionContainer}>
        {withIdentifiers && <>[{summary.id}] </>}
        {summary.content}
      </Text>
    </View>
  );
};

export const ExperienceSection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const experiences = resume.experiences.filter((e) => e.enabled);
  if (experiences.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Experiences</Text>
      {experiences.map((experience) => (
        <View key={experience.id} style={styles.experience}>
          <View style={styles.experienceSubheader}>
            <Text style={styles.experienceSubheaderTitle}>{experience.role}</Text>
            <Text style={styles.experienceSubheaderCompany}>{experience.companyName}</Text>
            <Text style={styles.experienceSubheaderMetadata}>
              <SeperateList
                data={[
                  experience.location,
                  experience.type,
                  `${experience.startDate} - ${experience.endDate}`,
                ]}
              />
            </Text>
          </View>

          <View style={styles.experienceItems}>
            {experience.items
              .filter((item) => item.enabled)
              .map((item) =>
                item.variations
                  .filter((v) => v.enabled)
                  .map((variation) => (
                    <View key={variation.id} style={styles.experienceItem}>
                      <Text style={styles.experienceItemBullet}>•</Text>
                      <Text style={styles.bulletText}>
                        {withIdentifiers && <>[{variation.id}] </>}
                        {variation.content}
                      </Text>
                    </View>
                  ))
              )}
          </View>
        </View>
      ))}
    </View>
  );
};

export const EducationSection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const educations = resume.educations.filter((edu) => edu.enabled);
  if (educations.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Education</Text>
      {educations.map((edu) => (
        <View key={edu.id} style={styles.sectionContainer}>
          <Text style={styles.jobTitle}>{edu.degree}</Text>
          <Text style={styles.company}>{edu.institution}</Text>
          <Text style={styles.metadata}>
            <SeperateList
              data={[edu.location, `${edu.startDate} - ${edu.endDate}`]}
            />
          </Text>
          {edu.content && (
            <Text style={styles.description}>
              {withIdentifiers && <>[{edu.id}] </>}
              {edu.content}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

export const SkillsSection = ({
  resume,
  resumeDesign,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  resumeDesign: ResumeDesign;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const skills = resume.skills.filter((s) => s.enabled);
  if (skills.length === 0) return null;

  // Group skills by category if needed
  const categorizedSkills: Record<string, ResumeSkill[]> = {};

  if (resumeDesign.sections?.skills?.groupByCategory) {
    skills.forEach((skill) => {
      if (!categorizedSkills[skill.category]) {
        categorizedSkills[skill.category] = [];
      }
      categorizedSkills[skill.category].push(skill);
    });
  }

  const hasMultipleCategories =
    resumeDesign.sections?.skills?.groupByCategory &&
    Object.keys(categorizedSkills).length > 1;

  return (
    <View style={styles.section}>
      {/* <Text style={styles.sectionTitle}>SKILLS</Text> */}
      <Text style={styles.sectionHeading}>Skills</Text>
      <View style={styles.sectionContent}>
        {resumeDesign.sections?.skills?.groupByCategory ? (
          Object.entries(categorizedSkills).map(
            ([category, categorySkills], index) => (
              <View key={category}>
                {hasMultipleCategories && (
                  <Text style={styles.skillCategory}>
                    {category}:{" "}
                    <Text style={styles.skillsList}>
                      {renderList({
                        data: categorySkills.map(
                          (skill) =>
                            `${withIdentifiers ? `[${skill.id}] ` : ""}${
                              skill.content
                            }`
                        ),
                        by: ", ",
                      })}
                    </Text>
                  </Text>
                )}
              </View>
            )
          )
        ) : (
          <View style={styles.skillsList}>
            <Text>
              {renderList({
                data: skills.map(
                  (skill) =>
                    `${withIdentifiers ? `[${skill.id}] ` : ""}${skill.content}`
                ),
                by: ", ",
              })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const ProjectsSection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const projects = resume.projects.filter((p) => p.enabled);
  if (projects.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionHeading}>Projects</Text>
      {projects.map((project) => (
        <View key={project.id} style={styles.sectionContainer}>
          <Text style={styles.jobTitle}>{project.name}</Text>
          {project.link && <Text style={styles.metadata}>{project.link}</Text>}
          <Text style={styles.metadata}>
            {project.startDate &&
              project.endDate &&
              `${project.startDate} - ${project.endDate}`}
          </Text>
          <Text style={styles.description}>
            {withIdentifiers && <>[{project.id}] </>}
            {project.content}
          </Text>
        </View>
      ))}
    </View>
  );
};

export const LanguagesSection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const languages = resume.languages;
  if (languages.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Languages</Text>
      <View style={styles.sectionContainer}>
        {languages.map((language, index) => (
          <Text key={index} style={styles.sectionItem}>
            {withIdentifiers && language.id && <>[{language.id}] </>}
            {typeof language === "string" ? language : language.name}
            {typeof language !== "string" &&
              language.proficiency &&
              ` (${language.proficiency})`}
          </Text>
        ))}
      </View>
    </View>
  );
};

export const CertificationsSection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const certifications = resume.certifications;
  if (certifications.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Certifications</Text>
      {certifications.map((cert, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text style={styles.subsectionHeading}>
            {withIdentifiers && cert.id && <>[{cert.id}] </>}
            {typeof cert === "string" ? cert : cert.name}
          </Text>
          {typeof cert !== "string" && cert.issuer && (
            <Text style={styles.metadata}>{cert.issuer}</Text>
          )}
          {typeof cert !== "string" && cert.date && (
            <Text style={styles.metadata}>{cert.date}</Text>
          )}
          {typeof cert !== "string" && cert.description && (
            <Text style={styles.description}>{cert.description}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

export const AwardsSection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const awards = resume.awards;
  if (awards.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Awards & Achievements</Text>
      {awards.map((award, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text style={styles.subsectionHeading}>
            {withIdentifiers && award.id && <>[{award.id}] </>}
            {typeof award === "string" ? award : award.title}
          </Text>
          {typeof award !== "string" && award.issuer && (
            <Text style={styles.metadata}>{award.issuer}</Text>
          )}
          {typeof award !== "string" && award.date && (
            <Text style={styles.metadata}>{award.date}</Text>
          )}
          {typeof award !== "string" && award.description && (
            <Text style={styles.description}>{award.description}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

export const InterestsSection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const interests = resume.interests;
  if (interests.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Interests</Text>
      <View style={styles.sectionContainer}>
        {interests.map((interest, index) => (
          <Text key={index} style={styles.sectionItem}>
            {withIdentifiers && interest.id && <>[{interest.id}] </>}
            {typeof interest === "string" ? interest : interest.name}
          </Text>
        ))}
      </View>
    </View>
  );
};

export const ReferencesSection = ({
  resume,
  styles,
  withIdentifiers,
}: {
  resume: ResumeContent;
  styles: any;
  withIdentifiers?: boolean;
}) => {
  const references = resume.references;
  if (references.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>References</Text>
      {references.map((reference, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text style={styles.subsectionHeading}>
            {withIdentifiers && reference.id && <>[{reference.id}] </>}
            {typeof reference === "string" ? reference : reference.name}
          </Text>
          {typeof reference !== "string" && reference.position && (
            <Text style={styles.metadata}>{reference.position}</Text>
          )}
          {typeof reference !== "string" && reference.company && (
            <Text style={styles.metadata}>{reference.company}</Text>
          )}
          {typeof reference !== "string" && reference.email && (
            <Text style={styles.metadata}>{reference.email}</Text>
          )}
          {typeof reference !== "string" && reference.phone && (
            <Text style={styles.metadata}>{reference.phone}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

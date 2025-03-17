import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { SeperateList } from "../shared/seperate-list";
import { ResumeContent } from "@/types/resume";

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

// Define styles for PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    margin: 0,
    fontFamily: "Open Sans",
  },
  section: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    color: "#555555",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 10,
    color: "#333333",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 3,
  },
  experience: {
    marginBottom: 0,
    fontSize: 10,
  },
  project: {
    marginBottom: 5,
    fontSize: 10,
  },
  experienceItem: {
    marginBottom: 5,
    marginLeft: 10,
    fontSize: 10,
  },
  jobTitle: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: "bold",
  },
  role: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: "bold",
  },
  company: {
    fontSize: 12,
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 3,
  },
  description: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  link: {
    fontSize: 10,
    lineHeight: 1.5,
  },
});

// CV Document Component
export const ResumeDocument = ({ resume }: { resume: ResumeContent }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header / Personal Info */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {resume.titles.find((t) => t.enabled)?.content}
        </Text>
        <Text style={styles.name}>
          <SeperateList
            data={[resume.contactInfo.firstName, resume.contactInfo.lastName]}
            by=" "
          />
        </Text>
        <Text style={styles.contactInfo}>
          <SeperateList
            data={[
              resume.contactInfo.country,
              resume.contactInfo.email,
              resume.contactInfo.phone,
              resume.contactInfo.linkedIn,
              resume.contactInfo.github,
              resume.contactInfo.website,
            ]}
          />
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.description}>
          {resume.summaries.find((s) => s.enabled)?.content}
        </Text>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.skills}>
          {resume.skills
            .filter((s) => s.enabled)
            .map((s) => s.content)
            .join(", ")}
        </Text>
      </View>

      {/* Experience */}
      <View style={styles.section} wrap>
        <Text style={styles.sectionTitle}>Experiences</Text>
        {resume.experiences
          .filter((e) => e.enabled)
          .map((experience, index) => (
            // <View key={index} style={styles.experience}>
            <>
              <View key={index} style={styles.experience} wrap={false}>
                <Text style={styles.jobTitle}>
                  {experience.companyName}
                  {/* <SeperateList
                      data={[experience.role, experience.companyName]}
                    /> */}
                </Text>
                <Text style={styles.role}>{experience.role} </Text>
                <Text style={styles.date}>
                  <SeperateList
                    data={[
                      experience.location,
                      experience.type,
                      `${experience.startDate} - ${experience.endDate}`,
                    ]}
                  />
                </Text>
              </View>
              {experience.items
                .filter((e) => e.enabled)
                .map((item) => {
                  return item.variations
                    .filter((v) => v.enabled)
                    .map((variation) => (
                      <Text
                        style={styles.experienceItem}
                        // className="text-sm"
                        key={item.id + variation.id}
                      >
                        {"\u2022 " + variation.content}
                      </Text>
                    ));
                })}
            </>
            // </View>
          ))}
      </View>

      {/* Projects */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {resume.projects
          .filter((prj) => prj.enabled)
          .map((prj, index) => (
            // <View key={index} style={styles.project}>
            <>
              <Text style={styles.jobTitle}>{prj.name}</Text>
              <Text style={styles.date}>
                {prj.startDate} - {prj.endDate}
              </Text>
              <Text style={styles.link}>{prj.link}</Text>
              <Text style={styles.description}>{prj.content}</Text>
            </>
            // </View>
          ))}
      </View>

      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {resume.educations
          .filter((edu) => edu.enabled)
          .map((edu, index) => (
            <View key={index} style={styles.experience}>
              <Text style={styles.jobTitle}>{edu.degree}</Text>
              <Text style={styles.company}>
                <SeperateList data={[edu.institution, edu.location]} />
              </Text>
              <Text style={styles.date}>Graduated: {edu.endDate}</Text>
            </View>
          ))}
      </View>
    </Page>
  </Document>
);

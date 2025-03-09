import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";
import { ResumeContent } from "@/types/resume";
import { SeperateList } from "../shared/seperate-list";
import { Button } from "../ui/button";
import { JobResume } from "@prisma/client";

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
    fontFamily: "Open Sans",
  },
  section: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 10,
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
    marginBottom: 10,
    fontSize: 10,
  },
  experienceItem: {
    marginBottom: 5,
    marginLeft: 10,
  },
  jobTitle: {
    fontSize: 12,
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
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  link: {
    fontSize: 10,
    lineHeight: 1.5,
  },
});

// CV Document Component
const CVDocument = ({ resume }: { resume: ResumeContent }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header / Personal Info */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {resume.contactInfo.firstName + " " + resume.contactInfo.lastName}
        </Text>
        <Text style={styles.title}>
          {resume.titles.find((t) => t.enabled)?.content}
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

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {resume.experiences
          .filter((e) => e.enabled)
          .map((experience, index) => (
            <View key={index} style={styles.experience}>
              {/* <Text style={styles.jobTitle}>{experience.role}</Text> */}
              <Text style={styles.jobTitle}>
                <SeperateList
                  data={[experience.role, experience.companyName]}
                />
              </Text>
              <Text style={styles.date}>
                <SeperateList
                  data={[
                    experience.location,
                    experience.type,
                    `${experience.startDate} - ${experience.endDate}`,
                  ]}
                />{" "}
              </Text>
              {experience.items
                .filter((e) => e.enabled)
                .map((item, index) => {
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
            </View>
          ))}
      </View>

      {/* Projects */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {resume.projects.map((prj, index) => (
          <View key={index} style={styles.experience}>
            <Text style={styles.jobTitle}>{prj.name}</Text>
            <Text style={styles.date}>
              {prj.startDate} - {prj.endDate}
            </Text>
            <Text style={styles.link}>{prj.link}</Text>
            <Text style={styles.description}>{prj.content}</Text>
          </View>
        ))}
      </View>

      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {resume.educations.map((edu, index) => (
          <View key={index} style={styles.experience}>
            <Text style={styles.jobTitle}>{edu.degree}</Text>
            <Text style={styles.company}>
              <SeperateList data={[edu.institution, edu.location]} />
            </Text>
            <Text style={styles.date}>Graduated: {edu.endDate}</Text>
          </View>
        ))}
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
    </Page>
  </Document>
);

// CV Preview Component with Download Button
const CVPreview = ({
  data,
  jobResume,
}: {
  data: ResumeContent;
  jobResume: JobResume;
}) => {
  // For client-side rendering only
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-96">
        Loading CV preview...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-screen">
        <PDFViewer showToolbar={false} className="w-full h-full">
          <CVDocument resume={data} />
        </PDFViewer>
      </div>
      <Button asChild>
        <PDFDownloadLink
          document={<CVDocument resume={data} />}
          fileName={`${(
            jobResume.name ||
            data.contactInfo.firstName + " " + data.contactInfo.lastName
          ).replace(/\s+/g, "_")}.pdf`}
        >
          {({ blob, url, loading, error }) =>
            loading ? "Generating PDF..." : "Download PDF"
          }
        </PDFDownloadLink>
      </Button>
    </div>
  );
};

export default CVPreview;

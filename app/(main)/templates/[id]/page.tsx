import { updateResumeTemplate } from "@/actions/resume-template";
import { ResumeBuilder } from "@/components/job-resumes/resume-builder";
import { ResumeBuilderProvider } from "@/components/job-resumes/resume-builder/context/ResumeBuilderProvider";
import { ImportExportBar } from "@/components/resume-templates/import-export-bar";
import { ResumeTemplateForm } from "@/components/resume-templates/resume-template-form";
import { db } from "@/lib/db";
import { ResumeContent } from "@/types/resume";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Template Builder",
};

export default async function TemplateBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const resumeTemplate = await db.resumeTemplate.findUnique({
    where: { id: params.id },
  });

  if (!resumeTemplate) return null;
  const content = resumeTemplate?.content as ResumeContent;

  return (
    <>
      <ResumeTemplateForm template={resumeTemplate} />
      <ResumeBuilderProvider
        initialResume={content}
        onUpdated={async (resumeContent: ResumeContent) => {
          "use server";

          await updateResumeTemplate({
            ...resumeTemplate,
            content: resumeContent,
          });
        }}
      >
        <ResumeBuilder />
      </ResumeBuilderProvider>

      <ImportExportBar resumeTemplate={resumeTemplate} />
    </>
  );
}

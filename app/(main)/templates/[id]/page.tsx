import { updateResumeTemplate } from "@/actions/resume-template";
import { ResumeBuilder } from "@/components/job-resumes/resume-builder";
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
      <ResumeBuilder
        data={content}
        onUpdate={async (resumeContent) => {
          "use server";

          await updateResumeTemplate({ ...resumeTemplate, content: resumeContent });
        }}
      />
    </>
  );
}

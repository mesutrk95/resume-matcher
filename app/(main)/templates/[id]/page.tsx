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
  const template = await db.resumeTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template) return null;
  const content = template?.content as ResumeContent;

  return (
    <>
      <ResumeTemplateForm template={template} />
      <ResumeBuilder data={content} />
    </>
  );
}

import ResumeTemplateBuilder from "@/app/_components/resume-builder";
import { db } from "@/lib/db";
import { TemplateContent } from "@/types/resume";
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
  const content = template?.content as TemplateContent;

  return (
    <ResumeTemplateBuilder
      data={{
        id: template.id,
        name: template.name,
        description: template.description || "",
        content: content,
      }}
    />
  );
}

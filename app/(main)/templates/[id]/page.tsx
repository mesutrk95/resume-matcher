import { db } from "@/lib/db";
import { TemplateContent } from "@/types/resume";
import { Metadata } from "next";
import { TemplateEditor } from "./template-editor";

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
    <TemplateEditor
      template={{
        id: template.id,
        name: template.name,
        description: template.description || "",
        content: content,
      }}
    />
  );
}

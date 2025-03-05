"use client";

import { createTemplate } from "@/api/templates";
import { ResumeTemplateEditor } from "@/app/_components/resume-template-editor";
import { Template } from "@/types/resume";
import { useRouter } from "next/navigation";
import React from "react";

export const TemplateCreator = ({ template }: { template: Template }) => {
  const router = useRouter();
  async function update(template: Template) {
    const newTemplate = await createTemplate(template);
    router.push("/templates/" + newTemplate.id);
  }
  return <ResumeTemplateEditor data={template} onUpdate={update} />;
};

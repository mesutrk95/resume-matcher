"use client";

import { updateTemplate } from "@/api/templates";
import { ResumeTemplateEditor } from "@/app/_components/resume-template-editor";
import { Template } from "@/types/resume";
import React from "react";

export const TemplateEditor = ({ template }: { template: Template }) => {
  async function update(template: Template) {
    await updateTemplate({
      id: template.id,
      name: template.name,
      description: template.description,
      content: template.content,
    });
  }
  return <ResumeTemplateEditor data={template} onUpdate={update} />;
};

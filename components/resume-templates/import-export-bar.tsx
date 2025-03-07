"use client";

import { ResumeTemplate } from "@prisma/client";
import React from "react";
import { Button } from "../ui/button";
import {
  getResumeTemplate,
  updateResumeTemplate,
} from "@/actions/resume-template";

export const ImportExportBar = ({
  resumeTemplate,
}: {
  resumeTemplate: ResumeTemplate;
}) => {
  const exportJson = async () => {
    const rt = await getResumeTemplate(resumeTemplate.id);
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(rt?.content)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `template_${resumeTemplate.name}.json`;

    link.click();
  };

  const importJson = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = JSON.parse(e.target?.result as string);
          await updateResumeTemplate({ ...resumeTemplate, content });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex gap-2 mt-5">
      <Button onClick={(e) => exportJson()}>Export as Json</Button>
      <Button onClick={(e) => importJson()}>Import Json</Button>
    </div>
  );
};

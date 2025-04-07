#!/usr/bin/env tsx

import { ResumeDocument } from "@/components/job-resumes/resume-renderer/resume-document";
import { DEFAULT_RESUME_DESIGN } from "@/schemas/resume-design.schema";
import { renderToFile } from "@react-pdf/renderer";
import React from "react";
import { getDirectoryFiles } from "./utils";
import * as fs from "fs";
import * as path from "path";
import { ResumeContent } from "@/types/resume";

async function pdf2png(pdfFilePath: string) {
  const { pdf } = await import("pdf-to-img");
  const document = await pdf(pdfFilePath, { scale: 1 });
  let counter = 1;
  for await (const image of document) {
    const imagePath = path.join(
      path.dirname(pdfFilePath),
      path.basename(pdfFilePath, path.extname(pdfFilePath)) + ".png"
    );
    await fs.writeFile(imagePath, image, () => {});
    counter++;
    break;
  }
}

async function processFile(filePath: string): Promise<void> {
  try {
    console.log(`Processing file: ${filePath}`);

    // Read file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Parse JSON to get the resume content
    const resumeContent: ResumeContent = JSON.parse(fileContent);

    // // Migrate the resume content
    // const migratedContent = migrateResumeContent(resumeContent);
    const basePath = path.join(__dirname, "../");
    const pdfFilePath = path.join(
      basePath,
      path.dirname(filePath),
      path.basename(filePath, path.extname(filePath)) + ".pdf"
    );
    await renderToFile(
      <ResumeDocument
        resume={resumeContent}
        resumeDesign={DEFAULT_RESUME_DESIGN}
      />,
      pdfFilePath
    );

    await pdf2png(pdfFilePath);

    console.log(`Successfully rendered pdf: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

(async () => {
  const targetPath = process.argv[2];
  if (!targetPath) {
    console.error("Please provide a file or directory path");
    process.exit(1);
  }

  const files = await getDirectoryFiles(targetPath, ".json");
  files.forEach(async (file) => {
    await processFile(file);
  });
})();

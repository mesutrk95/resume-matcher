#!/usr/bin/env tsx

import React from "react";
import * as fs from "fs";
import * as path from "path";
import { CATEGORIES } from "@/components/resume-templates/template-gallery/constants";
import { getAIJsonResponse } from "../lib/ai";
import { resumeContentSchema } from "@/schemas/resume";
import { zodSchemaToString } from "@/lib/zod";
import { shuffleResumeIds } from "@/utils/resume-migration";
require("dotenv").config();

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

(async () => {
  const titles = Object.values(CATEGORIES).flat();
  const systemInstructions = `You have to generate resume json example file for each job title based on the following schema format: \n ${zodSchemaToString(
    resumeContentSchema
  )} \n this is schema, you have to give me a valid object out of it, all dates must be in this format: MM/YYYY
   make sure your output is complete in json format without any extra character!`;

  for (const title of titles) {
    // Get the directory path from the output file path
    const outputPath = path.join(__dirname, "../public", title.url);
    const outputDir = path.dirname(outputPath);
    
    console.log(`checking ${outputPath}...`);
    
    // Ensure the directory exists before attempting to write the file
    ensureDirectoryExists(outputDir);
    
    if (!fs.existsSync(outputPath)) {
      console.log(`getting AI result ${outputPath}...`);
      const { result } = await getAIJsonResponse(
        `Job Title : ${title.label}`,
        [],
        systemInstructions
      );
      fs.writeFileSync(
        outputPath,
        JSON.stringify(shuffleResumeIds(result), null, 2)
      );
    }
  }
})();
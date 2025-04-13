#!/usr/bin/env ts-node
import { ResumeContent } from '@/types/resume';
import { migrateResumeContent } from '@/utils/resume-migration';
import * as fs from 'fs';
import { getDirectoryFiles } from './utils';

async function processFile(filePath: string): Promise<void> {
  try {
    console.log(`Processing file: ${filePath}`);

    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse JSON to get the resume content
    const resumeContent: ResumeContent = JSON.parse(fileContent);

    // Migrate the resume content
    const migratedContent = migrateResumeContent(resumeContent);

    // Write the migrated content back to the file
    fs.writeFileSync(filePath, JSON.stringify(migratedContent, null, 2));

    console.log(`Successfully migrated: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

async function main(): Promise<void> {
  const targetPath = process.argv[2];

  if (!targetPath) {
    console.error('Please provide a file or directory path');
    process.exit(1);
  }

  const files = await getDirectoryFiles(targetPath, '.json');
  files.forEach(async file => {
    try {
      await processFile(file);
    } catch (error) {
      console.error('Error during migration:', file, error);
    }
  });

  console.log('Migration completed successfully');
}

// Execute the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

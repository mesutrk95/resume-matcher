#!/usr/bin/env ts-node
import { ResumeContent } from '@/types/resume';
import { migrateResumeContent } from '@/utils/resume-migration';
import * as fs from 'fs';
import * as path from 'path'; 
/**
 * Process a single resume file
 * @param filePath Path to the resume file
 */
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

/**
 * Process all resume files in a directory
 * @param dirPath Path to the directory containing resume files
 */
async function processDirectory(dirPath: string): Promise<void> {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        // Process JSON files (assuming resumes are in JSON format)
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
  }
}

/**
 * Main function to start the migration process
 */
async function main(): Promise<void> {
  const targetPath = process.argv[2];
  
  if (!targetPath) {
    console.error('Please provide a file or directory path');
    process.exit(1);
  }
  
  try {
    const stats = fs.statSync(targetPath);
    
    if (stats.isDirectory()) {
      console.log(`Processing directory: ${targetPath}`);
      await processDirectory(targetPath);
    } else if (stats.isFile()) {
      await processFile(targetPath);
    } else {
      console.error(`The provided path is neither a file nor a directory: ${targetPath}`);
      process.exit(1);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
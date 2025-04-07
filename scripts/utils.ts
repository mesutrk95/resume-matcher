#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";

export async function getDirectoryFiles(targetPath: string, ext?: string) {
  const files = [];

  async function processDirectory(dirPath: string): Promise<void> {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await processDirectory(fullPath);
        } else if (
          entry.isFile() &&
          (!ext || (ext && entry.name.endsWith(ext)))
        ) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dirPath}:`, error);
    }
  }

  const stats = fs.statSync(targetPath);

  if (stats.isDirectory()) {
    console.log(`Processing directory: ${targetPath}`);
    await processDirectory(targetPath);
  } else if (stats.isFile()) {
    files.push(targetPath);
  }

  return files;
}

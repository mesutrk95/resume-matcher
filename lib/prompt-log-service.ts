import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs', 'prompts');

export const savePrompt = async (data: any): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  // Ensure the log directory exists
  await fs.promises.mkdir(LOG_DIR, { recursive: true });

  const timestamp = new Date().toISOString();
  //   .replace(/[:.]/g, '-')
  const filename = `${timestamp}.json`;
  const filePath = path.join(LOG_DIR, filename);

  const content = JSON.stringify(data, null, 2);

  await fs.promises.writeFile(filePath, content, 'utf8');
};

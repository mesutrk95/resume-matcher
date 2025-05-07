import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

export const saveStuff = async (folder: string, data: any): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  const logDir = path.join(LOG_DIR, folder);
  // Ensure the log directory exists
  await fs.promises.mkdir(logDir, { recursive: true });

  const timestamp = new Date().toISOString();
  //   .replace(/[:.]/g, '-')
  const filename = `${timestamp}.json`;
  const filePath = path.join(logDir, filename);

  const content = JSON.stringify(data, null, 2);

  await fs.promises.writeFile(filePath, content, 'utf8');
};

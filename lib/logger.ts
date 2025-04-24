import winston from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';
import { getCurrentRequestId, getRequestContext } from './request-context';

// Get configuration from environment variables
const env = process.env.NODE_ENV || 'development';
const configuredLogLevel = process.env.LOG_LEVEL || (env === 'development' ? 'debug' : 'warn');
const shouldLogToFile = process.env.LOG_TO_FILE === 'true' || env === 'development';
const logDir = process.env.LOG_DIR || 'logs';

// Ensure logs directory exists if we're logging to file
if (shouldLogToFile && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Get the log level based on configuration
const level = () => {
  return configuredLogLevel;
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Add request ID automatically to the logger format
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  // Get requestId from AsyncLocalStorage context
  const context = getRequestContext();
  const reqId = context?.requestId || 'N/A'; // Use 'N/A' or another placeholder if no request ID is found

  // Build the log message
  let logMessage = `${timestamp} [${reqId}] ${level}: ${message}`;

  // Add metadata if it exists and is not empty
  if (metadata && Object.keys(metadata).length > 0) {
    logMessage += ` ${JSON.stringify(metadata)}`;
  }

  return logMessage;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  logFormat,
);

// Define the format for file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  logFormat,
);

// Define transports based on environment
const getTransports = () => {
  const transports: any = [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ];

  if (shouldLogToFile) {
    transports.push(
      new winston.transports.DailyRotateFile({
        dirname: logDir,
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
        level: configuredLogLevel,
      }),
    );

    // Add separate error log file
    transports.push(
      new winston.transports.DailyRotateFile({
        dirname: logDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
        level: 'error', // Only log errors
      }),
    );
  }

  return transports;
};

// Create the logger
const Logger = winston.createLogger({
  level: level(),
  levels,
  transports: getTransports(),
});

// No need for helper functions with requestId since we automatically get it now
export default Logger;

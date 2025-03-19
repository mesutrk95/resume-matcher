import winston from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';

// Get configuration from environment variables
const env = process.env.NODE_ENV || 'development';
const configuredLogLevel =
  process.env.LOG_LEVEL || (env === 'development' ? 'debug' : 'warn');
const shouldLogToFile =
  process.env.LOG_TO_FILE === 'true' || env === 'development';
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

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define the format for file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
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

  // In production, we could add other transports later (like database logging)
  // if (env === 'production') {
  //   // Add database logging example:
  //   // transports.push(new winston.transports.MongoDB({
  //   //   db: process.env.MONGODB_URI,
  //   //   options: { useNewUrlParser: true, useUnifiedTopology: true },
  //   //   collection: 'logs',
  //   //   level: 'error',
  //   // }));
  // }

  return transports;
};

// Create the logger
const Logger = winston.createLogger({
  level: level(),
  levels,
  transports: getTransports(),
});

export default Logger;

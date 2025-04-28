export const REQUEST_ID_HEADER = 'X-Request-ID';

export const AI = {
  SYSTEM_CONTEXT: `You are a helpful assistant for a resume building application.
Your goal is to help users optimize their resumes for job applications.
Always be precise, factual, and helpful.`,
  MAX_RETRIES: 2,
  DEFAULT_RATE_LIMITS: {
    REQUESTS_PER_MINUTE: 5,
    REQUESTS_PER_HOUR: 100,
    REQUESTS_PER_DAY: 1000,
  },
  TOKEN_LIMITS: {
    FREE: 100_000,
    BASIC: 3_000_000,
    DEV: Number.MAX_SAFE_INTEGER,
  },
};

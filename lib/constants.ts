export const REQUEST_ID_HEADER = 'X-Request-ID';

export const AI = {
  SYSTEM_CONTEXT: `You are a helpful assistant for a resume building application.
Your goal is to help users optimize their resumes for job applications.
Always be precise, factual, and helpful.`,
  MAX_RETRIES: 2,
  DEFAULT_RATE_LIMITS: {
    REQUESTS_PER_MINUTE: 10,
    REQUESTS_PER_HOUR: 400,
    REQUESTS_PER_DAY: 3000,
  },
  TOKEN_LIMITS: {
    FREE: 100_000,
    BASIC: 2_000_000,
    DEV: Number.MAX_SAFE_INTEGER,
  },
};

export const EMAIL_CONSTANTS = {
  // Social media links
  FACEBOOK_URL: 'https://facebook.com/minovaai',
  TWITTER_URL: 'https://twitter.com/minovaai',
  LINKEDIN_URL: 'https://linkedin.com/company/minovaai',
  INSTAGRAM_URL: 'https://instagram.com/minovaai',

  // Contact information
  COMPANY_ADDRESS: 'Minova AI, Inc.',
};

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

  REASONS: {
    GENERAL: 'GENERAL',
    CAREER_PROFILE_FROM_PDF: 'CAREER_PROFILE_FROM_PDF',
    JOB_SUMMARY: 'JOB_SUMMARY',
    CUSTOM_QUESTION: 'CUSTOM_QUESTION',
    RESUME_ANALYZE_EXPERIENCES: 'RESUME_ANALYZE_EXPERIENCES',
    RESUME_ANALYZE_SKILLS: 'RESUME_ANALYZE_SKILLS',
    SCORE_RESUME: 'SCORE_RESUME',
    MATCH_KEYWORDS_RESUME: 'MATCH_KEYWORDS_RESUME',
    SCORE_RESUME_EXPERIENCES: 'SCORE_RESUME_EXPERIENCES',
    SCORE_RESUME_PROJECTS: 'SCORE_RESUME_PROJECTS',
  },
};

export const EMAIL_CONSTANTS = {
  // Social media links
  FACEBOOK_URL: 'https://facebook.com/minovaai',
  TWITTER_URL: 'https://x.com/MinovaAI',
  LINKEDIN_URL: 'https://www.linkedin.com/company/minova-ai',
  INSTAGRAM_URL: 'https://www.instagram.com/minovaai',
  YOUTUBE_URL: 'https://www.youtube.com/@MinovaAI',
  TIKTOK_URL: 'https://www.tiktok.com/@minovaai',

  // Contact information
  COMPANY_ADDRESS: 'Minova AI, Inc.',
};

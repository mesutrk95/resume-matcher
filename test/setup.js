// Load environment variables from .env file
require('dotenv').config();

// Override specific environment variables for testing
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';
// GEMINI_API_KEY will be loaded from .env file

console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();

process.env.GEMINI_API_KEY = 'test_gemini_api_key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();

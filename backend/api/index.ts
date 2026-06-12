// Vercel serverless entry point
// Re-export the Express app from src/index.ts
// Vercel will handle the HTTP event loop
export { default } from '../src/index';

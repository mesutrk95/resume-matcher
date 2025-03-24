// lib/ai/promptProcessors/index.ts
export * from './base';
export * from './textPromptProcessor';
export * from './jsonPromptProcessor';
export * from './htmlPromptProcessor';

// Factory method to create a standard set of prompt processors
export function createStandardPromptProcessors(systemContext: string = '') {
  // Import all necessary processors
  const {
    TextPromptProcessor,
    JsonPromptProcessor,
    HtmlPromptProcessor,
  } = require('./');

  // Return processors in order of precedence (more specific first)
  return [
    new JsonPromptProcessor(systemContext),
    new HtmlPromptProcessor(systemContext),
    new TextPromptProcessor(systemContext),
  ];
}

export * from './base';
export * from './textResponseProcessor';
export * from './jsonResponseProcessor';
export * from './htmlResponseProcessor';

// Factory method to create a standard set of response processors
export function createStandardResponseProcessors() {
  // Import all necessary processors
  const {
    JsonResponseProcessor,
    HtmlResponseProcessor,
    TextResponseProcessor,
  } = require('./');

  // Return processors in order of precedence (more specific first)
  return [
    new JsonResponseProcessor(),
    new HtmlResponseProcessor(),
    new TextResponseProcessor(),
  ];
}

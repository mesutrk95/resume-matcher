export * from '@/lib/ai/responseProcessors/base';
export * from '@/lib/ai/responseProcessors/textResponseProcessor';
export * from '@/lib/ai/responseProcessors/jsonResponseProcessor';
export * from '@/lib/ai/responseProcessors/htmlResponseProcessor';

import { JsonResponseProcessor } from '@/lib/ai/responseProcessors/jsonResponseProcessor';
import { HtmlResponseProcessor } from '@/lib/ai/responseProcessors/htmlResponseProcessor';
import { TextResponseProcessor } from '@/lib/ai/responseProcessors/textResponseProcessor';

export function createStandardResponseProcessors() {
  // Return processors in order of precedence (more specific first)
  return [new JsonResponseProcessor(), new HtmlResponseProcessor(), new TextResponseProcessor()];
}

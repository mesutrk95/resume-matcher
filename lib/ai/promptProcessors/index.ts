// lib/ai/promptProcessors/index.ts
export * from '@/lib/ai/promptProcessors/base';
export * from '@/lib/ai/promptProcessors/textPromptProcessor';
export * from '@/lib/ai/promptProcessors/jsonPromptProcessor';
export * from '@/lib/ai/promptProcessors/htmlPromptProcessor';

import { TextPromptProcessor } from '@/lib/ai/promptProcessors/textPromptProcessor';
import { JsonPromptProcessor } from '@/lib/ai/promptProcessors/jsonPromptProcessor';
import { HtmlPromptProcessor } from '@/lib/ai/promptProcessors/htmlPromptProcessor';

export function createStandardPromptProcessors(systemContext: string = '') {
  return [
    new JsonPromptProcessor(systemContext),
    new HtmlPromptProcessor(systemContext),
    new TextPromptProcessor(systemContext),
  ];
}

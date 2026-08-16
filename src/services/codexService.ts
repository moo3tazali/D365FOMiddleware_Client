import { puter } from '@heyputer/puter.js';
import axios from 'axios';

export type CodexModel =
  | 'openai/gpt-5.3-codex'
  | 'openai/gpt-5.2-codex'
  | 'openai/gpt-5.1-codex'
  | 'openai/gpt-5.1-codex-mini'
  | 'openai/gpt-5.1-codex-max'
  | 'openai/gpt-5-codex';

export interface CodexOptions {
  model?: CodexModel;
  viaBackend?: boolean;
}

/**
 * Sends a code generation or chat prompt to OpenAI Codex via Puter.js directly
 */
export async function promptCodex(
  prompt: string,
  options: CodexOptions = {}
): Promise<string> {
  if (options.viaBackend) {
    return promptCodexViaBackend(prompt, options.model);
  }

  const model = options.model || 'openai/gpt-5.3-codex';
  try {
    const response = await puter.ai.chat(prompt, { model });
    return typeof response === 'string'
      ? response
      : JSON.stringify(response, null, 2);
  } catch (error) {
    console.error('Error calling Puter Codex API directly:', error);
    throw error;
  }
}

/**
 * Sends a prompt to the NestJS backend endpoint (/api/codex/chat)
 */
export async function promptCodexViaBackend(
  prompt: string,
  model?: CodexModel
): Promise<string> {
  try {
    const res = await axios.post('/api/codex/chat', {
      prompt,
      model: model || 'openai/gpt-5.3-codex',
    });
    if (res.data?.success) {
      return res.data.result;
    }
    throw new Error(res.data?.error || 'Backend Codex processing failed');
  } catch (error) {
    console.error('Error calling Codex via backend API:', error);
    throw error;
  }
}

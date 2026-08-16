import { useState, useCallback } from 'react';
import { promptCodex } from '../services/codexService';
import type { CodexOptions } from '../services/codexService';

export function useCodex() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const generateCode = useCallback(
    async (prompt: string, options?: CodexOptions) => {
      setLoading(true);
      setError(null);
      try {
        const result = await promptCodex(prompt, options);
        setResponse(result);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    generateCode,
    loading,
    error,
    response,
  };
}

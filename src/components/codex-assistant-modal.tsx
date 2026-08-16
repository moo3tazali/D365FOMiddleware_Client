import { useState } from 'react';
import { Bot, Sparkles, Send, Loader2, Code, Terminal, X } from 'lucide-react';
import { useCodex } from '@/hooks/useCodex';
import type { CodexModel } from '@/services/codexService';

const AVAILABLE_MODELS: { label: string; value: CodexModel }[] = [
  { label: 'GPT 5.3 Codex (Default)', value: 'openai/gpt-5.3-codex' },
  { label: 'GPT 5.1 Codex Max', value: 'openai/gpt-5.1-codex-max' },
  { label: 'GPT 5.1 Codex Mini', value: 'openai/gpt-5.1-codex-mini' },
  { label: 'GPT 5.2 Codex', value: 'openai/gpt-5.2-codex' },
  { label: 'GPT 5.1 Codex', value: 'openai/gpt-5.1-codex' },
];

export function CodexAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<CodexModel>('openai/gpt-5.3-codex');
  const [viaBackend, setViaBackend] = useState(false);
  const { generateCode, loading, response, error } = useCodex();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    try {
      await generateCode(prompt, { model: selectedModel, viaBackend });
    } catch {
      // Error handled by hook
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md hover:opacity-95 transition-all cursor-pointer'
        title='Open Puter Codex AI Assistant'
      >
        <Sparkles className='w-3.5 h-3.5 animate-pulse' />
        <span>Codex AI</span>
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-card border border-border rounded-xl shadow-2xl overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30'>
              <div className='flex items-center gap-2.5'>
                <div className='p-2 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'>
                  <Bot className='w-5 h-5' />
                </div>
                <div>
                  <h3 className='font-semibold text-foreground text-sm flex items-center gap-2'>
                    Puter Codex Assistant
                    <span className='px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                      Free API
                    </span>
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    Powered by OpenAI Codex via Puter.js (User-Pays Model)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Body / Content */}
            <div className='flex-1 overflow-y-auto p-5 space-y-4'>
              {/* Model selection bar */}
              <div className='flex items-center justify-between text-xs gap-2 flex-wrap'>
                <div className='flex items-center gap-2'>
                  <label className='text-muted-foreground font-medium flex items-center gap-1.5'>
                    <Terminal className='w-3.5 h-3.5' /> Model:
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as CodexModel)}
                    className='bg-background border border-input rounded-md px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  >
                    {AVAILABLE_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className='flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors'>
                  <input
                    type='checkbox'
                    checked={viaBackend}
                    onChange={(e) => setViaBackend(e.target.checked)}
                    className='rounded border-input text-primary focus:ring-primary'
                  />
                  <span>Send via NestJS Backend API (`/api/codex/chat`)</span>
                </label>
              </div>

              {/* Output Result area */}
              {response && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                    <Code className='w-3.5 h-3.5' /> Generated Output:
                  </div>
                  <pre className='p-4 text-xs font-mono rounded-lg bg-zinc-950 text-zinc-100 overflow-x-auto border border-zinc-800 whitespace-pre-wrap'>
                    {response}
                  </pre>
                </div>
              )}

              {error && (
                <div className='p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20'>
                  {error.message}
                </div>
              )}

              {!response && !error && !loading && (
                <div className='py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg border-border'>
                  Ask Codex to generate code, refactor logic, or write D365 transformations.
                </div>
              )}
            </div>

            {/* Prompt Form */}
            <form onSubmit={handleSubmit} className='p-4 border-t border-border bg-muted/20 flex gap-2'>
              <input
                type='text'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. Write a TypeScript helper to validate D365 journal line payload...'
                className='flex-1 px-3 py-2 text-xs rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
              />
              <button
                type='submit'
                disabled={loading || !prompt.trim()}
                className='flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer'
              >
                {loading ? (
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                ) : (
                  <Send className='w-3.5 h-3.5' />
                )}
                <span>{loading ? 'Thinking...' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

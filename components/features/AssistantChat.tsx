'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CitedFlags } from '@/components/features/CitedFlags';
import { useAssistant } from '@/hooks/useAssistant';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import {
  Sparkles,
  Send,
  Trash2,
  Loader2,
  AlertCircle,
  Bot,
  User,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';

const SUGGESTED_QUERIES = [
  'Which flags are currently disabled in production?',
  'Summarize the last 5 flag changes',
  'List all boolean flags and their status',
  'Which flags were recently created?',
];

export function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexStatus, setReindexStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { project } = useAuth();
  const { messages, isLoading, error, sendMessage, clearHistory } = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear reindex status after 4 seconds
  useEffect(() => {
    if (reindexStatus) {
      const timer = setTimeout(() => setReindexStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [reindexStatus]);

  const handleReindex = useCallback(async () => {
    if (!project || isReindexing) return;
    setIsReindexing(true);
    setReindexStatus(null);
    try {
      const res = await api.reindexAssistant(project.id);
      if (res.success && res.data) {
        setReindexStatus({
          type: 'success',
          message: `Indexing ${res.data.flags_queued} flag${res.data.flags_queued !== 1 ? 's' : ''}…`,
        });
      } else {
        setReindexStatus({ type: 'error', message: res.error || 'Reindex failed' });
      }
    } catch {
      setReindexStatus({ type: 'error', message: 'Failed to start reindexing' });
    } finally {
      setIsReindexing(false);
    }
  }, [project, isReindexing]);

  const handleSubmit = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || isLoading) return;
      setInput('');
      await sendMessage(trimmed);
    },
    [isLoading, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 bg-primary text-zinc-950 rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
        title="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[680px] p-0 gap-0 overflow-hidden border-border/50
                   bg-background/95 backdrop-blur-xl shadow-2xl
                   data-[state=open]:animate-in data-[state=open]:fade-in-0
                   data-[state=open]:slide-in-from-bottom-2"
      >
        <DialogTitle className="sr-only">AI Flag Assistant</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Flag Assistant</h3>
              <p className="text-[11px] text-muted-foreground">
                {project ? `Project: ${project.name}` : 'No project selected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Reindex Status Toast */}
            {reindexStatus && (
              <span className={`text-[11px] flex items-center gap-1 px-2 py-1 rounded-md ${
                reindexStatus.type === 'success'
                  ? 'text-emerald-600 bg-emerald-500/10'
                  : 'text-destructive bg-destructive/10'
              }`}>
                {reindexStatus.type === 'success' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {reindexStatus.message}
              </span>
            )}
            {/* Reindex Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={handleReindex}
              disabled={!project || isReindexing}
              title="Index your flags for AI search"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isReindexing ? 'animate-spin' : ''}`} />
              {isReindexing ? 'Indexing…' : 'Reindex'}
            </Button>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={clearHistory}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Kbd>Esc</Kbd>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="h-[420px]" ref={scrollRef}>
          <div className="px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              /* Empty State with Suggested Queries */
              <div className="flex flex-col items-center justify-center h-[340px] text-center">
                <div className="h-14 w-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4 shadow-sm">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1">Ask about your flags</h3>
                <p className="text-sm text-muted-foreground mb-2 max-w-sm">
                  Get insights about feature flags, rollout status, and configuration using natural language.
                </p>
                <p className="text-xs text-muted-foreground/70 mb-6 flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3" />
                  First time? Click <strong>Reindex</strong> above to index your flags.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {SUGGESTED_QUERIES.map((query) => (
                    <button
                      key={query}
                      className="text-left text-xs px-3 py-2.5 rounded-lg border border-border/60
                                 bg-card hover:bg-accent hover:border-primary/30
                                 transition-all duration-150 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSubmit(query)}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded border px-3.5 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-zinc-800 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 border-transparent'
                        : msg.error
                        ? 'bg-destructive/10 border-destructive/20 text-destructive'
                        : 'bg-transparent border-border/50 font-mono text-[13px] leading-relaxed'
                    }`}
                  >
                    {msg.error ? (
                      <div className="flex items-start gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{msg.content}</span>
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <div className="assistant-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-4 bg-foreground/70 animate-pulse ml-0.5 align-middle rounded-sm" />
                        )}
                        {!msg.isStreaming && msg.sources && (
                          <CitedFlags sources={msg.sources} />
                        )}
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t px-4 py-3 bg-muted/20">
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive mb-2">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                project
                  ? 'Ask about your flags...'
                  : 'Select a project to start asking questions'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!project || isLoading}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60
                         focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleSubmit(input)}
              disabled={!input.trim() || isLoading || !project}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

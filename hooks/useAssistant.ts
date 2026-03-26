'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import type {
  ChatMessage,
  SourceFlag,
  AssistantErrorCode,
  ASSISTANT_ERROR_MESSAGES,
} from '@/lib/types';
import { ASSISTANT_ERROR_MESSAGES as ERROR_MESSAGES } from '@/lib/types';

// Characters revealed per frame during simulated streaming (~60fps → ~50 chars/sec)
const CHARS_PER_FRAME = 2;

let messageIdCounter = 0;
function nextMessageId(): string {
  return `msg_${Date.now()}_${++messageIdCounter}`;
}

interface UseAssistantReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (query: string) => Promise<void>;
  clearHistory: () => void;
}

export function useAssistant(): UseAssistantReturn {
  const { project } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingRef = useRef<number | null>(null);

  /** Map API error codes to user-friendly messages */
  const mapError = useCallback((errorMsg: string, errorCode?: string): string => {
    if (errorCode && errorCode in ERROR_MESSAGES) {
      return ERROR_MESSAGES[errorCode as AssistantErrorCode];
    }
    return errorMsg || 'An unexpected error occurred. Please try again.';
  }, []);

  /** Simulated streaming: reveal answer letter-by-letter via rAF */
  const streamResponse = useCallback(
    (
      assistantMsgId: string,
      fullAnswer: string,
      sources: SourceFlag[]
    ): Promise<void> => {
      return new Promise((resolve) => {
        let charIndex = 0;

        const reveal = () => {
          charIndex = Math.min(charIndex + CHARS_PER_FRAME, fullAnswer.length);
          const isComplete = charIndex >= fullAnswer.length;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: fullAnswer.slice(0, charIndex),
                    isStreaming: !isComplete,
                    sources: isComplete ? sources : undefined,
                  }
                : m
            )
          );

          if (isComplete) {
            streamingRef.current = null;
            resolve();
          } else {
            streamingRef.current = requestAnimationFrame(reveal);
          }
        };

        streamingRef.current = requestAnimationFrame(reveal);
      });
    },
    []
  );

  const sendMessage = useCallback(
    async (query: string): Promise<void> => {
      if (!project) {
        setError('No project selected. Please select a project first.');
        return;
      }
      if (isLoading) return;

      // Cancel any in-progress streaming
      if (streamingRef.current) {
        cancelAnimationFrame(streamingRef.current);
        streamingRef.current = null;
      }

      setError(null);
      setIsLoading(true);

      // Add user message
      const userMsg: ChatMessage = {
        id: nextMessageId(),
        role: 'user',
        content: query,
        timestamp: Date.now(),
      };

      // Add placeholder assistant message
      const assistantMsgId = nextMessageId();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      try {
        const response = await api.queryAssistant(project.id, query);

        if (response.success && response.data) {
          await streamResponse(
            assistantMsgId,
            response.data.answer,
            response.data.sources
          );
        } else {
          const friendlyError = mapError(
            response.error || 'Request failed',
            response.errorCode
          );
          // Replace placeholder with error message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: friendlyError, isStreaming: false, error: friendlyError }
                : m
            )
          );
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: errorMsg, isStreaming: false, error: errorMsg }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [project, isLoading, mapError, streamResponse]
  );

  const clearHistory = useCallback(() => {
    if (streamingRef.current) {
      cancelAnimationFrame(streamingRef.current);
      streamingRef.current = null;
    }
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, error, sendMessage, clearHistory };
}

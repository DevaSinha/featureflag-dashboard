'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import type { FeatureFlag, CreateFlagPayload } from '@/lib/types';

interface UseFlagsReturn {
  flags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  fetchFlags: () => Promise<void>;
  createFlag: (data: CreateFlagPayload) => Promise<boolean>;
  toggleFlag: (flagId: string) => Promise<void>;
  deleteFlag: (flagId: string) => Promise<boolean>;
}

export function useFlags(): UseFlagsReturn {
  const { project } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    if (!project) {
      setFlags([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const response = await api.getFlags(project.id);
    if (response.success && response.data) {
      setFlags(response.data);
    } else {
      setError(response.error || 'Failed to fetch flags');
    }
    setIsLoading(false);
  }, [project]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const createFlag = useCallback(
    async (data: CreateFlagPayload): Promise<boolean> => {
      if (!project) return false;
      const response = await api.createFlag(project.id, data);
      if (response.success) {
        await fetchFlags();
        return true;
      }
      setError(response.error || 'Failed to create flag');
      return false;
    },
    [project, fetchFlags]
  );

  /** Optimistic toggle: update UI immediately, rollback on failure */
  const toggleFlag = useCallback(
    async (flagId: string): Promise<void> => {
      // Capture previous state for rollback
      const previousFlags = flags;

      // Optimistic update
      setFlags((prev) =>
        prev.map((f) => (f.id === flagId ? { ...f, enabled: !f.enabled } : f))
      );

      const response = await api.toggleFlag(flagId);
      if (!response.success) {
        // Rollback on failure
        setFlags(previousFlags);
        setError(response.error || 'Failed to toggle flag');
      }
    },
    [flags]
  );

  const deleteFlag = useCallback(
    async (flagId: string): Promise<boolean> => {
      const response = await api.deleteFlag(flagId);
      if (response.success) {
        setFlags((prev) => prev.filter((f) => f.id !== flagId));
        return true;
      }
      setError(response.error || 'Failed to delete flag');
      return false;
    },
    []
  );

  const sortedFlags = useMemo(
    () => [...flags].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [flags]
  );

  return {
    flags: sortedFlags,
    isLoading,
    error,
    fetchFlags,
    createFlag,
    toggleFlag,
    deleteFlag,
  };
}

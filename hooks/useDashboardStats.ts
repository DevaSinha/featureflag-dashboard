'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface DashboardStats {
  flags: number;
  experiments: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  isLoading: boolean;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const { project } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ flags: 0, experiments: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!project) {
      setStats({ flags: 0, experiments: 0 });
      return;
    }
    setIsLoading(true);
    const [flagsRes, expsRes] = await Promise.all([
      api.getFlags(project.id),
      api.getExperiments(project.id),
    ]);
    setStats({
      flags: flagsRes.data?.length || 0,
      experiments: expsRes.data?.length || 0,
    });
    setIsLoading(false);
  }, [project]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading };
}

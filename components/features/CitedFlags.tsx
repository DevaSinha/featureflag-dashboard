'use client';

import Link from 'next/link';
import { Flag } from 'lucide-react';
import type { SourceFlag } from '@/lib/types';

interface CitedFlagsProps {
  sources: SourceFlag[];
}

export function CitedFlags({ sources }: CitedFlagsProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <Flag className="h-3 w-3" />
        Cited Flags
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source) => (
          <Link
            key={source.flag_id}
            href={`/dashboard/flags?highlight=${source.flag_id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                       bg-primary/10 text-primary hover:bg-primary/20 transition-colors
                       border border-primary/20 hover:border-primary/30"
          >
            <span className="truncate max-w-[120px]">{source.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {Math.round(source.similarity * 100)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

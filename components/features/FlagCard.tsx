'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { FeatureFlag } from '@/lib/types';

interface FlagCardProps {
  flag: FeatureFlag;
  onToggle: (flagId: string) => void;
  onDelete: (flagId: string) => void;
}

function FlagCardComponent({ flag, onToggle, onDelete }: FlagCardProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this flag?')) {
      onDelete(flag.id);
    }
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-md border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-card rounded-xl">
      <CardContent className="flex flex-col p-5 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate tracking-tight">{flag.name}</h3>
            <p className="font-mono text-xs text-muted-foreground mt-1 truncate">
              {flag.key}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 rounded bg-transparent border-zinc-200 dark:border-zinc-800 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {flag.type}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {flag.description || 'No description'}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <Switch
              checked={flag.enabled}
              onCheckedChange={() => onToggle(flag.id)}
              className="data-[state=checked]:bg-primary h-5 w-9 [&_span]:h-4 [&_span]:w-4 [&_span]:data-[state=checked]:translate-x-4"
            />
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${flag.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
              {flag.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-all rounded-md"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const FlagCard = React.memo(FlagCardComponent);

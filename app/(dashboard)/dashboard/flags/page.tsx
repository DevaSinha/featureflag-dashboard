"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useFlags } from "@/hooks/useFlags";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { FlagCard } from "@/components/features/FlagCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag, Plus, Loader2, RefreshCw } from "lucide-react";
import type { FlagType, CreateFlagPayload } from "@/lib/types";

const EMPTY_FLAG: CreateFlagPayload = {
  key: "",
  name: "",
  description: "",
  type: "BOOLEAN",
  default_value: false,
  enabled: true,
};

export default function FlagsPage() {
  const { project } = useAuth();
  const { flags, isLoading, fetchFlags, createFlag, toggleFlag, deleteFlag } = useFlags();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFlag, setNewFlag] = useState<CreateFlagPayload>({ ...EMPTY_FLAG });

  const handleCreateFlag = useCallback(async () => {
    setCreating(true);
    const success = await createFlag(newFlag);
    if (success) {
      setDialogOpen(false);
      setNewFlag({ ...EMPTY_FLAG });
    }
    setCreating(false);
  }, [createFlag, newFlag]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Flag className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
        <p className="text-muted-foreground max-w-md">
          Please select a project from the dropdown above to manage its feature flags.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Flag className="h-8 w-8" />
            Feature Flags
          </h2>
          <p className="text-muted-foreground">
            Manage feature flags for {project.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchFlags}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Feature Flag</DialogTitle>
                <DialogDescription>
                  Create a new feature flag to control feature rollouts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Flag Key</Label>
                  <Input
                    id="key"
                    placeholder="dark_mode"
                    value={newFlag.key}
                    onChange={(e) =>
                      setNewFlag({ ...newFlag, key: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    placeholder="Dark Mode"
                    value={newFlag.name}
                    onChange={(e) =>
                      setNewFlag({ ...newFlag, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enable dark theme for users"
                    value={newFlag.description || ""}
                    onChange={(e) =>
                      setNewFlag({ ...newFlag, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newFlag.type}
                    onValueChange={(value: FlagType) =>
                      setNewFlag({ ...newFlag, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOOLEAN">Boolean</SelectItem>
                      <SelectItem value="MULTIVARIATE">Multivariate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={newFlag.enabled}
                    onCheckedChange={(checked) =>
                      setNewFlag({ ...newFlag, enabled: checked })
                    }
                  />
                  <Label htmlFor="enabled">Enabled by default</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFlag} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Flag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        /* Skeleton loading state */
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-zinc-200 dark:border-zinc-800 rounded-xl">
              <CardContent className="flex flex-col p-5 gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <Skeleton className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : flags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Flag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No flags yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first feature flag to get started.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {flags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onToggle={toggleFlag}
              onDelete={deleteFlag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Flag, Plus, Loader2, RefreshCw, Trash2 } from "lucide-react";

interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string;
    type: string;
    enabled: boolean;
    default_value: any;
    created_at: string;
}

export default function FlagsPage() {
    const { project } = useAuth();
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newFlag, setNewFlag] = useState({
        key: "",
        name: "",
        description: "",
        type: "BOOLEAN" as "BOOLEAN" | "MULTIVARIATE",
        default_value: false,
        enabled: true,
    });

    const fetchFlags = async () => {
        if (!project) return;
        setLoading(true);
        const response = await api.getFlags(project.id);
        if (response.success && response.data) {
            setFlags(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFlags();
    }, [project]);

    const handleCreateFlag = async () => {
        if (!project) return;
        setCreating(true);
        const response = await api.createFlag(project.id, newFlag);
        if (response.success) {
            setDialogOpen(false);
            setNewFlag({
                key: "",
                name: "",
                description: "",
                type: "BOOLEAN",
                default_value: false,
                enabled: true,
            });
            fetchFlags();
        }
        setCreating(false);
    };

    const handleToggle = async (flagId: string) => {
        const response = await api.toggleFlag(flagId);
        if (response.success) {
            fetchFlags();
        }
    };

    const handleDelete = async (flagId: string) => {
        if (!confirm("Are you sure you want to delete this flag?")) return;
        const response = await api.deleteFlag(flagId);
        if (response.success) {
            fetchFlags();
        }
    };

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
                                        value={newFlag.description}
                                        onChange={(e) =>
                                            setNewFlag({ ...newFlag, description: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={newFlag.type}
                                        onValueChange={(value: "BOOLEAN" | "MULTIVARIATE") =>
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

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                <div className="grid gap-4">
                    {flags.map((flag) => (
                        <Card key={flag.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold">{flag.name}</h3>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {flag.key}
                                        </Badge>
                                        <Badge variant={flag.type === "BOOLEAN" ? "default" : "secondary"}>
                                            {flag.type}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {flag.description || "No description"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {flag.enabled ? "Enabled" : "Disabled"}
                                        </span>
                                        <Switch
                                            checked={flag.enabled}
                                            onCheckedChange={() => handleToggle(flag.id)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(flag.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

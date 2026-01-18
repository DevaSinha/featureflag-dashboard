"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Beaker, Plus, Loader2, RefreshCw, BarChart3, Users, TrendingUp } from "lucide-react";

interface Flag {
    id: string;
    key: string;
    name: string;
}

interface Experiment {
    id: string;
    flag_id: string;
    name: string;
    description: string;
    status: string;
    tracked_events: string[];
    created_at: string;
    start_date?: string;
    end_date?: string;
}

interface Metrics {
    experiment_id: string;
    total_users: number;
    total_exposures: number;
    variants: { variant_key: string; users: number; exposures: number; percentage: number }[];
    events: { event_name: string; total_count: number; variant_breakdown: any[] }[];
}

export default function ExperimentsPage() {
    const { project } = useAuth();
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [flags, setFlags] = useState<Flag[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
    const [newExp, setNewExp] = useState({
        flag_id: "",
        name: "",
        description: "",
        tracked_events: "purchase,signup",
    });

    const fetchExperiments = async () => {
        if (!project) return;
        setLoading(true);
        const [expRes, flagRes] = await Promise.all([
            api.getExperiments(project.id),
            api.getFlags(project.id),
        ]);
        if (expRes.success && expRes.data) setExperiments(expRes.data);
        if (flagRes.success && flagRes.data) setFlags(flagRes.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchExperiments();
    }, [project]);

    const handleCreate = async () => {
        if (!project) return;
        setCreating(true);
        const response = await api.createExperiment(project.id, {
            flag_id: newExp.flag_id,
            name: newExp.name,
            description: newExp.description,
            tracked_events: newExp.tracked_events.split(",").map((e) => e.trim()),
        });
        if (response.success) {
            setDialogOpen(false);
            setNewExp({ flag_id: "", name: "", description: "", tracked_events: "purchase,signup" });
            fetchExperiments();
        }
        setCreating(false);
    };

    const viewMetrics = async (expId: string) => {
        const response = await api.getExperimentMetrics(expId);
        if (response.success && response.data) {
            setSelectedMetrics(response.data);
            setMetricsDialogOpen(true);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            DRAFT: "outline",
            RUNNING: "default",
            PAUSED: "secondary",
            COMPLETED: "destructive",
        };
        return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
    };

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Beaker className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
                <p className="text-muted-foreground">Select a project to manage experiments.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Beaker className="h-8 w-8" />
                        Experiments
                    </h2>
                    <p className="text-muted-foreground">
                        Run A/B tests and analyze results for {project.name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchExperiments}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={flags.length === 0}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Experiment
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Experiment</DialogTitle>
                                <DialogDescription>Link an experiment to a feature flag.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Feature Flag</Label>
                                    <Select
                                        value={newExp.flag_id}
                                        onValueChange={(v) => setNewExp({ ...newExp, flag_id: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a flag..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {flags.map((f) => (
                                                <SelectItem key={f.id} value={f.id}>
                                                    {f.name} ({f.key})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Experiment Name</Label>
                                    <Input
                                        placeholder="Checkout Flow Test"
                                        value={newExp.name}
                                        onChange={(e) => setNewExp({ ...newExp, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="Testing new checkout UI"
                                        value={newExp.description}
                                        onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tracked Events (comma-separated)</Label>
                                    <Input
                                        placeholder="purchase,signup,click"
                                        value={newExp.tracked_events}
                                        onChange={(e) => setNewExp({ ...newExp, tracked_events: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={creating || !newExp.flag_id}>
                                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create
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
            ) : experiments.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Beaker className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No experiments yet</h3>
                        <p className="text-muted-foreground mb-4">
                            {flags.length === 0 ? "Create a flag first, then link an experiment." : "Create an experiment to start testing."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {experiments.map((exp) => (
                        <Card key={exp.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold">{exp.name}</h3>
                                        {getStatusBadge(exp.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {exp.description || "No description"}
                                    </p>
                                    <div className="flex gap-2">
                                        {exp.tracked_events?.map((e) => (
                                            <Badge key={e} variant="outline" className="text-xs">
                                                {e}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={() => viewMetrics(exp.id)}>
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Metrics
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Metrics Dialog */}
            <Dialog open={metricsDialogOpen} onOpenChange={setMetricsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Experiment Metrics</DialogTitle>
                    </DialogHeader>
                    {selectedMetrics && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-2xl font-bold">{selectedMetrics.total_users}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Total Users</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-2xl font-bold">{selectedMetrics.total_exposures}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Total Exposures</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">Variant Distribution</h4>
                                <div className="space-y-2">
                                    {selectedMetrics.variants?.map((v) => (
                                        <div key={v.variant_key} className="flex items-center gap-4">
                                            <Badge variant="outline">{v.variant_key}</Badge>
                                            <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${v.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-mono w-16 text-right">
                                                {v.percentage.toFixed(1)}%
                                            </span>
                                            <span className="text-sm text-muted-foreground w-20 text-right">
                                                {v.users} users
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedMetrics.events?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Events</h4>
                                    <div className="space-y-2">
                                        {selectedMetrics.events.map((e) => (
                                            <div key={e.event_name} className="flex items-center justify-between p-3 bg-secondary/50 rounded">
                                                <span className="font-mono">{e.event_name}</span>
                                                <span className="font-bold">{e.total_count} events</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

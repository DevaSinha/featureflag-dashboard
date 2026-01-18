"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Activity, Users, Flag, TrendingUp, Plus, Building2, FolderKanban, Loader2, ArrowRight } from "lucide-react";

interface Stats {
    flags: number;
    experiments: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { organization, project, setOrganization, setProject, isAuthenticated, isLoading, refreshOrganizations, refreshProjects } = useAuth();
    const [stats, setStats] = useState<Stats>({ flags: 0, experiments: 0 });
    const [loadingStats, setLoadingStats] = useState(false);

    // Create org dialog
    const [orgDialogOpen, setOrgDialogOpen] = useState(false);
    const [orgForm, setOrgForm] = useState({ name: "", slug: "" });
    const [creatingOrg, setCreatingOrg] = useState(false);
    const [orgError, setOrgError] = useState("");

    // Create project dialog
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [projectForm, setProjectForm] = useState({ name: "", description: "" });
    const [creatingProject, setCreatingProject] = useState(false);
    const [projectError, setProjectError] = useState("");

    // Fetch stats when project is selected
    useEffect(() => {
        if (!project) {
            setStats({ flags: 0, experiments: 0 });
            return;
        }
        setLoadingStats(true);
        Promise.all([
            api.getFlags(project.id),
            api.getExperiments(project.id),
        ]).then(([flagsRes, expsRes]) => {
            setStats({
                flags: flagsRes.data?.length || 0,
                experiments: expsRes.data?.length || 0,
            });
            setLoadingStats(false);
        });
    }, [project]);

    const handleCreateOrg = async () => {
        setCreatingOrg(true);
        setOrgError("");
        const response = await api.createOrganization(orgForm.name, orgForm.slug);
        if (response.success && response.data) {
            await refreshOrganizations();
            setOrganization(response.data);
            setOrgDialogOpen(false);
            setOrgForm({ name: "", slug: "" });
        } else {
            setOrgError(response.error || "Failed to create organization");
        }
        setCreatingOrg(false);
    };

    const handleCreateProject = async () => {
        if (!organization) return;
        setCreatingProject(true);
        setProjectError("");
        const response = await api.createProject(organization.id, projectForm.name, projectForm.description);
        if (response.success && response.data) {
            await refreshProjects();
            setProject(response.data);
            setProjectDialogOpen(false);
            setProjectForm({ name: "", description: "" });
        } else {
            setProjectError(response.error || "Failed to create project");
        }
        setCreatingProject(false);
    };

    // Show login prompt if not authenticated
    if (!isLoading && !isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                <Activity className="h-16 w-16 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-2">Welcome to Flagship</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Sign in to manage your feature flags and experiments.
                </p>
                <div className="flex gap-3">
                    <Button asChild>
                        <Link href="/login">Sign In</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/register">Create Account</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Show create org prompt if no organization
    if (!organization) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Create Your Organization</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Organizations help you manage teams and projects. Create one to get started.
                </p>
                <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Organization</DialogTitle>
                            <DialogDescription>Set up your team or company workspace.</DialogDescription>
                        </DialogHeader>
                        {orgError && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                {orgError}
                            </div>
                        )}
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Organization Name</Label>
                                <Input
                                    placeholder="Acme Corp"
                                    value={orgForm.name}
                                    onChange={(e) => setOrgForm({
                                        name: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input
                                    placeholder="acme-corp"
                                    value={orgForm.slug}
                                    onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">URL-friendly identifier</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOrgDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateOrg} disabled={creatingOrg || !orgForm.name}>
                                {creatingOrg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // Show create project prompt if no project
    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Create Your First Project</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Projects contain feature flags and experiments. Create one for {organization.name}.
                </p>
                <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Project</DialogTitle>
                            <DialogDescription>Projects help organize your feature flags.</DialogDescription>
                        </DialogHeader>
                        {projectError && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                {projectError}
                            </div>
                        )}
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Project Name</Label>
                                <Input
                                    placeholder="Web Application"
                                    value={projectForm.name}
                                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (optional)</Label>
                                <Input
                                    placeholder="Main web app with feature flags"
                                    value={projectForm.description}
                                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateProject} disabled={creatingProject || !projectForm.name}>
                                {creatingProject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // Main dashboard with real stats
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of {project.name} in {organization.name}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
                        <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loadingStats ? "..." : stats.flags}</div>
                        <Link href="/dashboard/flags" className="text-xs text-primary hover:underline">
                            View all flags →
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Experiments</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loadingStats ? "..." : stats.experiments}</div>
                        <Link href="/dashboard/experiments" className="text-xs text-primary hover:underline">
                            View experiments →
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Environments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">dev, staging, prod</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SDK Ready</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">✓</div>
                        <Link href="/dashboard/demo" className="text-xs text-primary hover:underline">
                            Try the SDK →
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/dashboard/flags">
                                <Flag className="h-4 w-4 mr-2" />
                                Create Feature Flag
                                <ArrowRight className="h-4 w-4 ml-auto" />
                            </Link>
                        </Button>
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/dashboard/experiments">
                                <Activity className="h-4 w-4 mr-2" />
                                Create Experiment
                                <ArrowRight className="h-4 w-4 ml-auto" />
                            </Link>
                        </Button>
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/dashboard/demo">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Test SDK Integration
                                <ArrowRight className="h-4 w-4 ml-auto" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-xs">✓</div>
                                <span className="text-sm">Create organization</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-xs">✓</div>
                                <span className="text-sm">Create project</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${stats.flags > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                    {stats.flags > 0 ? '✓' : '3'}
                                </div>
                                <span className="text-sm">Create your first flag</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">4</div>
                                <span className="text-sm">Integrate SDK in your app</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

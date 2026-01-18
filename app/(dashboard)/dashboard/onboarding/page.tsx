"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Building2, FolderKanban, Loader2, Check, ArrowRight } from "lucide-react";

type Step = "org" | "project" | "done";

export default function OnboardingPage() {
    const router = useRouter();
    const { setOrganization, setProject } = useAuth();
    const [step, setStep] = useState<Step>("org");
    const [loading, setLoading] = useState(false);
    const [orgId, setOrgId] = useState("");

    const [orgForm, setOrgForm] = useState({ name: "", slug: "" });
    const [projectForm, setProjectForm] = useState({ name: "", description: "" });

    const handleCreateOrg = async () => {
        setLoading(true);
        const response = await api.createOrganization(orgForm.name, orgForm.slug);
        if (response.success && response.data) {
            setOrganization(response.data);
            setOrgId(response.data.id);
            setStep("project");
        }
        setLoading(false);
    };

    const handleCreateProject = async () => {
        setLoading(true);
        const response = await api.createProject(orgId, projectForm.name, projectForm.description);
        if (response.success && response.data) {
            setProject(response.data);
            setStep("done");
        }
        setLoading(false);
    };

    const handleFinish = () => {
        router.push("/dashboard/flags");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
                            <Activity className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Welcome to Flagship!</CardTitle>
                    <CardDescription>Let's set up your workspace in just a few steps.</CardDescription>

                    {/* Progress */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <div className={`h-2 w-16 rounded-full ${step === "org" ? "bg-primary" : "bg-primary"}`} />
                        <div className={`h-2 w-16 rounded-full ${step === "project" || step === "done" ? "bg-primary" : "bg-muted"}`} />
                        <div className={`h-2 w-16 rounded-full ${step === "done" ? "bg-primary" : "bg-muted"}`} />
                    </div>
                </CardHeader>

                <CardContent>
                    {step === "org" && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Create Organization</h3>
                                    <p className="text-sm text-muted-foreground">This is your team or company.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Organization Name</Label>
                                <Input
                                    placeholder="Acme Corp"
                                    value={orgForm.name}
                                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (URL-friendly)</Label>
                                <Input
                                    placeholder="acme-corp"
                                    value={orgForm.slug}
                                    onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                                />
                            </div>
                            <Button className="w-full" onClick={handleCreateOrg} disabled={loading || !orgForm.name}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {step === "project" && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <FolderKanban className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Create Your First Project</h3>
                                    <p className="text-sm text-muted-foreground">Projects contain flags and experiments.</p>
                                </div>
                            </div>
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
                            <Button className="w-full" onClick={handleCreateProject} disabled={loading || !projectForm.name}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Create Project <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {step === "done" && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Check className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold">You're all set!</h3>
                            <p className="text-muted-foreground">
                                Your workspace is ready. Start creating feature flags and running experiments.
                            </p>
                            <Button className="w-full" onClick={handleFinish}>
                                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

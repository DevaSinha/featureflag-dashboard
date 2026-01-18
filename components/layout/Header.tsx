"use client";

import { useState } from "react";
import { Menu, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sidebar } from "./Sidebar";
import { ModeToggle } from "@/components/common/ModeToggle";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export function Header() {
    const { organization, setProject, isAuthenticated, refreshProjects } = useAuth();

    // New Project Dialog
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [projectForm, setProjectForm] = useState({ name: "", description: "" });
    const [creatingProject, setCreatingProject] = useState(false);
    const [projectError, setProjectError] = useState("");

    // Feedback Dialog
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ message: "" });
    const [feedbackSent, setFeedbackSent] = useState(false);

    const handleCreateProject = async () => {
        if (!organization) return;
        setCreatingProject(true);
        setProjectError("");
        const response = await api.createProject(organization.id, projectForm.name, projectForm.description);
        if (response.success && response.data) {
            // Refresh the projects list in the sidebar
            await refreshProjects();
            // Set the newly created project as selected
            setProject(response.data);
            setProjectDialogOpen(false);
            setProjectForm({ name: "", description: "" });
        } else {
            setProjectError(response.error || "Failed to create project");
        }
        setCreatingProject(false);
    };

    const handleSendFeedback = () => {
        // In a real app, this would send to an API
        console.log("Feedback:", feedbackForm.message);
        setFeedbackSent(true);
        setTimeout(() => {
            setFeedbackDialogOpen(false);
            setFeedbackSent(false);
            setFeedbackForm({ message: "" });
        }, 2000);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
                {/* Mobile Sidebar Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <Sidebar className="border-none h-full" />
                    </SheetContent>
                </Sheet>

                {/* Dashboard Title / Breadcrumbs */}
                <div className="flex-1">
                    <h1 className="font-semibold text-lg">Dashboard</h1>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Feedback Button */}
                    <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Feedback
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Send Feedback</DialogTitle>
                                <DialogDescription>
                                    We'd love to hear your thoughts on how to improve Flagship.
                                </DialogDescription>
                            </DialogHeader>
                            {feedbackSent ? (
                                <div className="py-8 text-center">
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-green-600 text-xl">✓</span>
                                    </div>
                                    <p className="font-medium">Thank you for your feedback!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Your Feedback</Label>
                                            <Textarea
                                                placeholder="Tell us what's on your mind..."
                                                rows={5}
                                                value={feedbackForm.message}
                                                onChange={(e) =>
                                                    setFeedbackForm({ ...feedbackForm, message: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSendFeedback} disabled={!feedbackForm.message}>
                                            Send Feedback
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* New Project Button */}
                    {isAuthenticated && organization && (
                        <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Project</DialogTitle>
                                    <DialogDescription>
                                        Create a new project in {organization.name}.
                                    </DialogDescription>
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
                                            placeholder="Mobile App"
                                            value={projectForm.name}
                                            onChange={(e) =>
                                                setProjectForm({ ...projectForm, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description (optional)</Label>
                                        <Input
                                            placeholder="iOS and Android mobile application"
                                            value={projectForm.description}
                                            onChange={(e) =>
                                                setProjectForm({ ...projectForm, description: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateProject}
                                        disabled={creatingProject || !projectForm.name}
                                    >
                                        {creatingProject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Project
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}

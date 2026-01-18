"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Settings, Key, Users, Building2, Trash2, Plus, Loader2, Copy, Check, AlertTriangle } from "lucide-react";

interface ApiKey {
    id: string;
    name: string;
    environment_id: string;
    created_at: string;
    last_used_at?: string;
}

interface Environment {
    id: string;
    name: string;
}

interface Member {
    id: string;
    user_id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
}

export default function SettingsPage() {
    const { organization, project, user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("api-keys");

    // API Keys state
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [loadingKeys, setLoadingKeys] = useState(false);
    const [newKeyDialog, setNewKeyDialog] = useState(false);
    const [creatingKey, setCreatingKey] = useState(false);
    const [newKey, setNewKey] = useState({ name: "", environment_id: "" });
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);

    // Members state
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [inviteDialog, setInviteDialog] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: "", role: "MEMBER" });
    const [inviteError, setInviteError] = useState("");

    // Fetch API Keys
    const fetchApiKeys = async () => {
        if (!project) return;
        setLoadingKeys(true);
        const [keysRes, envsRes] = await Promise.all([
            api.getApiKeys(project.id),
            api.getEnvironments(project.id),
        ]);
        if (keysRes.success && keysRes.data) setApiKeys(keysRes.data);
        if (envsRes.success && envsRes.data) setEnvironments(envsRes.data);
        setLoadingKeys(false);
    };

    // Fetch Members
    const fetchMembers = async () => {
        if (!organization) return;
        setLoadingMembers(true);
        const response = await api.getMembers(organization.id);
        if (response.success && response.data) {
            setMembers(response.data);
        }
        setLoadingMembers(false);
    };

    useEffect(() => {
        fetchApiKeys();
        fetchMembers();
    }, [project, organization]);

    const handleCreateApiKey = async () => {
        if (!project) return;
        setCreatingKey(true);
        const response = await api.createApiKey(project.id, newKey.environment_id, newKey.name);
        if (response.success && response.data) {
            setGeneratedKey(response.data.key);
            fetchApiKeys();
        }
        setCreatingKey(false);
    };

    const handleDeleteApiKey = async (keyId: string) => {
        if (!project || !confirm("Delete this API key? This cannot be undone.")) return;
        await api.deleteApiKey(project.id, keyId);
        fetchApiKeys();
    };

    const handleCopyKey = () => {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const handleCloseKeyDialog = () => {
        setNewKeyDialog(false);
        setNewKey({ name: "", environment_id: "" });
        setGeneratedKey(null);
    };

    const handleInviteMember = async () => {
        if (!organization) return;
        setInviting(true);
        setInviteError("");
        const response = await api.inviteMember(organization.id, inviteForm.email, inviteForm.role);
        if (response.success) {
            setInviteDialog(false);
            setInviteForm({ email: "", role: "MEMBER" });
            fetchMembers();
        } else {
            setInviteError(response.error || "Failed to invite member");
        }
        setInviting(false);
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!organization || !confirm("Remove this member from the organization?")) return;
        await api.removeMember(organization.id, memberId);
        fetchMembers();
    };

    const getEnvName = (envId: string) => {
        return environments.find((e) => e.id === envId)?.name || "Unknown";
    };

    if (!project || !organization) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
                <p className="text-muted-foreground">Select a project to manage settings.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Settings
                </h2>
                <p className="text-muted-foreground">
                    Manage your project settings, API keys, and team members.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="api-keys" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        API Keys
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team
                    </TabsTrigger>
                    <TabsTrigger value="project" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Project
                    </TabsTrigger>
                </TabsList>

                {/* API Keys Tab */}
                <TabsContent value="api-keys" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>API Keys</CardTitle>
                                <CardDescription>
                                    Manage SDK API keys for different environments.
                                </CardDescription>
                            </div>
                            <Dialog open={newKeyDialog} onOpenChange={setNewKeyDialog}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setGeneratedKey(null)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Key
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {generatedKey ? "API Key Created!" : "Create API Key"}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {generatedKey
                                                ? "Copy this key now. You won't be able to see it again."
                                                : "Create a new API key for SDK integration."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    {generatedKey ? (
                                        <div className="space-y-4 py-4">
                                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                                                {generatedKey}
                                            </div>
                                            <Button onClick={handleCopyKey} className="w-full">
                                                {copiedKey ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy to Clipboard
                                                    </>
                                                )}
                                            </Button>
                                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="text-sm">Store this key securely!</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Key Name</Label>
                                                    <Input
                                                        placeholder="Production SDK Key"
                                                        value={newKey.name}
                                                        onChange={(e) =>
                                                            setNewKey({ ...newKey, name: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Environment</Label>
                                                    <Select
                                                        value={newKey.environment_id}
                                                        onValueChange={(v) =>
                                                            setNewKey({ ...newKey, environment_id: v })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select environment..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {environments.map((env) => (
                                                                <SelectItem key={env.id} value={env.id}>
                                                                    {env.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={handleCloseKeyDialog}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleCreateApiKey}
                                                    disabled={creatingKey || !newKey.name || !newKey.environment_id}
                                                >
                                                    {creatingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Create Key
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {loadingKeys ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : apiKeys.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No API keys yet. Create one to integrate the SDK.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Environment</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {apiKeys.map((key) => (
                                            <TableRow key={key.id}>
                                                <TableCell className="font-medium">{key.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{getEnvName(key.environment_id)}</Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(key.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteApiKey(key.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>
                                    Manage members of {organization.name}.
                                </CardDescription>
                            </div>
                            <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Invite Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Invite Team Member</DialogTitle>
                                        <DialogDescription>
                                            Send an invitation to join the organization.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {inviteError && (
                                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                            {inviteError}
                                        </div>
                                    )}
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Email Address</Label>
                                            <Input
                                                type="email"
                                                placeholder="colleague@example.com"
                                                value={inviteForm.email}
                                                onChange={(e) =>
                                                    setInviteForm({ ...inviteForm, email: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <Select
                                                value={inviteForm.role}
                                                onValueChange={(v) =>
                                                    setInviteForm({ ...inviteForm, role: v })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MEMBER">Member</SelectItem>
                                                    <SelectItem value="OWNER">Owner</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setInviteDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleInviteMember}
                                            disabled={inviting || !inviteForm.email}
                                        >
                                            {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Send Invite
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {loadingMembers ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{member.name || "Unknown"}</p>
                                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                                                        {member.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(member.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {member.user_id !== user?.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive"
                                                            onClick={() => handleRemoveMember(member.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Project Tab */}
                <TabsContent value="project" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Settings</CardTitle>
                            <CardDescription>Manage your project configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Project Name</Label>
                                    <Input value={project.name} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Project ID</Label>
                                    <Input value={project.id} disabled className="font-mono text-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={project.description || "No description"} disabled />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Environments</CardTitle>
                            <CardDescription>Your project environments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                {environments.map((env) => (
                                    <div
                                        key={env.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{env.name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{env.id}</p>
                                        </div>
                                        <Badge variant="outline">Active</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions for your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                                <div>
                                    <p className="font-medium">Sign Out</p>
                                    <p className="text-sm text-muted-foreground">
                                        Sign out of your current session.
                                    </p>
                                </div>
                                <Button variant="destructive" onClick={logout}>
                                    Sign Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

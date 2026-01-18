"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
    LayoutDashboard,
    Flag,
    Beaker,
    Settings,
    Activity,
    ShieldCheck,
    LogOut,
    Building2,
    FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const sidebarItems = [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { title: "Feature Flags", href: "/dashboard/flags", icon: Flag },
    { title: "Experiments", href: "/dashboard/experiments", icon: Beaker },
    { title: "Audit Logs", href: "/dashboard/audit", icon: ShieldCheck },
    { title: "Live Demo", href: "/dashboard/demo", icon: Activity },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const {
        user,
        organization,
        project,
        organizations,
        projects,
        setOrganization,
        setProject,
        logout,
        isAuthenticated,
    } = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const handleOrgChange = (orgId: string) => {
        const selected = organizations.find((o) => o.id === orgId);
        if (selected) {
            setOrganization(selected);
        }
    };

    const handleProjectChange = (projId: string) => {
        const selected = projects.find((p) => p.id === projId);
        if (selected) {
            setProject(selected);
        }
    };

    return (
        <div className={cn("pb-12 h-screen border-r bg-card relative", className)}>
            <div className="space-y-4 py-4">
                {/* Logo */}
                <div className="px-6 py-2">
                    <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Flagship
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Feature Management Platform
                    </p>
                </div>

                {/* Org Selector */}
                {isAuthenticated && (
                    <div className="px-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                            <Building2 className="h-3 w-3" />
                            Organization
                        </div>
                        <Select
                            value={organization?.id || ""}
                            onValueChange={handleOrgChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select org..." />
                            </SelectTrigger>
                            <SelectContent>
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                        {org.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 pt-2">
                            <FolderKanban className="h-3 w-3" />
                            Project
                        </div>
                        <Select
                            value={project?.id || ""}
                            onValueChange={handleProjectChange}
                            disabled={!organization || projects.length === 0}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={projects.length === 0 ? "No projects" : "Select project..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((proj) => (
                                    <SelectItem key={proj.id} value={proj.id}>
                                        {proj.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Navigation */}
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname === item.href || pathname.startsWith(item.href + "/") ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    (pathname === item.href || pathname.startsWith(item.href + "/")) && "bg-secondary"
                                )}
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Footer */}
            {user && (
                <div className="absolute bottom-4 left-0 w-full px-4">
                    <div className="flex items-center gap-2 p-3 border rounded-xl bg-background/50 backdrop-blur-sm">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

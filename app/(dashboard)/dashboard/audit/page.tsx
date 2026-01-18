"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ShieldCheck, Search, Filter, RefreshCw, Loader2 } from "lucide-react";

interface AuditLog {
    id: string;
    user_email?: string;
    user_id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    changes?: any;
    created_at: string;
}

const entityTypes = ["ALL", "FLAG", "EXPERIMENT", "PROJECT", "API_KEY", "MEMBER", "ORGANIZATION", "ENVIRONMENT", "RULE"];
const actionTypes = ["ALL", "CREATE", "UPDATE", "DELETE", "ENABLE", "DISABLE", "INVITE", "REMOVE"];

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
    switch (action) {
        case "CREATE": return "default";
        case "UPDATE": return "secondary";
        case "DELETE": return "destructive";
        case "ENABLE": return "default";
        case "DISABLE": return "outline";
        case "INVITE": return "secondary";
        default: return "outline";
    }
}

function getEntityIcon(entityType: string) {
    const icons: Record<string, string> = {
        FLAG: "🚩",
        EXPERIMENT: "🧪",
        PROJECT: "📁",
        API_KEY: "🔑",
        MEMBER: "👤",
        ORGANIZATION: "🏢",
        ENVIRONMENT: "🌍",
        RULE: "📋",
    };
    return icons[entityType] || "📝";
}

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export default function AuditLogsPage() {
    const { organization } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [entityFilter, setEntityFilter] = useState("ALL");
    const [actionFilter, setActionFilter] = useState("ALL");

    const fetchLogs = async () => {
        if (!organization) return;
        setLoading(true);
        const params: Record<string, string> = {};
        if (entityFilter !== "ALL") params.entity_type = entityFilter;
        if (actionFilter !== "ALL") params.action = actionFilter;

        const response = await api.getAuditLogs(organization.id, params);
        if (response.success && response.data) {
            setLogs(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [organization, entityFilter, actionFilter]);

    const filteredLogs = logs.filter((log) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.entity_id?.toLowerCase().includes(query) ||
            log.user_email?.toLowerCase().includes(query) ||
            log.entity_type?.toLowerCase().includes(query)
        );
    });

    if (!organization) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Organization Selected</h3>
                <p className="text-muted-foreground">Select an organization to view audit logs.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8" />
                        Audit Logs
                    </h2>
                    <p className="text-muted-foreground">
                        Track all changes made to your organization.
                    </p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchLogs}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by entity or user..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={entityFilter} onValueChange={setEntityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Entity Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {entityTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type === "ALL" ? "All Entities" : type.replace("_", " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {actionTypes.map((action) => (
                                    <SelectItem key={action} value={action}>
                                        {action === "ALL" ? "All Actions" : action}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Log Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{getEntityIcon(log.entity_type)}</span>
                                                <div>
                                                    <p className="font-medium font-mono text-xs">{log.entity_id.substring(0, 8)}...</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {log.entity_type.replace("_", " ")}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getActionBadgeVariant(log.action)}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {log.user_email || log.user_id.substring(0, 8) + "..."}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatTimeAgo(log.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            No audit logs found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

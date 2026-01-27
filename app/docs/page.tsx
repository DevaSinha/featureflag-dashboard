"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu,
    Book,
    Layers,
    Code,
    Database,
    Shield,
    Terminal,
    Layout,
    Cpu,
    FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Navigation Structure ---
const docSections = [
    { id: "overview", label: "Overview", icon: Book },
    { id: "architecture", label: "Architecture", icon: Layers },
    { id: "concepts", label: "Core Concepts", icon: Cpu },
    { id: "api", label: "API Reference", icon: Code },
    { id: "frontend", label: "Frontend", icon: Layout },
    { id: "data-model", label: "Data Model", icon: Database },
    { id: "security", label: "Security & Reliability", icon: Shield },
    { id: "developer", label: "Developer Setup", icon: Terminal },
    { id: "decisions", label: "Design Decisions", icon: FileText },
];

export default function DocsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link href="/" className="mr-6 flex items-center space-x-2 font-bold">
                            <span>Flagship</span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link href="/docs" className="text-foreground transition-colors hover:text-foreground/80">Documentation</Link>
                            <Link href="https://github.com/DevaSinha/featureflag-sdk" target="_blank" className="text-foreground/60 transition-colors hover:text-foreground/80">GitHub</Link>
                        </nav>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="pr-0">
                            <div className="px-7">
                                <Link href="/" className="flex items-center font-bold">
                                    Flagship
                                </Link>
                            </div>
                            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                                <div className="flex flex-col space-y-3">
                                    {docSections.map((section) => (
                                        <Link
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {section.label}
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            {/* Search placeholder */}
                        </div>
                        <nav className="flex items-center">
                            <Button asChild variant="secondary" size="sm">
                                <Link href="/login">Login</Link>
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">

                {/* Desktop Sidebar */}
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
                    <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                        <div className="w-full">
                            <div className="pb-4">
                                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Contents</h4>
                                <div className="grid grid-flow-row auto-rows-max text-sm">
                                    {docSections.map((section) => (
                                        <Link
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 text-muted-foreground hover:underline"
                                        >
                                            <section.icon className="mr-2 h-4 w-4" />
                                            {section.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </aside>

                {/* Content Area */}
                <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
                    <div className="mx-auto w-full min-w-0">

                        {/* 1. Overview */}
                        <section id="overview" className="mb-16 scroll-mt-20">
                            <div className="space-y-2">
                                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Flagship Documentation</h1>
                                <p className="text-lg text-muted-foreground">
                                    Enterprise-grade feature flag & experimentation platform.
                                </p>
                            </div>
                            <div className="my-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
                                Decouple deployment from release. Ship faster with confidence.
                            </div>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                                Flagship is a modern, full-stack feature management platform designed to help engineering teams ship faster.
                                It allows you to toggle features, perform percentage rollouts, and run A/B tests without redeploying code.
                            </p>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FeatureCard
                                    title="Feature Flags"
                                    description="Boolean & Multivariate flags with granular targeting rules."
                                />
                                <FeatureCard
                                    title="Experimentation"
                                    description="Validated learning with statistical significance and real user data."
                                />
                                <FeatureCard
                                    title="Type-Safe SDKs"
                                    description="Seamless integration for React, Node.js, and Go."
                                />
                                <FeatureCard
                                    title="Audit Logging"
                                    description="Complete history of who changed what and when."
                                />
                            </div>
                        </section>

                        {/* 2. Architecture */}
                        <section id="architecture" className="mb-16 scroll-mt-20">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                                Architecture Overview
                            </h2>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                                Flagship uses a <strong>Modular Monolith</strong> architecture optimized for performance and maintainability.
                            </p>
                            <div className="my-6 rounded-md bg-muted p-4">
                                <pre className="text-sm overflow-x-auto">
                                    {`[ Client App ]  <-- SDK -->  [ Edge API (Go) ]  <-- (Read) -- [ Cache (Redis) ]
      |
      | (HTTP)
      v
[ Dashboard ]  <-- API -->  [ Management API (Go) ]  -->  [ Database (Postgres) ]
                                       ^
                                       | (Async Write)
                                  [ Workers ]`}
                                </pre>
                            </div>
                            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                                <li><strong>Management API (Go + Gin):</strong> Handles all dashboard operations (CRUD, Auth, Config).</li>
                                <li><strong>Evaluation Engine (Go):</strong> High-performance endpoint for SDKs to evaluate flags.</li>
                                <li><strong>Data Layer:</strong> PostgreSQL (Supabase) for truth, Redis (Upstash) for speed.</li>
                            </ul>
                        </section>

                        {/* 3. Core Concepts */}
                        <section id="concepts" className="mb-16 scroll-mt-20">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Core Concepts</h2>

                            <div className="mt-6 flex flex-col gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold">Hierarchy</h3>
                                    <p className="leading-7 mt-2">
                                        Everything starts with an <strong>Organization</strong> (Tenant). Inside, you have <strong>Projects</strong> (e.g., "Mobile App", "Web App").
                                        Each project has multiple <strong>Environments</strong> (Dev, Staging, Prod).
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold">Feature Flags</h3>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <Card>
                                            <CardHeader><CardTitle>Boolean</CardTitle></CardHeader>
                                            <CardContent>Simple On/Off toggles. Great for kill-witches.</CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader><CardTitle>Multivariate</CardTitle></CardHeader>
                                            <CardContent>String/JSON/Number variants. Great for styling or config.</CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. API Overview */}
                        <section id="api" className="mb-16 scroll-mt-20">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">API Overview</h2>
                            <p className="leading-7 mt-6">The API is separated into two distinct surfaces to ensure security and performance.</p>

                            <div className="mt-6 space-y-6">
                                <div className="border rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold">Management API (`/api/v1`)</h3>
                                        <Badge>JWT Auth</Badge>
                                    </div>
                                    <p className="mb-2">Used by the Dashboard and CI/CD scripts.</p>
                                    <code className="bg-muted px-2 py-1 rounded">POST /api/v1/projects/:id/flags</code>
                                </div>

                                <div className="border rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold">SDK API (`/sdk`)</h3>
                                        <Badge variant="secondary">API Key Auth</Badge>
                                    </div>
                                    <p className="mb-2">Used by Client SDKs. Optimized for high-throughput reads via Redis.</p>
                                    <code className="bg-muted px-2 py-1 rounded">POST /sdk/flags (Evaluate All)</code>
                                </div>
                            </div>
                        </section>

                        {/* 5. Frontend */}
                        <section id="frontend" className="mb-16 scroll-mt-20">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Frontend Application</h2>
                            <p className="leading-7 mt-6">Built with <strong>Next.js 14 (App Router)</strong>, leveraging React Server Components where applicable.</p>
                            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                                <li><strong>State Management:</strong> TanStack Query (React Query) handles server state, caching, and optimistic updates.</li>
                                <li><strong>UX Patterns:</strong> Real-time feedback via <code className="bg-muted px-1 rounded">sonner</code> toasts and skeleton loaders.</li>
                                <li><strong>Styling:</strong> Tailwind CSS + shadcn/ui for accessible, consistent components.</li>
                            </ul>
                        </section>

                        {/* 6. Data Model */}
                        <section id="data-model" className="mb-16 scroll-mt-20">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Data Model</h2>
                            <p className="leading-7 mt-6">Strict isolation and integrity enforced by PostgreSQL schema.</p>
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">Key Relationships</h3>
                                <ul className="list-decimal ml-6 space-y-2">
                                    <li><strong>Flags & Variants:</strong> 1:N relationship. Rules link flags to environments.</li>
                                    <li><strong>Experiments:</strong> Link a Flag to tracked Events.</li>
                                    <li><strong>Exposures & Events:</strong> High-volume tables optimized for write speed.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 7. Security */}
                        <section id="security" className="mb-16 scroll-mt-20">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Security & Reliability</h2>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h3 className="font-bold">Authentication</h3>
                                    <p className="text-sm text-muted-foreground">Short-lived JWT Access Tokens (15m) + Rotating Refresh Tokens (7d). SDKs use environment-scoped API keys.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold">Audit Logs</h3>
                                    <p className="text-sm text-muted-foreground">Immutable record of all changes. Captures Who, What (Entity/Action), and the JSON Diff.</p>
                                </div>
                            </div>
                        </section>

                        {/* 8. Developer Setup */}
                        <section id="developer" className="mb-16 scroll-mt-20">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Developer Setup</h2>
                            <p className="leading-7 mt-6">Get up and running in minutes.</p>

                            <div className="mt-6 space-y-4">
                                <Step number="1" title="Clone Repo">
                                    <code className="block bg-muted p-2 rounded text-sm">git clone https://github.com/DevaSinha/flagship.git</code>
                                </Step>
                                <Step number="2" title="Environment Setup">
                                    Copy <code className="bg-muted px-1 rounded">.env.example</code> to <code className="bg-muted px-1 rounded">.env</code>
                                </Step>
                                <Step number="3" title="Run Backend">
                                    <code className="block bg-muted p-2 rounded text-sm">go run cmd/server/main.go</code>
                                </Step>
                                <Step number="4" title="Run Frontend">
                                    <code className="block bg-muted p-2 rounded text-sm">cd featureflag-dashboard && npm run dev</code>
                                </Step>
                            </div>
                        </section>

                        {/* 9. Design Decisions */}
                        <section id="decisions" className="mb-20 scroll-mt-20">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Design Decisions</h2>
                            <div className="mt-6 space-y-8">
                                <div>
                                    <h3 className="font-bold text-lg">Why Go + Gin?</h3>
                                    <p className="text-muted-foreground mt-2">Selected for raw performance. Feature evaluation requires processing thousands of requests per second with minimal latency.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Why Modular Monolith?</h3>
                                    <p className="text-muted-foreground mt-2">Simplifies infrastructure (One API, One DB) while keeping domains separated via internal packages. Easy to split later if needed.</p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right Sidebar - On This Page */}
                    <div className="hidden text-sm xl:block pl-6">
                        <div className="sticky top-20">
                            <h4 className="font-semibold mb-4">On This Page</h4>
                            <ul className="space-y-2">
                                {docSections.map((section) => (
                                    <li key={section.id}>
                                        <Link href={`#${section.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                                            {section.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-4">
            <div className="flex-none bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                {number}
            </div>
            <div className="flex-1 space-y-2">
                <h4 className="font-bold">{title}</h4>
                <div className="text-sm text-muted-foreground">{children}</div>
            </div>
        </div>
    );
}

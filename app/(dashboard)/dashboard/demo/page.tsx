"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Play, RefreshCw, Code, Zap, Moon, Sun } from "lucide-react";

// Simulated flag values (in real app, would come from SDK)
const mockFlags = {
    dark_mode: true,
    new_checkout: false,
    premium_features: true,
    beta_dashboard: false,
};

export default function DemoPage() {
    const [userId, setUserId] = useState("user-123");
    const [apiKey, setApiKey] = useState("ff_dev_xxx...");
    const [flags, setFlags] = useState(mockFlags);
    const [loading, setLoading] = useState(false);
    const [lastEvaluated, setLastEvaluated] = useState<Date | null>(null);
    const [eventsSent, setEventsSent] = useState(0);

    const evaluateFlags = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setFlags({
            dark_mode: Math.random() > 0.5,
            new_checkout: Math.random() > 0.7,
            premium_features: Math.random() > 0.3,
            beta_dashboard: Math.random() > 0.8,
        });
        setLastEvaluated(new Date());
        setLoading(false);
    };

    const trackEvent = async (eventName: string) => {
        // Simulate tracking
        setEventsSent((prev) => prev + 1);
    };

    useEffect(() => {
        evaluateFlags();
    }, [userId]);

    const sdkCode = `import { createClient } from '@flagship/sdk';

const client = createClient({
  apiKey: '${apiKey}',
  baseUrl: 'http://localhost:8080'
});

// Evaluate flags for user
const { flags } = await client.getFlags({
  userId: '${userId}',
  attributes: {
    plan: 'PRO',
    country: 'IN'
  }
});

// Use flag values
if (flags.dark_mode) {
  enableDarkMode();
}

// Track events
await client.track({
  event: 'button_clicked',
  userId: '${userId}',
  value: 1
});`;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Zap className="h-8 w-8" />
                    Live Demo
                </h2>
                <p className="text-muted-foreground">
                    Test feature flag evaluation in real-time with the TypeScript SDK.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Set up SDK parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="api-key">API Key</Label>
                            <Input
                                id="api-key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="ff_dev_xxx..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-id">User ID</Label>
                            <Input
                                id="user-id"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="user-123"
                            />
                        </div>
                        <Button onClick={evaluateFlags} disabled={loading} className="w-full">
                            {loading ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="mr-2 h-4 w-4" />
                            )}
                            Evaluate Flags
                        </Button>
                        {lastEvaluated && (
                            <p className="text-xs text-muted-foreground text-center">
                                Last evaluated: {lastEvaluated.toLocaleTimeString()}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Flag Results */}
                <Card>
                    <CardHeader>
                        <CardTitle>Flag Values</CardTitle>
                        <CardDescription>Current evaluation results</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(flags).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                                >
                                    <div className="flex items-center gap-3">
                                        {key === "dark_mode" ? (
                                            value ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
                                        ) : (
                                            <Code className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="font-mono text-sm">{key}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={value ? "default" : "secondary"}>
                                            {value ? "ON" : "OFF"}
                                        </Badge>
                                        <Switch checked={value} disabled />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Live Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>See how flags affect the UI</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={`p-6 rounded-xl transition-all ${flags.dark_mode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
                            }`}
                    >
                        <h3 className="text-xl font-bold mb-4">Sample Application</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                                <p className="font-medium mb-2">Theme</p>
                                <p className="text-sm opacity-70">
                                    {flags.dark_mode ? "🌙 Dark Mode Active" : "☀️ Light Mode Active"}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                                <p className="font-medium mb-2">Checkout</p>
                                <p className="text-sm opacity-70">
                                    {flags.new_checkout ? "✨ New Checkout (v2)" : "📦 Classic Checkout"}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                                <p className="font-medium mb-2">Features</p>
                                <p className="text-sm opacity-70">
                                    {flags.premium_features ? "⭐ Premium Enabled" : "🔒 Basic Plan"}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                                <p className="font-medium mb-2">Dashboard</p>
                                <p className="text-sm opacity-70">
                                    {flags.beta_dashboard ? "🚀 Beta Dashboard" : "📊 Stable Dashboard"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Button
                                variant={flags.dark_mode ? "secondary" : "default"}
                                onClick={() => trackEvent("purchase_clicked")}
                            >
                                {flags.new_checkout ? "Buy Now (New)" : "Add to Cart"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => trackEvent("button_clicked")}
                                className={flags.dark_mode ? "border-white/20 text-white hover:bg-white/10" : ""}
                            >
                                Track Event ({eventsSent})
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Code Example */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        SDK Code Example
                    </CardTitle>
                    <CardDescription>Copy this code to integrate the SDK</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="typescript">
                        <TabsList>
                            <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                            <TabsTrigger value="react">React</TabsTrigger>
                        </TabsList>
                        <TabsContent value="typescript">
                            <pre className="p-4 rounded-lg bg-slate-950 text-slate-50 text-sm overflow-x-auto">
                                <code>{sdkCode}</code>
                            </pre>
                        </TabsContent>
                        <TabsContent value="react">
                            <pre className="p-4 rounded-lg bg-slate-950 text-slate-50 text-sm overflow-x-auto">
                                <code>{`import { FlagshipProvider, useFlagship } from '@flagship/sdk';

function App() {
  return (
    <FlagshipProvider
      config={{ apiKey: '${apiKey}' }}
      user={{ userId: '${userId}' }}
    >
      <MyComponent />
    </FlagshipProvider>
  );
}

function MyComponent() {
  const { getFlag, track } = useFlagship();
  
  const darkMode = getFlag('dark_mode', false);
  
  return (
    <div className={darkMode ? 'dark' : 'light'}>
      <button onClick={() => track('clicked')}>
        Click Me
      </button>
    </div>
  );
}`}</code>
                            </pre>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

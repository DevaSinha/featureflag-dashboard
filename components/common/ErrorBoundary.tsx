"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                            <CardTitle>Something went wrong</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-muted-foreground">
                                An unexpected error occurred. Please try again.
                            </p>
                            {this.state.error && (
                                <pre className="text-xs text-left bg-muted p-3 rounded-lg overflow-auto max-h-32">
                                    {this.state.error.message}
                                </pre>
                            )}
                            <Button onClick={this.handleRetry} className="w-full">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook for functional components to show toast-like errors
export function useErrorHandler() {
    const [error, setError] = React.useState<string | null>(null);

    const showError = (message: string) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    const clearError = () => setError(null);

    return { error, showError, clearError };
}

// Error toast component
export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm flex-1">{message}</p>
                <button onClick={onClose} className="text-destructive-foreground/70 hover:text-destructive-foreground">
                    ✕
                </button>
            </div>
        </div>
    );
}

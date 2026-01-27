import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center border-b">
        <div className="font-bold text-xl">Flagship</div>
        <div className="ml-auto flex gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline flex items-center">Login</Link>
          <Link href="/register" className="text-sm font-medium hover:underline flex items-center">Register</Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight lg:text-7xl mb-6">
          Feature Management <br className="hidden sm:inline" />
          <span className="text-primary">Reimagined</span>
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground mb-8">
          Ship faster with confidence. Manage feature flags, run experiments, and control rollouts with a premium developer experience.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/docs">View Documentation</Link>
          </Button>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © 2026 Flagship. All rights reserved.
      </footer>
    </div>
  );
}

import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <span className="text-xl font-serif tracking-tight text-primary font-semibold">
            Checkout
          </span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="rounded-full font-medium">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="rounded-full font-medium px-5">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
              A quiet place to<br />check in with yourself.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              Five gentle questions. A few minutes each evening.
              Your thoughts, kept privately for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full px-8 font-medium w-full sm:w-auto">
                Start your journal
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="rounded-full px-8 font-medium w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm text-muted-foreground font-serif italic">
            Take a breath. You're doing fine.
          </p>
        </div>
      </footer>
    </div>
  );
}

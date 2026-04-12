import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/new", label: "New Entry", icon: Plus },
    { href: "/", label: "Journal", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-serif tracking-tight text-primary font-semibold">Checkout</span>
          </Link>
          
          <nav className="flex items-center gap-1 sm:gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 md:py-16">
        {children}
      </main>
      
      <footer className="w-full border-t border-border/40 py-8 mt-auto">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm text-muted-foreground font-serif italic">
            Take a breath. You're doing fine.
          </p>
        </div>
      </footer>
    </div>
  );
}

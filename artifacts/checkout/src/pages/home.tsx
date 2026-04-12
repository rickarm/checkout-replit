import { useMemo } from "react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { Calendar, FileText, ArrowRight } from "lucide-react";
import { useEntries } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data, isLoading } = useEntries();
  const entries = data?.entries ?? [];

  const groupedEntries = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const date = parseISO(entry.date);
      const monthYear = format(date, "MMMM yyyy");
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(entry);
      return acc;
    }, {} as Record<string, typeof entries>);
  }, [entries]);

  const isEmpty = !isLoading && entries.length === 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-serif text-foreground">Your Journal</h1>
        {!isEmpty && !isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <BookOpenIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-serif">A quiet place for your thoughts</h2>
          <p className="text-muted-foreground leading-relaxed">
            Take a few moments at the end of your day to reflect. No pressure, no metrics.
            Just you and your thoughts.
          </p>
          <Link href="/new" className="inline-flex">
            <Button
              size="lg"
              className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              Start your first entry
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <section key={month} className="space-y-6">
              <h2 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {month}
              </h2>
              <div className="grid gap-4">
                {monthEntries.map((entry) => (
                  <Link key={entry.id} href={`/entry/${entry.id}`} className="group block outline-none">
                    <Card className="border-border/50 bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-sm hover:border-primary/20 group-focus-visible:ring-2 group-focus-visible:ring-primary/50 group-focus-visible:ring-offset-2 group-focus-visible:border-primary/50">
                      <CardContent className="p-5 sm:p-6 flex flex-row gap-4 justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-base font-medium text-primary">
                            {format(parseISO(entry.date), "EEEE, MMMM d")}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Evening Checkout
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

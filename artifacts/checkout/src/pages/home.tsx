import { useState, useMemo } from "react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { Search, Calendar, FileText, ArrowRight } from "lucide-react";
import { useListEntries, useGetJournalSummary } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: entries, isLoading: isLoadingEntries } = useListEntries(
    { search: searchQuery || undefined },
    { query: { queryKey: ["/api/journal/entries", searchQuery] } }
  );
  
  const { data: summary, isLoading: isLoadingSummary } = useGetJournalSummary({
    query: { queryKey: ["/api/journal/summary"] }
  });

  const groupedEntries = useMemo(() => {
    if (!entries) return {};
    
    return entries.reduce((acc, entry) => {
      const date = parseISO(entry.date);
      const monthYear = format(date, "MMMM yyyy");
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(entry);
      return acc;
    }, {} as Record<string, typeof entries>);
  }, [entries]);

  const isEmpty = entries?.length === 0 && !searchQuery;
  const isSearchEmpty = entries?.length === 0 && searchQuery;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-serif text-foreground">Your Journal</h1>
        
        {!isEmpty && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search past entries..."
                className="pl-10 bg-background border-border/50 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {!isLoadingSummary && summary && (
              <div className="flex gap-4 text-sm text-muted-foreground shrink-0">
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> {summary.totalEntries} entries</span>
              </div>
            )}
          </div>
        )}
      </header>

      {isLoadingEntries ? (
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
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
            Take a few moments at the end of your day to reflect. No pressure, no metrics. Just you and your thoughts.
          </p>
          <Link href="/new" className="inline-flex">
            <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              Start your first entry
            </Button>
          </Link>
        </div>
      ) : isSearchEmpty ? (
        <div className="py-20 text-center space-y-4">
          <p className="text-muted-foreground">No entries found for "{searchQuery}"</p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>Clear search</Button>
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
                      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-primary">
                              {format(parseISO(entry.date), "EEEE, MMM d")}
                            </span>
                            {entry.answers.find(a => a.promptId === "presence")?.answer && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                Presence: {entry.answers.find(a => a.promptId === "presence")?.answer}/10
                              </span>
                            )}
                          </div>
                          
                          <p className="text-foreground/80 line-clamp-2 text-sm leading-relaxed max-w-2xl">
                            {entry.answers.find(a => a.promptId === "joy")?.answer || 
                             entry.answers.find(a => a.promptId === "values")?.answer || 
                             "Empty entry"}
                          </p>
                        </div>
                        
                        <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 hidden sm:block" />
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
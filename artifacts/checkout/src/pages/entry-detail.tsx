import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { useGetEntry, useUpdateEntry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Edit2, Loader2 } from "lucide-react";

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const { data: entry, isLoading, error } = useGetEntry(id, {
    query: {
      enabled: !!id,
      queryKey: ["/api/journal/entries", id]
    }
  });

  const updateEntry = useUpdateEntry();
  const isSaving = updateEntry.isPending;

  // Initialize answers when entry loads
  useEffect(() => {
    if (entry && !isEditing) {
      const initialAnswers: Record<string, string> = {};
      entry.answers.forEach(a => {
        initialAnswers[a.promptId] = a.answer;
      });
      setAnswers(initialAnswers);
    }
  }, [entry, isEditing]);

  const handleSave = () => {
    if (!entry) return;

    const formattedAnswers = entry.answers.map(a => ({
      promptId: a.promptId,
      promptText: a.promptText,
      answer: answers[a.promptId] || ""
    }));

    updateEntry.mutate({
      id,
      data: {
        answers: formattedAnswers
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Changes saved",
          description: "Your entry has been updated.",
        });
        setIsEditing(false);
      },
      onError: () => {
        toast({
          title: "Error saving changes",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (error) {
    return (
      <div className="py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-serif text-destructive">Entry not found</h2>
        <p className="text-muted-foreground">This entry might have been deleted or doesn't exist.</p>
        <Button variant="outline" onClick={() => setLocation("/")}>Return to Journal</Button>
      </div>
    );
  }

  if (isLoading || !entry) {
    return (
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="space-y-4 pb-8 border-b border-border/40">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>
        <div className="space-y-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <nav className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground gap-2 -ml-3">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 rounded-full">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="rounded-full gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save
            </Button>
          </div>
        )}
      </nav>

      <header className="space-y-2 text-center pb-8 border-b border-border/40">
        <p className="text-primary font-medium tracking-wide uppercase text-sm">
          {format(parseISO(entry.createdAt), "h:mm a")}
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-foreground">
          {format(parseISO(entry.date), "EEEE, MMMM do, yyyy")}
        </h1>
      </header>

      <div className="space-y-16">
        {entry.answers.map((answer) => (
          <div key={answer.promptId} className="space-y-4 group">
            <h3 className="text-lg sm:text-xl font-serif font-normal leading-relaxed text-foreground/80">
              {answer.promptText}
            </h3>
            
            {isEditing ? (
              answer.promptId === "presence" ? (
                <div className="pt-6 pb-2 px-2 space-y-6">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[parseInt(answers[answer.promptId] || answer.answer || "5")]}
                    onValueChange={(val) => setAnswers(prev => ({ ...prev, [answer.promptId]: val[0].toString() }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>1 - Distracted</span>
                    <span className="text-primary font-bold text-base">{answers[answer.promptId] || answer.answer || 5}</span>
                    <span>10 - Present</span>
                  </div>
                </div>
              ) : (
                <Textarea
                  className="min-h-[120px] text-base resize-y bg-transparent border-border/50 focus-visible:ring-primary/20 leading-relaxed rounded-xl"
                  value={answers[answer.promptId] !== undefined ? answers[answer.promptId] : answer.answer}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [answer.promptId]: e.target.value }))}
                />
              )
            ) : (
              <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap pl-4 border-l-2 border-primary/20">
                {answer.promptId === "presence" ? (
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium text-lg">
                    {answer.answer}
                  </span>
                ) : (
                  answer.answer || <span className="text-muted-foreground italic">No answer provided.</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

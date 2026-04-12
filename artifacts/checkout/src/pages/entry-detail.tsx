import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { useGetEntry, useUpdateEntry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { JournalPage, JournalLinearea, JournalContentArea } from "@/components/journal-page";
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
      queryKey: ["/api/journal/entries", id],
    },
  });

  const updateEntry = useUpdateEntry();
  const isSaving = updateEntry.isPending;

  useEffect(() => {
    if (entry && !isEditing) {
      const initialAnswers: Record<string, string> = {};
      entry.answers.forEach((a) => {
        initialAnswers[a.promptId] = a.answer;
      });
      setAnswers(initialAnswers);
    }
  }, [entry, isEditing]);

  const handleSave = () => {
    if (!entry) return;

    const formattedAnswers = entry.answers.map((a) => ({
      promptId: a.promptId,
      promptText: a.promptText,
      answer: answers[a.promptId] || "",
    }));

    updateEntry.mutate(
      { id, data: { answers: formattedAnswers } },
      {
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
            variant: "destructive",
          });
        },
      }
    );
  };

  if (error) {
    return (
      <div className="py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-serif text-destructive">Entry not found</h2>
        <p className="text-muted-foreground">This entry might have been deleted or doesn't exist.</p>
        <Button variant="outline" onClick={() => setLocation("/")}>
          Return to Journal
        </Button>
      </div>
    );
  }

  if (isLoading || !entry) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4 pb-6">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>
        <Skeleton className="h-96 w-full rounded-sm" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <nav className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/")}
          className="text-muted-foreground hover:text-foreground gap-2 -ml-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2 rounded-full"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        )}
      </nav>

      <header className="space-y-1 text-center">
        <p className="text-primary font-medium tracking-widest uppercase text-xs">
          {format(parseISO(entry.createdAt), "h:mm a")}
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-foreground">
          {format(parseISO(entry.date + "T12:00:00Z"), "EEEE, MMMM do, yyyy")}
        </h1>
      </header>

      <JournalPage>
        {entry.answers.map((answer, index) => (
          <div key={answer.promptId}>
            {index > 0 && <hr className="journal-prompt-divider" />}

            <span className="journal-prompt-label">{answer.promptText}</span>

            {isEditing ? (
              answer.promptId === "presence" ? (
                <div style={{ lineHeight: "2rem", paddingBottom: "1rem" }} className="space-y-3">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[parseInt(answers[answer.promptId] || answer.answer || "5")]}
                    onValueChange={(val) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [answer.promptId]: val[0].toString(),
                      }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 — Distracted</span>
                    <span className="text-primary font-semibold text-sm font-serif">
                      {answers[answer.promptId] || answer.answer || 5}
                    </span>
                    <span>10 — Present</span>
                  </div>
                </div>
              ) : (
                <JournalLinearea
                  minRows={3}
                  value={
                    answers[answer.promptId] !== undefined
                      ? answers[answer.promptId]
                      : answer.answer
                  }
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [answer.promptId]: e.target.value,
                    }))
                  }
                />
              )
            ) : answer.promptId === "presence" ? (
              <JournalContentArea minRows={1}>
                <span className="inline-block px-3 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-base">
                  {answer.answer} / 10
                </span>
              </JournalContentArea>
            ) : (
              <JournalContentArea minRows={3}>
                {answer.answer || (
                  <span className="text-muted-foreground italic text-sm">
                    Nothing written here.
                  </span>
                )}
              </JournalContentArea>
            )}
          </div>
        ))}
      </JournalPage>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useTemplate, useCreateEntry, useDriveStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { JournalPage, JournalLinearea } from "@/components/journal-page";
import { Loader2, Save, AlertCircle } from "lucide-react";

export default function NewEntry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const today = new Date();

  const { data: template, isLoading: isLoadingTemplate } = useTemplate();
  const { data: driveStatus } = useDriveStatus();
  const createEntry = useCreateEntry();
  const isSaving = createEntry.isPending;

  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Initialise presence default
  useEffect(() => {
    if (template && !answers["presence"]) {
      setAnswers((prev) => ({ ...prev, presence: "5" }));
    }
  }, [template]);

  const handleSave = () => {
    createEntry.mutate(
      { date: format(today, "yyyy-MM-dd"), answers },
      {
        onSuccess: (entry) => {
          toast({ title: "Entry saved", description: "Your reflection has been recorded." });
          setLocation(`/entry/${entry.id}`);
        },
        onError: (err) => {
          toast({
            title: "Error saving entry",
            description: err.message || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSaving) handleSave();
      }
      if (e.key === "Escape") {
        const tag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "textarea" && tag !== "input") setLocation("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, answers]);

  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
  const modKey = isMac ? "⌘↵" : "Ctrl+↵";

  if (!driveStatus?.connected) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="mx-auto w-14 h-14 bg-muted rounded-full flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-serif">Connect Google Drive first</h2>
        <p className="text-muted-foreground">
          Your journal entries are stored as markdown files in your Google Drive.
          Connect your account to start writing.
        </p>
        <Button
          size="lg"
          className="rounded-full px-8"
          onClick={() => window.location.href = "/auth/google/connect"}
        >
          Connect Google Drive
        </Button>
      </div>
    );
  }

  if (isLoadingTemplate) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both pb-20">
      <header className="space-y-1 text-center pb-6">
        <p className="text-primary font-medium tracking-widest uppercase text-xs">
          Today's Checkout
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-foreground">
          {format(today, "EEEE, MMMM do, yyyy")}
        </h1>
      </header>

      <JournalPage entryDate={today}>
        {template?.questions.map((question, index) => (
          <div key={question.id}>
            {index > 0 && <hr className="journal-prompt-divider" />}

            <span className="journal-prompt-label">{question.title}</span>

            {question.example && (
              <p className="text-xs text-muted-foreground/60 mb-1 italic">{question.example}</p>
            )}

            {question.type === "number" ? (
              <div style={{ lineHeight: "2rem", paddingBottom: "1rem" }} className="space-y-3">
                <Slider
                  id={question.id}
                  min={question.min ?? 1}
                  max={question.max ?? 10}
                  step={1}
                  value={[parseInt(answers[question.id] || "5")]}
                  onValueChange={(val) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: val[0].toString() }))
                  }
                  className="w-full"
                />
                <div className="grid grid-cols-3 text-xs text-muted-foreground">
                  <span>1 — Distracted</span>
                  <span className="text-primary font-semibold text-sm font-serif text-center">
                    {answers[question.id] || 5}
                  </span>
                  <span className="text-right">10 — Present</span>
                </div>
              </div>
            ) : (
              <JournalLinearea
                id={question.id}
                placeholder={question.prompt}
                minRows={3}
                value={answers[question.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                }
              />
            )}
          </div>
        ))}
      </JournalPage>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full font-medium"
          onClick={() => setLocation("/")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          size="lg"
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 flex items-center gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save Entry
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground/50 tracking-wide select-none -mt-2">
        Tab between fields · {modKey} save
      </p>
    </div>
  );
}

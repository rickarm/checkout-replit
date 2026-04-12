import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useCreateEntry, useGetStorageSettings } from "@workspace/api-client-react";
import { prompts } from "@/lib/prompts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { JournalPage, JournalLinearea } from "@/components/journal-page";
import { Loader2, Save } from "lucide-react";

export default function NewEntry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const today = new Date();

  const [answers, setAnswers] = useState<Record<string, string>>({
    presence: "5",
  });

  const createEntry = useCreateEntry();
  const isSaving = createEntry.isPending;

  const { data: settings } = useGetStorageSettings({
    query: { queryKey: ["/api/journal/settings"] }
  });
  const personalValues = settings?.personalValues ?? [];

  const handleSave = () => {
    const formattedAnswers = prompts.map((prompt) => ({
      promptId: prompt.id,
      promptText: prompt.text,
      answer: answers[prompt.id] || "",
    }));

    createEntry.mutate(
      {
        data: {
          date: format(today, "yyyy-MM-dd"),
          template: "daily_checkout",
          answers: formattedAnswers,
        },
      },
      {
        onSuccess: (entry) => {
          toast({
            title: "Entry saved",
            description: "Your reflection has been recorded.",
          });
          setLocation(`/entry/${entry.id}`);
        },
        onError: () => {
          toast({
            title: "Error saving entry",
            description: "Something went wrong. Please try again.",
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
        return;
      }

      if (e.key === "Escape") {
        const tag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "textarea" && tag !== "input") {
          setLocation("/");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, answers]);

  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
  const modKey = isMac ? "⌘↵" : "Ctrl+↵";

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

      <JournalPage>
        {prompts.map((prompt, index) => (
          <div key={prompt.id}>
            {index > 0 && <hr className="journal-prompt-divider" />}

            <span className="journal-prompt-label">{prompt.text}</span>

            {prompt.id === "values" && personalValues.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-2">
                {personalValues.map((val) => (
                  <span
                    key={val}
                    className="inline-block px-2.5 py-0.5 rounded-full bg-primary/8 border border-primary/20 text-primary/70 text-xs font-medium"
                  >
                    {val}
                  </span>
                ))}
              </div>
            )}

            {prompt.type === "slider" ? (
              <div
                style={{ lineHeight: "2rem", paddingBottom: "1rem" }}
                className="space-y-3"
              >
                <Slider
                  id={prompt.id}
                  min={prompt.min}
                  max={prompt.max}
                  step={1}
                  value={[parseInt(answers[prompt.id] || "5")]}
                  onValueChange={(val) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [prompt.id]: val[0].toString(),
                    }))
                  }
                  className="w-full"
                />
                <div className="grid grid-cols-3 text-xs text-muted-foreground">
                  <span>1 — Distracted</span>
                  <span className="text-primary font-semibold text-sm font-serif text-center">
                    {answers[prompt.id] || 5}
                  </span>
                  <span className="text-right">10 — Present</span>
                </div>
              </div>
            ) : (
              <JournalLinearea
                id={prompt.id}
                placeholder={prompt.placeholder}
                minRows={3}
                value={answers[prompt.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [prompt.id]: e.target.value,
                  }))
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
        Tab between fields  ·  {modKey} save
      </p>
    </div>
  );
}

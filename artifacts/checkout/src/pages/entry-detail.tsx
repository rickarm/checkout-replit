import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { useEntry, useEntries, useUpdateEntry, useTemplate } from "@/lib/api";
import type { EntrySection } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { JournalPage, JournalLinearea, JournalContentArea } from "@/components/journal-page";
import { ArrowLeft, ArrowRight, Check, Edit2, Loader2 } from "lucide-react";

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => { setIsEditing(false); }, [id]);

  const { data: entry, isLoading, error } = useEntry(id);
  const { data: template } = useTemplate();
  const { data: allData } = useEntries();
  const allEntries = allData?.entries ?? [];

  const currentIndex = allEntries.findIndex((e) => e.id === id);
  const newerEntry = currentIndex > 0 ? allEntries[currentIndex - 1] : null;
  const olderEntry = currentIndex >= 0 && currentIndex < allEntries.length - 1
    ? allEntries[currentIndex + 1]
    : null;

  const updateEntry = useUpdateEntry();
  const isSaving = updateEntry.isPending;

  // When we enter edit mode, build answers from sections + template
  useEffect(() => {
    if (!entry || !template || !isEditing) return;
    // Match sections by title to template questions to reconstruct answer map
    const mapped: Record<string, string> = {};
    template.questions.forEach((q) => {
      const section = entry.sections.find((s: EntrySection) => s.title === q.title);
      mapped[q.id] = section ? section.content : "";
    });
    setAnswers(mapped);
  }, [entry, template, isEditing]);

  const handleSave = useCallback(() => {
    if (!id) return;
    updateEntry.mutate(
      { id, answers },
      {
        onSuccess: () => {
          toast({ title: "Changes saved", description: "Your entry has been updated." });
          setIsEditing(false);
        },
        onError: (err) => {
          toast({
            title: "Error saving changes",
            description: err.message || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }, [id, answers, updateEntry, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
      const inField = tag === "input" || tag === "textarea" || tag === "select";

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (isEditing && !isSaving) handleSave();
        return;
      }
      if (e.key === "Escape" && isEditing) {
        e.preventDefault();
        setIsEditing(false);
        return;
      }
      if (inField) return;
      if (e.key === "e" && !isEditing) { e.preventDefault(); setIsEditing(true); return; }
      if (e.key === "ArrowLeft" && olderEntry) { e.preventDefault(); setLocation(`/entry/${olderEntry.id}`); }
      if (e.key === "ArrowRight" && newerEntry) { e.preventDefault(); setLocation(`/entry/${newerEntry.id}`); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, isSaving, olderEntry, newerEntry, handleSave, setLocation]);

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
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4 pb-6">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>
        <Skeleton className="h-96 w-full rounded-sm" />
      </div>
    );
  }

  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
  const modKey = isMac ? "⌘↵" : "Ctrl+↵";
  const entryDateObj = parseISO(entry.date + "T12:00:00Z");

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Nav */}
      <nav className="flex items-center justify-between">
        <Button
          variant="ghost" size="sm"
          onClick={() => setLocation("/")}
          className="text-muted-foreground hover:text-foreground gap-2 -ml-3"
        >
          <ArrowLeft className="h-4 w-4" /> All entries
        </Button>

        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 rounded-full">
            <Edit2 className="h-4 w-4" /> Edit
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

      {/* Date header */}
      <header className="space-y-1 text-center">
        <p className="text-primary font-medium tracking-widest uppercase text-xs">Evening Checkout</p>
        <h1 className="text-3xl sm:text-4xl font-serif text-foreground">
          {format(entryDateObj, "EEEE, MMMM do, yyyy")}
        </h1>
      </header>

      {/* Journal paper */}
      <JournalPage entryDate={entryDateObj}>
        {isEditing && template ? (
          // Edit mode — render from template questions
          template.questions.map((question, index) => (
            <div key={question.id}>
              {index > 0 && <hr className="journal-prompt-divider" />}
              <span className="journal-prompt-label">{question.title}</span>

              {question.type === "number" ? (
                <div style={{ lineHeight: "2rem", paddingBottom: "1rem" }} className="space-y-3">
                  <Slider
                    min={question.min ?? 1} max={question.max ?? 10} step={1}
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
                  minRows={3}
                  value={answers[question.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                  }
                />
              )}
            </div>
          ))
        ) : (
          // Read mode — render from sections
          entry.sections.map((section: EntrySection, index: number) => (
            <div key={index}>
              {index > 0 && <hr className="journal-prompt-divider" />}
              <span className="journal-prompt-label">{section.title}</span>
              <JournalContentArea minRows={section.content ? 2 : 1}>
                {section.content || (
                  <span className="text-muted-foreground italic text-sm">Nothing written here.</span>
                )}
              </JournalContentArea>
            </div>
          ))
        )}
      </JournalPage>

      {/* Entry navigation */}
      {(olderEntry || newerEntry) && (
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          {olderEntry ? (
            <button
              onClick={() => setLocation(`/entry/${olderEntry.id}`)}
              className="group flex items-center gap-2 text-left text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <ArrowLeft className="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
              <span className="flex flex-col">
                <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">Older</span>
                <span className="text-sm font-serif">{format(parseISO(olderEntry.date + "T12:00:00Z"), "MMM d, yyyy")}</span>
              </span>
            </button>
          ) : <div />}

          {newerEntry ? (
            <button
              onClick={() => setLocation(`/entry/${newerEntry.id}`)}
              className="group flex items-center gap-2 text-right text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <span className="flex flex-col">
                <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">Newer</span>
                <span className="text-sm font-serif">{format(parseISO(newerEntry.date + "T12:00:00Z"), "MMM d, yyyy")}</span>
              </span>
              <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : <div />}
        </div>
      )}

      <div className="text-center">
        {!isEditing ? (
          <p className="text-xs text-muted-foreground/50 tracking-wide select-none">
            {olderEntry && "← older"}
            {olderEntry && newerEntry && "  ·  "}
            {newerEntry && "newer →"}
            {(olderEntry || newerEntry) && "  ·  "}
            E edit
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/50 tracking-wide select-none">
            Esc cancel · {modKey} save
          </p>
        )}
      </div>
    </div>
  );
}

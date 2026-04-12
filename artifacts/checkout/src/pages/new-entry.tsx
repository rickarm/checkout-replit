import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useCreateEntry } from "@workspace/api-client-react";
import { prompts } from "@/lib/prompts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function NewEntry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const today = new Date();
  
  const [answers, setAnswers] = useState<Record<string, string>>({
    presence: "5"
  });

  const createEntry = useCreateEntry();
  const isSaving = createEntry.isPending;

  const handleSave = () => {
    const formattedAnswers = prompts.map(prompt => ({
      promptId: prompt.id,
      promptText: prompt.text,
      answer: answers[prompt.id] || ""
    }));

    createEntry.mutate({
      data: {
        date: format(today, "yyyy-MM-dd"),
        template: "daily_checkout",
        answers: formattedAnswers
      }
    }, {
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
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both pb-20">
      <header className="space-y-2 text-center pb-8 border-b border-border/40">
        <p className="text-primary font-medium tracking-wide uppercase text-sm">Today's Checkout</p>
        <h1 className="text-3xl sm:text-4xl font-serif text-foreground">
          {format(today, "EEEE, MMMM do, yyyy")}
        </h1>
      </header>

      <div className="space-y-16">
        {prompts.map((prompt, index) => (
          <div key={prompt.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${150 * (index + 1)}ms`, animationFillMode: 'both' }}>
            <Label htmlFor={prompt.id} className="text-lg sm:text-xl font-serif font-normal leading-relaxed text-foreground block">
              {prompt.text}
            </Label>
            
            {prompt.type === "slider" ? (
              <div className="pt-6 pb-2 px-2 space-y-6">
                <Slider
                  id={prompt.id}
                  min={prompt.min}
                  max={prompt.max}
                  step={1}
                  value={[parseInt(answers[prompt.id] || "5")]}
                  onValueChange={(val) => setAnswers(prev => ({ ...prev, [prompt.id]: val[0].toString() }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>1 - Distracted</span>
                  <span className="text-primary font-bold text-base">{answers[prompt.id] || 5}</span>
                  <span>10 - Present</span>
                </div>
              </div>
            ) : (
              <Textarea
                id={prompt.id}
                placeholder={prompt.placeholder}
                className="min-h-[120px] text-base resize-y bg-transparent border-border/50 focus-visible:ring-primary/20 leading-relaxed rounded-xl placeholder:text-muted-foreground/60"
                value={answers[prompt.id] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [prompt.id]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-end gap-4">
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
    </div>
  );
}

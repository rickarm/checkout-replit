import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetStorageSettings, useUpdateStorageSettings, StorageSettingsBackend } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Cloud, Loader2, Plus, X, Check } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { THEMES, ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

function ThemeSwatch({ theme, selected, onClick }: {
  theme: typeof THEMES[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-0 rounded-xl overflow-hidden border-2 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary shadow-md scale-[1.02]" : "border-border/60 hover:border-primary/40 hover:shadow-sm"
      )}
      aria-pressed={selected}
      aria-label={`Select ${theme.name} theme`}
    >
      {/* Paper preview */}
      <div
        className="h-24 w-full relative"
        style={{ backgroundColor: theme.preview.bg }}
      >
        {/* Margin line */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px]"
          style={{ left: "2.2rem", backgroundColor: theme.preview.marginLine }}
        />
        {/* Ruled lines */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${i * 22}px`,
              backgroundColor: theme.preview.ruleLine,
            }}
          />
        ))}
        {/* Simulated handwritten text */}
        <div className="absolute left-10 right-3 top-3 flex flex-col gap-[10px]">
          {[80, 65, 72].map((w, i) => (
            <div
              key={i}
              className="h-[6px] rounded-full opacity-40"
              style={{ width: `${w}%`, backgroundColor: theme.preview.ink }}
            />
          ))}
        </div>
        {/* Primary accent dot (top-right corner) */}
        <div
          className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full opacity-80"
          style={{ backgroundColor: theme.preview.primary }}
        />
        {/* Selection checkmark */}
        {selected && (
          <div
            className="absolute bottom-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.preview.primary }}
          >
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      {/* Label row */}
      <div
        className="px-3 py-2.5 border-t"
        style={{
          backgroundColor: theme.preview.bg,
          borderColor: theme.preview.ruleLine,
        }}
      >
        <p
          className="text-sm font-semibold leading-tight"
          style={{ color: theme.preview.ink }}
        >
          {theme.name}
        </p>
        <p
          className="text-xs leading-snug mt-0.5 opacity-70"
          style={{ color: theme.preview.ink }}
        >
          {theme.description}
        </p>
      </div>
    </button>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme: currentTheme, setTheme } = useTheme();

  const { data: settings, isLoading } = useGetStorageSettings({
    query: { queryKey: ["/api/journal/settings"] }
  });

  const updateSettings = useUpdateStorageSettings();
  const isSaving = updateSettings.isPending;

  const [backend, setBackend] = useState<StorageSettingsBackend>("local");
  const [personalValues, setPersonalValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (settings) {
      setBackend(settings.backend as StorageSettingsBackend);
      setPersonalValues(settings.personalValues ?? []);
    }
  }, [settings]);

  const handleAddValue = () => {
    const trimmed = newValue.trim();
    if (!trimmed || personalValues.includes(trimmed)) return;
    setPersonalValues((prev) => [...prev, trimmed]);
    setNewValue("");
  };

  const handleRemoveValue = (val: string) => {
    setPersonalValues((prev) => prev.filter((v) => v !== val));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue();
    }
  };

  const hasChanges =
    backend !== settings?.backend ||
    JSON.stringify(personalValues) !== JSON.stringify(settings?.personalValues ?? []);

  const handleSave = () => {
    updateSettings.mutate({
      data: {
        backend,
        localPath: settings?.localPath,
        googleDriveFolderId: settings?.googleDriveFolderId,
        personalValues,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/journal/settings"] });
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated.",
        });
      },
      onError: () => {
        toast({
          title: "Error saving settings",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="space-y-2">
        <h1 className="text-3xl font-serif text-foreground">Settings</h1>
        <p className="text-muted-foreground text-lg">Your journal lives in files you control.</p>
      </header>

      {/* Appearance / Theme */}
      <Card className="border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <CardTitle className="font-serif text-xl">Appearance</CardTitle>
          <CardDescription className="text-base">
            Choose how your journal looks. The theme is saved on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            {THEMES.map((t) => (
              <ThemeSwatch
                key={t.id}
                theme={t}
                selected={currentTheme === t.id}
                onClick={() => setTheme(t.id as ThemeId)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Values */}
      <Card className="border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <CardTitle className="font-serif text-xl">Personal Values</CardTitle>
          <CardDescription className="text-base">
            These appear as a reminder under the values prompt in every entry.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {personalValues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {personalValues.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {val}
                  <button
                    onClick={() => handleRemoveValue(val)}
                    className="hover:text-primary/60 transition-colors focus:outline-none"
                    aria-label={`Remove ${val}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {personalValues.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No values added yet. Add one below.
            </p>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="e.g. Courage, Kindness, Growth…"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-full"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddValue}
              disabled={!newValue.trim()}
              className="rounded-full flex-shrink-0"
              aria-label="Add value"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Storage Location */}
      <Card className="border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <CardTitle className="font-serif text-xl">Storage Location</CardTitle>
          <CardDescription className="text-base">
            Choose where Checkout stores your entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <RadioGroup
            value={backend}
            onValueChange={(val) => setBackend(val as StorageSettingsBackend)}
            className="space-y-4"
          >
            <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${backend === "local" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"}`}>
              <RadioGroupItem value="local" id="local" className="mt-1" />
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="local" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                  <HardDrive className="h-4 w-4 text-primary" />
                  Local Files
                </Label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Store entries as markdown files on your device. Complete privacy and ownership.
                </p>
                {settings?.localPath && backend === "local" && (
                  <div className="mt-2 p-2 bg-background rounded text-xs font-mono text-muted-foreground border border-border/50">
                    {settings.localPath}
                  </div>
                )}
              </div>
            </div>

            <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${backend === "google-drive" ? "border-primary bg-primary/5" : "border-border/50 opacity-80"}`}>
              <RadioGroupItem value="google-drive" id="google-drive" className="mt-1" disabled />
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="google-drive" className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                    <Cloud className="h-4 w-4" />
                    Google Drive
                  </Label>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Google Drive keeps your journal portable and accessible anywhere.
                </p>
                <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                  Connect Google Drive
                </Button>
              </div>
            </div>

            <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${backend === "mock" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"}`}>
              <RadioGroupItem value="mock" id="mock" className="mt-1" />
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="mock" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                  Memory (Mock)
                </Label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Entries are stored in memory and will be lost on restart. Good for testing.
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="rounded-full px-8 font-medium"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}

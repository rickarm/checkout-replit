import { useTheme } from "@/hooks/use-theme";
import { THEMES, ThemeId } from "@/lib/themes";
import { useDriveStatus } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Cloud, Loader2, Link as LinkIcon } from "lucide-react";

function ThemeSwatch({
  theme,
  selected,
  onClick,
}: {
  theme: typeof THEMES[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-0 rounded-xl overflow-hidden border-2 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary shadow-md scale-[1.02]"
          : "border-border/60 hover:border-primary/40 hover:shadow-sm"
      )}
      aria-pressed={selected}
      aria-label={`Select ${theme.name} theme`}
    >
      <div className="h-24 w-full relative" style={{ backgroundColor: theme.preview.bg }}>
        <div
          className="absolute top-0 bottom-0 w-[1.5px]"
          style={{ left: "2.2rem", backgroundColor: theme.preview.marginLine }}
        />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{ top: `${i * 22}px`, backgroundColor: theme.preview.ruleLine }}
          />
        ))}
        <div className="absolute left-10 right-3 top-3 flex flex-col gap-[10px]">
          {[80, 65, 72].map((w, i) => (
            <div
              key={i}
              className="h-[6px] rounded-full opacity-40"
              style={{ width: `${w}%`, backgroundColor: theme.preview.ink }}
            />
          ))}
        </div>
        <div
          className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full opacity-80"
          style={{ backgroundColor: theme.preview.primary }}
        />
        {selected && (
          <div
            className="absolute bottom-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.preview.primary }}
          >
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <div
        className="px-3 py-2.5 border-t"
        style={{ backgroundColor: theme.preview.bg, borderColor: theme.preview.ruleLine }}
      >
        <p className="text-sm font-semibold leading-tight" style={{ color: theme.preview.ink }}>
          {theme.name}
        </p>
        <p className="text-xs leading-snug mt-0.5 opacity-70" style={{ color: theme.preview.ink }}>
          {theme.description}
        </p>
      </div>
    </button>
  );
}

export default function Settings() {
  const { theme: currentTheme, setTheme } = useTheme();
  const { data: driveStatus, isLoading: isCheckingDrive } = useDriveStatus();

  const handleConnect = () => {
    // Relative URL — the Replit proxy routes /auth/google/* to the API server.
    window.location.href = "/auth/google/connect";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="space-y-2">
        <h1 className="text-3xl font-serif text-foreground">Settings</h1>
        <p className="text-muted-foreground text-lg">Your journal lives in your Google Drive.</p>
      </header>

      {/* Google Drive */}
      <Card className="border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Drive
          </CardTitle>
          <CardDescription className="text-base">
            Your journal entries are stored as markdown files in a Checkout folder in your Drive.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isCheckingDrive ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Checking connection…</span>
            </div>
          ) : driveStatus?.connected ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Connected</p>
                {driveStatus.folderId && (
                  <p className="text-xs text-muted-foreground">
                    Folder ID: {driveStatus.folderId}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Google account to start storing journal entries in your Drive.
              </p>
              <Button onClick={handleConnect} className="rounded-full gap-2">
                <LinkIcon className="h-4 w-4" />
                Connect Google Drive
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <CardTitle className="font-serif text-xl">Appearance</CardTitle>
          <CardDescription className="text-base">
            Choose how your journal looks. The theme is saved on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </div>
  );
}

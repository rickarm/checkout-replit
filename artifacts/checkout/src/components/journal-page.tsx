import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@clerk/react";
import { format } from "date-fns";

interface JournalPageProps {
  children: React.ReactNode;
  className?: string;
  entryDate?: Date;
}

function WPTabRuler() {
  const ruler =
    "\u00b7\u00b7\u00b7\u00b7\u00b7L\u00b7\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7\u00b7t\u00b7\u00b7\u00b7\u00b7R\u00b7\u00b7\u00b7\u00b7";
  return (
    <div className="wp-tab-ruler" aria-hidden="true">
      {ruler}
    </div>
  );
}

function WPTitleBanner({ name }: { name: string }) {
  const title = `PERSONAL JOURNAL OF ${name.toUpperCase()}, M.D.`;
  const dashCount = Math.max(0, Math.floor((60 - title.length) / 2));
  const dashes = "=".repeat(dashCount);
  return (
    <div className="wp-title-banner" aria-hidden="true">
      {dashes}{title}{dashes}
    </div>
  );
}

function WPStatusBar({ date }: { date?: Date }) {
  const now = date ?? new Date();
  const dateStr = format(now, "MMMM d, yyyy").toUpperCase();
  return (
    <div className="wp-status-bar" aria-hidden="true">
      <div className="wp-status-commands">
        <div>Alt keys: Copy Delete Insert Vsearch Wordspell rePlace Bold Undl Plain Quit</div>
        <div>ESC-menu&nbsp; Save Retrieve coMbine iNdent Justify Tabmargin Kpage Graph Xdelpage</div>
      </div>
      <div className="wp-status-info">
        <span>JOURNAL.WP*</span>
        <span>PG 1&nbsp;&nbsp; LN 1&nbsp;&nbsp; COL 1&nbsp;&nbsp;&nbsp;&nbsp; {dateStr}</span>
        <span>WORD</span>
      </div>
    </div>
  );
}

export function JournalPage({ children, className, entryDate }: JournalPageProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const isTerminal = theme === "terminal";

  if (isTerminal) {
    const name =
      user?.fullName ||
      user?.firstName ||
      user?.username ||
      "Doogie Howser";
    return (
      <div className={cn("journal-paper relative wp-journal", className)}>
        <WPTabRuler />
        <WPTitleBanner name={name} />
        <div className="wp-content">{children}</div>
        <WPStatusBar date={entryDate} />
      </div>
    );
  }

  return (
    <div className={cn("journal-paper relative rounded-sm", className)}>
      {children}
    </div>
  );
}

interface JournalLineareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

export function JournalLinearea({
  className,
  minRows = 3,
  style,
  ...props
}: JournalLineareaProps) {
  return (
    <textarea
      rows={minRows}
      className={cn(
        "journal-textarea journal-lined w-full bg-transparent border-none outline-none resize-none",
        "text-foreground placeholder:text-muted-foreground/50",
        "focus:outline-none focus:ring-0",
        className
      )}
      style={{
        minHeight: `${minRows * 2}rem`,
        ...style,
      }}
      {...props}
    />
  );
}

interface JournalContentAreaProps {
  children: React.ReactNode;
  className?: string;
  minRows?: number;
}

export function JournalContentArea({
  children,
  className,
  minRows = 3,
}: JournalContentAreaProps) {
  return (
    <div
      className={cn(
        "journal-lined font-serif text-foreground whitespace-pre-wrap",
        className
      )}
      style={{
        fontSize: "1rem",
        minHeight: `${minRows * 2}rem`,
      }}
    >
      {children}
    </div>
  );
}

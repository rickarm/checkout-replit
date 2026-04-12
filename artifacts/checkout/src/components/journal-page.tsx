import { cn } from "@/lib/utils";

interface JournalPageProps {
  children: React.ReactNode;
  className?: string;
}

export function JournalPage({ children, className }: JournalPageProps) {
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

/**
 * Editable textarea that draws its own ruled lines — alignment is always
 * correct because the grid starts from the element's own top edge.
 */
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

/**
 * Read-only content block with identical ruled lines to JournalLinearea.
 * Use this in view mode so the text sits on the same lines as when editing.
 */
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

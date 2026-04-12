import { cn } from "@/lib/utils";

interface JournalPageProps {
  children: React.ReactNode;
  className?: string;
}

export function JournalPage({ children, className }: JournalPageProps) {
  return (
    <div
      className={cn("journal-paper relative rounded-sm", className)}
      style={{
        /* ruled lines + left margin line */
        backgroundImage: `
          repeating-linear-gradient(
            to bottom,
            transparent,
            transparent calc(2rem - 1px),
            rgba(160, 130, 100, 0.22) calc(2rem - 1px),
            rgba(160, 130, 100, 0.22) 2rem
          ),
          linear-gradient(
            to right,
            transparent 3.25rem,
            rgba(195, 90, 80, 0.3) 3.25rem,
            rgba(195, 90, 80, 0.3) calc(3.25rem + 1.5px),
            transparent calc(3.25rem + 1.5px)
          )
        `,
        backgroundSize: "100% 2rem, 100% 100%",
        backgroundAttachment: "local",
      }}
    >
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
  ...props
}: JournalLineareaProps) {
  return (
    <textarea
      rows={minRows}
      className={cn(
        "journal-textarea w-full bg-transparent border-none outline-none resize-none",
        "text-foreground placeholder:text-muted-foreground/50",
        "focus:outline-none focus:ring-0",
        className
      )}
      style={{
        lineHeight: "2rem",
        minHeight: `${minRows * 2}rem`,
        paddingTop: "0.125rem",
      }}
      {...props}
    />
  );
}

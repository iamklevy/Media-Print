import { cn } from "@/lib/utils";

export function Wrap({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-[min(1200px,100%-2.5rem)]", className)}>{children}</div>;
}

export function Section({
  tint,
  ink,
  className,
  children,
}: {
  tint?: boolean;
  ink?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "py-16 md:py-24 lg:py-28",
        tint && "bg-paper-2",
        ink && "bg-ink text-paper",
        className,
      )}
    >
      <Wrap>{children}</Wrap>
    </section>
  );
}

export function Eyebrow({ children, onInk }: { children: React.ReactNode; onInk?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[0.8rem] font-bold uppercase tracking-[0.12em]",
        onInk ? "text-accent" : "text-accent-2",
      )}
    >
      <span className="inline-block h-0.5 w-6 rounded-sm bg-accent" />
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  onInk,
  action,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  onInk?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-10 md:mb-14", action && "flex flex-wrap items-end justify-between gap-6")}>
      <div className="max-w-[62ch]">
        {eyebrow && <Eyebrow onInk={onInk}>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 text-[clamp(1.75rem,1.2rem+2.2vw,2.85rem)]">{title}</h2>
        {lead && (
          <p className={cn("mt-4 text-[clamp(1.02rem,0.96rem+0.3vw,1.2rem)]", onInk ? "text-paper/72" : "text-muted")}>
            {lead}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

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
        "py-7 md:py-9 lg:py-11",
        tint && "bg-paper-2",
        ink && "bg-ink text-paper",
        className,
      )}
    >
      <Wrap>{children}</Wrap>
    </section>
  );
}

export function SectionHead({
  title,
  lead,
  onInk,
  action,
  center,
  display,
}: {
  title: string;
  lead?: string;
  onInk?: boolean;
  action?: React.ReactNode;
  center?: boolean;
  /** Set the title in the homepage display serif (needs displayFontVars on an ancestor). */
  display?: boolean;
}) {
  return (
    <div className={cn("mb-10 md:mb-14", action && "flex flex-wrap items-end justify-between gap-6")}>
      <div className={cn("max-w-[62ch]", center && "mx-auto text-center")}>
        <h2 className={cn("text-[clamp(1.75rem,1.2rem+2.2vw,2.85rem)]", display && "font-display rtl:text-[clamp(2rem,1.4rem+2.4vw,3.15rem)]")}>{title}</h2>
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

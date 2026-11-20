import { cn } from "@/lib/utils";
import { Reveal } from "./motion";

export function Wrap({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-[min(1200px,100%-2.5rem)]", className)}>{children}</div>;
}

/** A page section with plenty of air. `tint` = the soft rose ground, otherwise cream. */
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

/** Centred display-serif section title, with an optional short line under it. Fades in. */
export function SectionHead({
  title,
  lead,
  onInk,
}: {
  title: string;
  lead?: string;
  onInk?: boolean;
}) {
  return (
    <Reveal y={16} className="mx-auto mb-12 max-w-[34ch] text-center md:mb-16">
      <h2 className="font-display text-[clamp(1.85rem,1.3rem+2.2vw,2.9rem)] text-balance rtl:text-[clamp(2.1rem,1.5rem+2.4vw,3.2rem)]">
        {title}
      </h2>
      {lead && (
        <p className={cn("mx-auto mt-4 max-w-[46ch] text-[1rem] leading-relaxed", onInk ? "text-paper/72" : "text-muted")}>
          {lead}
        </p>
      )}
    </Reveal>
  );
}

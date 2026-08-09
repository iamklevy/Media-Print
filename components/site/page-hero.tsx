import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Wrap } from "./section";

export function PageHero({
  crumb,
  title,
  lead,
}: {
  crumb: string;
  title: string;
  lead?: string;
}) {
  const t = useTranslations();
  return (
    <section className="border-b border-line bg-paper-2 py-12 md:py-16">
      <Wrap>
        <div className="mb-4 flex items-center gap-2 text-[0.87rem] text-muted">
          <Link href="/" className="hover:text-accent-2">
            {t("crumb.home")}
          </Link>
          <ChevronRight className="size-3.5 opacity-50 rtl:rotate-180" />
          <span>{crumb}</span>
        </div>
        <h1 className="text-[clamp(2.15rem,1.35rem+3.4vw,4rem)]">{title}</h1>
        {lead && (
          <p className="mt-4 max-w-[60ch] text-[clamp(1.02rem,0.96rem+0.3vw,1.2rem)] text-muted">
            {lead}
          </p>
        )}
      </Wrap>
    </section>
  );
}

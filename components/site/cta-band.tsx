import { useTranslations } from "next-intl";
import { ArrowRight, Phone } from "lucide-react";
import { WhatsAppIcon } from "./brand-icons";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Wrap } from "./section";
import { SALES_PHONE } from "@/lib/contact";

export function CtaBand() {
  const t = useTranslations();
  return (
    <section className="pb-16 md:pb-24">
      <Wrap>
        <div className="relative isolate overflow-hidden rounded-[30px] bg-ink px-7 py-10 text-paper md:px-16 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/2 -end-[10%] size-[480px] rounded-full bg-[radial-gradient(circle,rgba(221,99,32,0.28),transparent_62%)]"
          />
          <h2 className="relative max-w-[20ch] text-[clamp(1.75rem,1.2rem+2.2vw,2.85rem)]">
            {t("band.h2")}
          </h2>
          <p className="relative mt-4 mb-8 max-w-[54ch] text-paper/72">{t("band.p")}</p>
          <div className="relative flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-paper text-ink hover:bg-white">
              <a href={`https://wa.me/20${SALES_PHONE}`} target="_blank" rel="noopener">
                <WhatsAppIcon className="size-4" />
                {t("cta.whatsapp")}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-paper hover:bg-white/10 hover:text-paper"
            >
              <Link href="/book">
                {t("cta.book")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full text-paper hover:bg-white/10 hover:text-paper"
            >
              <a href={`tel:+2${SALES_PHONE}`}>
                <Phone className="size-4" />
                {t("cta.call")}
              </a>
            </Button>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { SALES_PHONE } from "@/lib/contact";
import { WhatsAppIcon } from "./brand-icons";
import { Wrap } from "./section";
import { Reveal } from "./motion";
import { HERO_BG } from "./home-hero";
import { btnPrimary, btnQuiet } from "./buttons";

/**
 * The closing section on every public page: back to the hero's pink, one line
 * and two ways to reach us (pricing form, WhatsApp).
 */
export function CtaBand() {
  const t = useTranslations();
  return (
    <section
      style={{
        backgroundColor: HERO_BG,
        backgroundImage: `radial-gradient(ellipse 70% 90% at 50% 100%, #fde4de 0%, ${HERO_BG} 55%, #eeb3a7 100%)`,
      }}
      className="py-24 md:py-32"
    >
      <Wrap>
        <Reveal y={16} className="mx-auto flex max-w-[640px] flex-col items-center text-center">
          <h2 className="font-display text-[clamp(1.95rem,1.35rem+2.4vw,3.1rem)] text-balance text-ink rtl:text-[clamp(2.2rem,1.55rem+2.6vw,3.4rem)]">
            {t("band.h2")}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[1rem] leading-relaxed text-[#7a2e3b]/85">{t("band.p")}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className={btnPrimary}>
              {t("cta.quote")}
            </Link>
            <a href={`https://wa.me/20${SALES_PHONE}`} target="_blank" rel="noopener" className={btnQuiet}>
              <WhatsAppIcon className="size-4" />
              {t("cta.whatsapp")}
            </a>
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}

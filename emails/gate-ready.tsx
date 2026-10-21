import { EmailLayout } from "./components/email-layout";
import { Cta, Details, P, Ref, Title } from "./components/ui";
import { isAr } from "./components/brand";

export type Gate = "quote_review" | "artwork_approved" | "sample_approved";

export const GATE_COPY: Record<Gate, { ar: string; en: string }> = {
  quote_review: { ar: "عرض السعر جاهز للمراجعة", en: "Your price quote is ready for review" },
  artwork_approved: { ar: "التصميم جاهز للمراجعة", en: "Your artwork is ready for review" },
  sample_approved: { ar: "العينة جاهزة للمراجعة", en: "Your sample is ready for review" },
};

const STEP_LABEL: Record<Gate, { ar: string; en: string }> = {
  quote_review: { ar: "عرض السعر", en: "Price quote" },
  artwork_approved: { ar: "التصميم", en: "Artwork" },
  sample_approved: { ar: "العينة", en: "Sample" },
};

export type GateReadyProps = {
  locale: string;
  name: string;
  orderNumber: string;
  gate: Gate;
  trackingUrl: string;
};

export default function GateReady({ locale, name, orderNumber, gate, trackingUrl }: GateReadyProps) {
  const ar = isAr(locale);
  const lang = ar ? "ar" : "en";
  const heading = GATE_COPY[gate][lang];
  return (
    <EmailLayout locale={locale} preview={`${heading} — ${orderNumber}`}>
      <Title>{heading}</Title>
      <P>{ar ? `أهلاً ${name}،` : `Hi ${name},`}</P>
      <P>
        {ar
          ? "من فضلك راجعه ووافق عليه أو اطلب تعديلات من صفحة المتابعة."
          : "Please take a look and approve it or request changes from your tracking page."}
      </P>
      <Details
        rows={[
          { label: ar ? "رقم الطلب" : "Order", value: <Ref>{orderNumber}</Ref> },
          { label: ar ? "للمراجعة" : "To review", value: STEP_LABEL[gate][lang] },
        ]}
      />
      <Cta href={trackingUrl}>{ar ? "راجع الطلب" : "Review order"}</Cta>
    </EmailLayout>
  );
}

GateReady.PreviewProps = {
  locale: "en",
  name: "Ahmed",
  orderNumber: "MP-1042",
  gate: "artwork_approved",
  trackingUrl: "https://mediaprint-eg.com/track/abc123",
} satisfies GateReadyProps;

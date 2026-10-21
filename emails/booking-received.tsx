import { SALES_PHONE, formatPhone } from "../lib/contact";
import { EmailLayout } from "./components/email-layout";
import { Details, P, Title } from "./components/ui";
import { isAr } from "./components/brand";

export const BOOKING_MODE_COPY: Record<string, { ar: string; en: string }> = {
  online: { ar: "اجتماع أونلاين (فيديو / مكالمة واتساب)", en: "Online meeting (video / WhatsApp call)" },
  yours: { ar: "في مكتبك — مندوبنا هيزورك", en: "At your office — our rep visits you" },
  ours: { ar: "في مكتبنا — 323 شارع السودان، المهندسين، الجيزة", en: "At our office — 323 Sudan St, Mohandessin, Giza" },
};

export type BookingReceivedProps = {
  locale: string;
  mode: string;
  name: string;
  date: string;
  time: string;
  topic: string | null;
};

export default function BookingReceived({ locale, mode, name, date, time, topic }: BookingReceivedProps) {
  const ar = isAr(locale);
  const where = BOOKING_MODE_COPY[mode]?.[ar ? "ar" : "en"] ?? mode;
  return (
    <EmailLayout
      locale={locale}
      preview={ar ? `طلب اجتماع يوم ${date} الساعة ${time}` : `Meeting request for ${date} at ${time}`}
    >
      <Title>{ar ? "استلمنا طلب الاجتماع" : "We received your meeting request"}</Title>
      <P>{ar ? `أهلاً ${name}،` : `Hi ${name},`}</P>
      <P>
        {ar
          ? "شكراً لحجزك. فريق المبيعات هيتواصل معاك قريب لتأكيد الميعاد."
          : "Thanks for booking. Our sales team will be in touch shortly to confirm the time."}
      </P>
      <Details
        rows={[
          { label: ar ? "الاجتماع" : "Meeting", value: where },
          { label: ar ? "التاريخ" : "Date", value: date, ltr: true },
          { label: ar ? "الوقت" : "Time", value: time, ltr: true },
          ...(topic ? [{ label: ar ? "الموضوع" : "Topic", value: topic }] : []),
        ]}
      />
      <P muted>
        {ar ? "محتاج تغيّر الميعاد؟ كلمنا على " : "Need to change the time? Call us on "}
        <span dir="ltr">{formatPhone(SALES_PHONE)}</span>
        .
      </P>
    </EmailLayout>
  );
}

BookingReceived.PreviewProps = {
  locale: "ar",
  mode: "online",
  name: "أحمد محمود",
  date: "2026-10-24",
  time: "12:00",
  topic: "طلب تغليف جديد",
} satisfies BookingReceivedProps;

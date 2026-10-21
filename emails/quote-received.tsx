import { EmailLayout } from "./components/email-layout";
import { Cta, Details, P, Ref, Title } from "./components/ui";
import { isAr } from "./components/brand";

export type QuoteReceivedProps = {
  locale: string;
  name: string;
  orderNumber: string;
  product: string;
  trackingUrl: string;
};

export default function QuoteReceived({ locale, name, orderNumber, product, trackingUrl }: QuoteReceivedProps) {
  const ar = isAr(locale);
  return (
    <EmailLayout
      locale={locale}
      preview={ar ? `استلمنا طلبك ${orderNumber}` : `We received your request ${orderNumber}`}
    >
      <Title>{ar ? "استلمنا طلبك" : "We've got your request"}</Title>
      <P>{ar ? `أهلاً ${name}،` : `Hi ${name},`}</P>
      <P>
        {ar
          ? "شكراً لطلب عرض السعر. هنراجع التفاصيل ونرجعلك بالأسعار قريب."
          : "Thanks for your quote request. We'll review the details and get back to you with pricing shortly."}
      </P>
      <Details
        rows={[
          { label: ar ? "رقم الطلب" : "Order", value: <Ref>{orderNumber}</Ref> },
          { label: ar ? "المنتج" : "Product", value: product },
        ]}
      />
      <P muted>
        {ar ? "تقدر تتابع حالة طلبك في أي وقت:" : "You can follow your order's status anytime:"}
      </P>
      <Cta href={trackingUrl}>{ar ? "تابع طلبك" : "Track your order"}</Cta>
    </EmailLayout>
  );
}

QuoteReceived.PreviewProps = {
  locale: "ar",
  name: "أحمد محمود",
  orderNumber: "MP-1042",
  product: "شنط بلاستيك مطبوعة",
  trackingUrl: "https://mediaprint-eg.com/ar/track/abc123",
} satisfies QuoteReceivedProps;

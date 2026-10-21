import { EmailLayout } from "./components/email-layout";
import { Cta, Details, P, Ref, Title } from "./components/ui";
import { isAr } from "./components/brand";

export type DeliveredProps = {
  locale: string;
  name: string;
  orderNumber: string;
  trackingUrl: string;
};

export default function Delivered({ locale, name, orderNumber, trackingUrl }: DeliveredProps) {
  const ar = isAr(locale);
  return (
    <EmailLayout
      locale={locale}
      preview={ar ? `طلبك ${orderNumber} اتسلم` : `Your order ${orderNumber} has been delivered`}
    >
      <Title>{ar ? "طلبك اتسلم" : "Your order has been delivered"}</Title>
      <P>{ar ? `أهلاً ${name}،` : `Hi ${name},`}</P>
      <P>{ar ? "طلبك اتسلم بنجاح. تشرفنا نشتغل معاك!" : "Your order has arrived. Thanks for working with us!"}</P>
      <Details rows={[{ label: ar ? "رقم الطلب" : "Order", value: <Ref>{orderNumber}</Ref> }]} />
      <P muted>
        {ar
          ? "ياريت تقيّم تجربتك — بياخد ثانيتين وبيفرق معانا كتير."
          : "We'd love it if you could rate your experience — it only takes a second and helps a lot."}
      </P>
      <Cta href={trackingUrl}>{ar ? "قيّم طلبك" : "Rate your order"}</Cta>
    </EmailLayout>
  );
}

Delivered.PreviewProps = {
  locale: "ar",
  name: "أحمد",
  orderNumber: "MP-1042",
  trackingUrl: "https://mediaprint-eg.com/ar/track/abc123",
} satisfies DeliveredProps;

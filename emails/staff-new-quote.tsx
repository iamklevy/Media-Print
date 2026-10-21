import { Link } from "@react-email/components";

import type { ArtworkFile } from "../lib/orders/types";
import { quantityRangeLabel } from "../lib/orders/quantity";
import { color } from "./components/brand";
import { EmailLayout } from "./components/email-layout";
import { Details, MailLink, P, Quote, Ref, Title } from "./components/ui";

export type StaffNewQuoteProps = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  product_label: string;
  quantity: string;
  notes: string | null;
  customer_artwork_files?: ArtworkFile[];
};

export default function StaffNewQuote(order: StaffNewQuoteProps) {
  const files = (order.customer_artwork_files ?? []).filter((f) => f.url);
  const hasEmail = order.customer_email && order.customer_email !== "—";
  return (
    <EmailLayout locale="en" preview={`${order.customer_name} — ${order.product_label}`}>
      <Title>New quote request</Title>
      <P>
        <Ref>{order.order_number}</Ref>
      </P>
      <Details
        rows={[
          { label: "Name", value: order.customer_name },
          { label: "Phone", value: order.customer_phone, ltr: true },
          { label: "Email", value: hasEmail ? <MailLink email={order.customer_email} /> : "—" },
          { label: "Product", value: order.product_label },
          { label: "Quantity", value: quantityRangeLabel(order.quantity) },
        ]}
      />
      {order.notes && <Quote label="Message">{order.notes}</Quote>}
      {files.length > 0 && (
        <Quote label={`Design file${files.length > 1 ? "s" : ""}`}>
          {files.map((f, i) => (
            <span key={f.url}>
              {i > 0 && <br />}
              <Link href={f.url} style={{ color: color.accent2 }}>
                {f.label ?? f.url}
              </Link>
            </span>
          ))}
        </Quote>
      )}
    </EmailLayout>
  );
}

StaffNewQuote.PreviewProps = {
  order_number: "MP-1042",
  customer_name: "Ahmed Mahmoud",
  customer_phone: "01005750973",
  customer_email: "ahmed@example.com",
  product_label: "Printed plastic bags",
  quantity: "1000_5000",
  notes: "30×40 cm, two print colours, needed before the end of the month.",
  customer_artwork_files: [{ url: "https://example.com/logo.pdf", label: "logo.pdf" }],
} satisfies StaffNewQuoteProps;

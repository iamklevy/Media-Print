import { EmailLayout } from "./components/email-layout";
import { P, Quote, Ref, Title } from "./components/ui";
import { color } from "./components/brand";
import type { Gate } from "./gate-ready";

export type StaffGateResponseProps = {
  order_number: string;
  customer_name: string;
  kind: "approved" | "changes_requested";
  gate: Gate;
  note?: string | null;
};

const GATE_LABEL: Record<Gate, string> = {
  quote_review: "price quote",
  artwork_approved: "artwork",
  sample_approved: "sample",
};

export default function StaffGateResponse({ order_number, customer_name, kind, gate, note }: StaffGateResponseProps) {
  const approved = kind === "approved";
  const action = approved ? `approved the ${GATE_LABEL[gate]}` : `requested changes to the ${GATE_LABEL[gate]}`;
  return (
    <EmailLayout locale="en" preview={`${customer_name} ${action} — ${order_number}`}>
      <span
        style={{
          display: "inline-block",
          marginBottom: 14,
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          backgroundColor: approved ? color.leafSoft : color.accentSoft,
          color: approved ? color.leaf : color.accent2,
        }}
      >
        {approved ? "Approved" : "Changes requested"}
      </span>
      <Title>
        {customer_name} {action}
      </Title>
      <P>
        Order <Ref>{order_number}</Ref>
      </P>
      {note && <Quote label="Customer note">{note}</Quote>}
    </EmailLayout>
  );
}

StaffGateResponse.PreviewProps = {
  order_number: "MP-1042",
  customer_name: "Ahmed Mahmoud",
  kind: "changes_requested",
  gate: "artwork_approved",
  note: "Please make the logo a bit bigger and use the darker blue.",
} satisfies StaffGateResponseProps;

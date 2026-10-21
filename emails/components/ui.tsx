import { Button, Column, Heading, Link, Row, Section, Text } from "@react-email/components";

import { color } from "./brand";

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <Heading as="h1" style={{ margin: "0 0 12px", fontSize: 24, lineHeight: "32px", fontWeight: 800, color: color.ink }}>
      {children}
    </Heading>
  );
}

export function P({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <Text style={{ margin: "0 0 14px", fontSize: 15, lineHeight: "24px", color: muted ? color.muted : color.ink }}>
      {children}
    </Text>
  );
}

/** Small reference chip, e.g. an order number. Always LTR so codes don't scramble in Arabic. */
export function Ref({ children }: { children: React.ReactNode }) {
  return (
    <span
      dir="ltr"
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        backgroundColor: color.accentSoft,
        color: color.accent2,
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {children}
    </span>
  );
}

export function Cta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={{ margin: "24px 0 8px" }}>
      <Button
        href={href}
        style={{
          backgroundColor: color.accent,
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 700,
          padding: "13px 26px",
          borderRadius: 999,
          textDecoration: "none",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

export type Detail = { label: string; value: React.ReactNode; ltr?: boolean };

/** Label/value summary card — booking details, order details, contact info. */
export function Details({ rows }: { rows: Detail[] }) {
  return (
    <Section
      style={{
        margin: "20px 0",
        padding: "6px 18px",
        backgroundColor: color.paper2,
        border: `1px solid ${color.line}`,
        borderRadius: 14,
      }}
    >
      {rows.map((r, i) => (
        <Row key={r.label} style={{ borderTop: i === 0 ? "none" : `1px solid ${color.line}` }}>
          <Column style={{ width: "36%", padding: "11px 0", fontSize: 13, color: color.muted, verticalAlign: "top" }}>
            {r.label}
          </Column>
          <Column style={{ padding: "11px 0", fontSize: 14, fontWeight: 600, color: color.ink, verticalAlign: "top" }}>
            {r.ltr ? <span dir="ltr">{r.value}</span> : r.value}
          </Column>
        </Row>
      ))}
    </Section>
  );
}

/** Highlighted block for free text the customer wrote (notes, change requests). */
export function Quote({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Section
      style={{
        margin: "16px 0",
        padding: "14px 18px",
        backgroundColor: color.accentSoft,
        borderRadius: 14,
      }}
    >
      <Text style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: color.accent2 }}>{label}</Text>
      <Text style={{ margin: 0, fontSize: 14, lineHeight: "22px", color: color.ink, whiteSpace: "pre-line" }}>
        {children}
      </Text>
    </Section>
  );
}

export function MailLink({ email }: { email: string }) {
  return (
    <Link href={`mailto:${email}`} style={{ color: color.accent2 }}>
      {email}
    </Link>
  );
}

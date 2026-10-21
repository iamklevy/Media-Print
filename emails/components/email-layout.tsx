import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";

import { ADDRESS_EN, FACEBOOK, INSTAGRAM, SALES_PHONE, SALES_PHONE_2, formatPhone } from "../../lib/contact";
import { LOGO_URL, SITE_URL, color, fontStack, isAr } from "./brand";

const ADDRESS_AR = "323 شارع السودان، المهندسين، الجيزة";

/** Shared shell for every email: logo header, white card, contact footer. */
export function EmailLayout({
  locale,
  preview,
  children,
}: {
  locale: string;
  preview: string;
  children: React.ReactNode;
}) {
  const ar = isAr(locale);
  const align = ar ? "right" : "left";

  return (
    <Html lang={ar ? "ar" : "en"} dir={ar ? "rtl" : "ltr"}>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: "32px 12px",
          backgroundColor: color.paper2,
          fontFamily: ar ? fontStack.ar : fontStack.en,
          color: color.ink,
        }}
      >
        <Container style={{ maxWidth: 560, width: "100%", margin: "0 auto" }}>
          <Section style={{ padding: "0 4px 20px", textAlign: align }}>
            <Link href={SITE_URL}>
              <Img src={LOGO_URL} width={48} height={48} alt="Media Print Pack" style={{ display: "inline-block" }} />
            </Link>
          </Section>

          <Section
            dir={ar ? "rtl" : "ltr"}
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${color.line}`,
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            <div style={{ height: 4, backgroundColor: color.accent }} />
            <Section style={{ padding: "32px 32px 28px", textAlign: align }}>{children}</Section>
          </Section>

          <Section style={{ padding: "24px 4px 0", textAlign: align }}>
            <Text style={{ margin: 0, fontSize: 13, fontWeight: 700, color: color.ink }}>Media Print Pack</Text>
            <Text style={{ margin: "4px 0 0", fontSize: 12, lineHeight: "20px", color: color.muted }}>
              {ar ? ADDRESS_AR : ADDRESS_EN}
              <br />
              <span dir="ltr">
                {formatPhone(SALES_PHONE)} · {formatPhone(SALES_PHONE_2)}
              </span>
            </Text>
            <Hr style={{ borderColor: color.line, margin: "16px 0" }} />
            <Text style={{ margin: 0, fontSize: 12, color: color.faint }}>
              <Link href={SITE_URL} style={footerLink}>
                mediaprint-eg.com
              </Link>
              {"  ·  "}
              <Link href={FACEBOOK} style={footerLink}>
                Facebook
              </Link>
              {"  ·  "}
              <Link href={INSTAGRAM} style={footerLink}>
                Instagram
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const footerLink = { color: color.muted, textDecoration: "underline" };

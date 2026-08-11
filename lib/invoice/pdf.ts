import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { SALES_PHONE, EMAIL, ADDRESS_EN } from "@/lib/contact";
import type { Order } from "@/lib/orders/types";

const INK = rgb(0.086, 0.075, 0.059);
const MUTED = rgb(0.43, 0.39, 0.35);
const LINE = rgb(0.91, 0.89, 0.84);
const ACCENT = rgb(0.867, 0.388, 0.125);

/**
 * Invoice text is kept English/numeric-only: pdf-lib has no complex text
 * shaping, so Arabic glyphs would render disconnected and reversed.
 */
export async function buildInvoicePdf(order: Order): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 50;
  let y = height - 60;

  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public", "logo.png"));
    const logo = await doc.embedPng(logoBytes);
    const logoSize = 40;
    page.drawImage(logo, { x: marginX, y: y - logoSize + 8, width: logoSize, height: logoSize });
  } catch {
    // logo is a nice-to-have; a missing file must never break invoice generation
  }

  page.drawText("Media Print Pack", { x: marginX + 52, y: y - 6, size: 16, font: bold, color: INK });
  page.drawText(`${ADDRESS_EN}  |  ${SALES_PHONE}  |  ${EMAIL}`, {
    x: marginX + 52,
    y: y - 24,
    size: 9,
    font,
    color: MUTED,
  });

  page.drawText("INVOICE", { x: width - marginX - 90, y: y - 6, size: 18, font: bold, color: ACCENT });
  y -= 70;

  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: LINE });
  y -= 26;

  const dateStr = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date()
  );

  drawRow(page, marginX, width - marginX, y, "Invoice #", order.order_number, bold, font);
  y -= 16;
  drawRow(page, marginX, width - marginX, y, "Date", dateStr, bold, font);
  y -= 30;

  page.drawText("Billed to", { x: marginX, y, size: 10, font: bold, color: MUTED });
  y -= 16;
  page.drawText(order.customer_name, { x: marginX, y, size: 11, font: bold, color: INK });
  y -= 15;
  if (order.customer_company) {
    page.drawText(order.customer_company, { x: marginX, y, size: 10, font, color: MUTED });
    y -= 15;
  }
  page.drawText(order.customer_phone, { x: marginX, y, size: 10, font, color: MUTED });
  y -= 36;

  const cols = { desc: marginX, qty: width - marginX - 220, unit: width - marginX - 140, total: width - marginX - 60 };
  page.drawRectangle({ x: marginX, y: y - 6, width: width - marginX * 2, height: 22, color: rgb(0.969, 0.949, 0.918) });
  page.drawText("Description", { x: cols.desc + 6, y, size: 9, font: bold, color: INK });
  page.drawText("Qty", { x: cols.qty, y, size: 9, font: bold, color: INK });
  page.drawText("Unit price", { x: cols.unit, y, size: 9, font: bold, color: INK });
  page.drawText("Total", { x: cols.total, y, size: 9, font: bold, color: INK });
  y -= 30;

  page.drawText(order.product_label, { x: cols.desc + 6, y, size: 10, font, color: INK });
  page.drawText(order.quantity, { x: cols.qty, y, size: 10, font, color: INK });
  page.drawText(order.unit_price != null ? money(order.unit_price, order.currency) : "-", {
    x: cols.unit,
    y,
    size: 10,
    font,
    color: INK,
  });
  page.drawText(order.order_total != null ? money(order.order_total, order.currency) : "-", {
    x: cols.total,
    y,
    size: 10,
    font,
    color: INK,
  });
  y -= 20;
  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: LINE });
  y -= 30;

  page.drawText("Grand total", { x: cols.unit, y, size: 11, font: bold, color: INK });
  page.drawText(order.order_total != null ? money(order.order_total, order.currency) : "To be confirmed", {
    x: cols.total,
    y,
    size: 11,
    font: bold,
    color: ACCENT,
  });

  page.drawText("Prices exclude VAT. Thank you for your business.", {
    x: marginX,
    y: 60,
    size: 9,
    font,
    color: MUTED,
  });

  return doc.save();
}

function drawRow(
  page: import("pdf-lib").PDFPage,
  xLeft: number,
  xRight: number,
  y: number,
  label: string,
  value: string,
  bold: import("pdf-lib").PDFFont,
  font: import("pdf-lib").PDFFont
) {
  page.drawText(label, { x: xLeft, y, size: 10, font: bold, color: MUTED });
  const w = font.widthOfTextAtSize(value, 10);
  page.drawText(value, { x: xRight - w, y, size: 10, font, color: INK });
}

function money(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

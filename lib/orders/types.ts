import type { Phase } from "./phases";

export interface SampleImage {
  url: string;
  label?: string;
}

export interface Order {
  id: string;
  order_number: string;
  tracking_slug: string;
  customer_name: string;
  customer_phone: string;
  customer_company: string | null;
  product_label: string;
  quantity: string;
  unit_price: number | null;
  order_total: number | null;
  currency: string;
  lead_time_days: number | null;
  phase: Phase;
  estimated_delivery: string | null;
  delivered_at: string | null;
  sample_images: SampleImage[];
  source: string;
  notes: string | null;
  failed_verify_attempts: number;
  verify_locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderEventType =
  | "created"
  | "phase_change"
  | "customer_approved"
  | "customer_requested_changes"
  | "note"
  | "reminder_sent";

export type OrderEventActor = "system" | "staff" | "customer";

export interface OrderEvent {
  id: string;
  order_id: string;
  type: OrderEventType;
  phase: Phase | null;
  actor: OrderEventActor;
  message: string | null;
  created_at: string;
}

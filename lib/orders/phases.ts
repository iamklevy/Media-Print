export type Phase =
  | "order_confirmed"
  | "artwork_pre_press"
  | "artwork_approved"
  | "sample_produced"
  | "sample_approved"
  | "plates_tooling"
  | "printing"
  | "finishing_die_cut"
  | "quality_check"
  | "packed"
  | "out_for_delivery"
  | "delivered";

export interface PhaseDef {
  key: Phase;
  label: string;
  /** Order sits here until the customer approves or requests changes. */
  gate: boolean;
}

/** Single source of truth: order, labels, and gate flags for the 12-step pipeline. */
export const PHASES: PhaseDef[] = [
  { key: "order_confirmed", label: "Order confirmed", gate: false },
  { key: "artwork_pre_press", label: "Artwork & pre-press", gate: false },
  { key: "artwork_approved", label: "Artwork approved", gate: true },
  { key: "sample_produced", label: "Sample produced", gate: false },
  { key: "sample_approved", label: "Sample approved", gate: true },
  { key: "plates_tooling", label: "Plates & tooling", gate: false },
  { key: "printing", label: "Printing", gate: false },
  { key: "finishing_die_cut", label: "Finishing & die-cut", gate: false },
  { key: "quality_check", label: "Quality check", gate: false },
  { key: "packed", label: "Packed", gate: false },
  { key: "out_for_delivery", label: "Out for delivery", gate: false },
  { key: "delivered", label: "Delivered", gate: false },
];

export const PHASE_ORDER: Phase[] = PHASES.map((p) => p.key);

export const GATE_PHASES: Phase[] = PHASES.filter((p) => p.gate).map((p) => p.key);

export function isGatePhase(phase: Phase): boolean {
  return GATE_PHASES.includes(phase);
}

export function phaseLabel(phase: Phase): string {
  return PHASES.find((p) => p.key === phase)?.label ?? phase;
}

export function phaseIndex(phase: Phase): number {
  return PHASE_ORDER.indexOf(phase);
}

/** Next phase in the pipeline, or null if already delivered. */
export function nextPhase(phase: Phase): Phase | null {
  const i = phaseIndex(phase);
  return i >= 0 && i < PHASE_ORDER.length - 1 ? PHASE_ORDER[i + 1] : null;
}

/**
 * Where a "request changes" action sends a gate phase back to: the
 * pre-press/sample step immediately before it, for staff to redo.
 */
export function prevNonGatePhase(phase: Phase): Phase {
  const i = phaseIndex(phase);
  for (let j = i - 1; j >= 0; j--) {
    if (!PHASES[j].gate) return PHASE_ORDER[j];
  }
  return PHASE_ORDER[0];
}

export const KANBAN_COLUMNS = [
  { title: "Pre-press", phases: ["order_confirmed", "artwork_pre_press", "artwork_approved"] as Phase[] },
  { title: "Sample", phases: ["sample_produced", "sample_approved"] as Phase[] },
  { title: "Printing", phases: ["plates_tooling", "printing"] as Phase[] },
  { title: "Finishing", phases: ["finishing_die_cut", "quality_check"] as Phase[] },
  { title: "Dispatch", phases: ["packed", "out_for_delivery", "delivered"] as Phase[] },
];

export function columnForPhase(phase: Phase): string {
  return KANBAN_COLUMNS.find((c) => c.phases.includes(phase))?.title ?? "Pre-press";
}

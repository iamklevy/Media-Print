/**
 * One button size and shape for the whole ops dashboard (board, order sheet,
 * confirm dialogs, login pages). Pass these as `className` on <Button> or
 * the AlertDialog buttons — Button merges classes with tailwind-merge, so
 * they override whatever its `size` variant set. Colours stay per button;
 * the tones below cover the shared ones.
 */
export const OPS_BUTTON =
  "h-8 gap-1.5 rounded-full px-3.5 text-[0.78rem] font-semibold [&_svg:not([class*='size-'])]:size-3.5";

/** Icon-only buttons: same height as OPS_BUTTON, as a circle. */
export const OPS_ICON_BUTTON = "size-8 rounded-full p-0 [&_svg:not([class*='size-'])]:size-3.5";

/** Neutral grey pill (e.g. "Cancel order", dialog dismiss buttons). */
export const OPS_TONE_NEUTRAL = "border-0 bg-[#ebebeb] text-ink hover:bg-[#e0e0e0] hover:text-ink";

/** Solid red pill for destructive actions (e.g. "Delete order"). */
export const OPS_TONE_DANGER =
  "border-0 bg-linear-to-b from-[#e3352f] to-[#d8211a] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_4px_12px_-3px_rgb(216_33_26/0.55)] hover:from-[#d92c26] hover:to-[#c41c16] hover:text-white focus-visible:ring-[#d8211a]/30";

/** Compact variant for the order sheet's header row (copy link, WhatsApp, cancel, delete). */
export const OPS_BUTTON_SM =
  "h-6.5 gap-1 rounded-full px-2.5 text-[0.72rem] font-semibold [&_svg:not([class*='size-'])]:size-3";

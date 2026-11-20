/**
 * The public site's two button looks, taken from the homepage hero:
 * a solid berry pill for the main action, and a frosted-glass pill beside it.
 * (The berry comes from the warm theme's accent — see .theme-warm in globals.css.)
 */
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-accent px-6 py-3 text-[0.92rem] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(139,51,67,0.6)] transition-colors hover:bg-[#a33e51] disabled:pointer-events-none disabled:opacity-60";

export const btnQuiet =
  "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/50 px-6 py-3 text-[0.92rem] font-semibold text-ink backdrop-blur-md transition-colors hover:border-ink/30 hover:bg-white/80";

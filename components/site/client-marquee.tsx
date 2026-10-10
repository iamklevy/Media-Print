import { CLIENTS } from "@/content/products";
import { cn } from "@/lib/utils";

type Client = (typeof CLIENTS)[number]["names"][number];

const ROWS = 3;
/** bump when files in public/clients are replaced, so browsers drop cached copies */
const LOGO_VERSION = 2;
/** seconds per loop, per row — slightly different so the rows never sync up */
const SPEEDS = [48, 56, 44];

/**
 * "Trusted by" logo marquee: every client, dealt round-robin into three rows
 * (so each row mixes industries), drifting in alternating directions and
 * faded out at both edges. Each row renders its list twice and slides by
 * exactly -50%, so the loop is seamless. Hovering a row pauses it; with
 * reduced motion the rows sit still and scroll sideways instead.
 */
export function ClientMarquee() {
  const all = CLIENTS.flatMap((g) => g.names);
  const rows: Client[][] = Array.from({ length: ROWS }, () => []);
  all.forEach((c, i) => rows[i % ROWS].push(c));

  return (
    // logos don't read in a direction, so the track is pinned LTR — that keeps
    // the -50% loop maths identical in Arabic
    <div
      dir="ltr"
      className="mx-[calc(50%-50vw)] grid gap-2.5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
    >
      {rows.map((row, r) => (
        <div key={r} className="group overflow-hidden motion-reduce:overflow-x-auto">
          <ul
            style={{ animationDuration: `${SPEEDS[r]}s` }}
            className={cn(
              "flex w-max animate-[marquee_48s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none",
              r % 2 === 1 && "[animation-direction:reverse]",
            )}
          >
            {[...row, ...row].map((c, i) => (
              <li key={`${c.name}-${i}`} aria-hidden={i >= row.length || undefined} className="pr-2.5">
                <Tile client={c} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Bare logo, flattened to white so every mark reads on the dark band.
 * On hover a white pill fades in behind it and the logo shows its real
 * colours — the pill keeps dark marks (Capixy, nuit…) visible. darkPlate
 * logos are already white, and keepColor ones are too detailed to flatten,
 * so both stay as they are, just brightening on hover.
 */
function Tile({ client: c }: { client: Client }) {
  return (
    <span
      className={cn(
        "group/tile grid h-12 w-[132px] place-items-center rounded-full px-5 transition-colors duration-300 sm:h-14 sm:w-[160px] sm:px-6",
        !c.darkPlate && !c.keepColor && "hover:bg-white",
      )}
    >
      {c.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny static logos, no optimizer needed (and it can't serve the .svg)
        <img
          src={`${c.logo}?v=${LOGO_VERSION}`}
          alt={c.name}
          loading="lazy"
          className={cn(
            "max-h-7 w-auto max-w-full object-contain opacity-75 transition-[filter,opacity] duration-300 group-hover/tile:opacity-100 sm:max-h-8",
            !c.darkPlate && !c.keepColor && "brightness-0 invert group-hover/tile:filter-none",
          )}
        />
      ) : (
        <span className="text-[0.92rem] font-extrabold tracking-tight text-white/75 transition-colors duration-300 group-hover/tile:text-ink">
          {c.name}
        </span>
      )}
    </span>
  );
}

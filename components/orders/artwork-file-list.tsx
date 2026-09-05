import { FileText, Image as ImageIcon, FileArchive, Paperclip, Download } from "lucide-react";

import type { ArtworkFile } from "@/lib/orders/types";

const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;
const DOC_EXT = /\.(pdf|ai|eps|svg)$/i;
const ARCHIVE_EXT = /\.(zip)$/i;

function iconFor(name: string) {
  if (IMAGE_EXT.test(name)) return ImageIcon;
  if (DOC_EXT.test(name)) return FileText;
  if (ARCHIVE_EXT.test(name)) return FileArchive;
  return Paperclip;
}

/** Read-only list of customer-submitted design files — shown on the ops order sheet and the tracking page. */
export function ArtworkFileList({ label, hint, files }: { label: string; hint?: string; files: ArtworkFile[] }) {
  const items = files.filter((f) => f.url);
  if (items.length === 0) return null;

  return (
    <div className="grid min-w-0 gap-1.5">
      <p className="text-[0.88rem] font-semibold text-ink">{label}</p>
      {hint && <p className="text-xs text-faint">{hint}</p>}
      <ul className="grid min-w-0 gap-1.5">
        {items.map((file, i) => {
          const name = file.label ?? file.url.split("/").pop() ?? `File ${i + 1}`;
          const Icon = iconFor(name);
          return (
            <li key={`${file.url}-${i}`} className="min-w-0">
              <a
                href={file.url}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 rounded-md border border-line bg-paper-2 px-2.5 py-1.5 text-[0.85rem] text-ink/80 hover:border-accent"
              >
                <Icon className="size-4 shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <Download className="size-3.5 shrink-0 text-faint" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

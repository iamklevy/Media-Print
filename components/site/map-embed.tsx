import { cn } from "@/lib/utils";

/** Google Maps pin for the workshop. `className` sizes and rounds the frame (default: 320px tall). */
export function MapEmbed({ title, className }: { title: string; className?: string }) {
  return (
    <div className={cn("flex min-h-[320px] overflow-hidden rounded-[20px]", className)}>
      <iframe
        src="https://maps.google.com/maps?cid=1886169677804910620&z=17&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        className="block w-full flex-1 border-0"
      />
    </div>
  );
}

export function MapEmbed({ title }: { title: string }) {
  return (
    <div className="min-h-[320px] overflow-hidden rounded-card border border-line">
      <iframe
        src="https://maps.google.com/maps?cid=1886169677804910620&z=17&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        className="block h-full min-h-[320px] w-full border-0"
      />
    </div>
  );
}

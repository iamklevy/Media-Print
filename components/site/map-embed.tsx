export function MapEmbed({ title }: { title: string }) {
  return (
    <div className="min-h-[320px] overflow-hidden rounded-card border border-line">
      <iframe
        src="https://maps.google.com/maps?q=323%20Sudan%20Street%20Mohandessin%20Giza%20Egypt&z=15&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        className="block h-full min-h-[320px] w-full border-0"
      />
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */

/**
 * Plain <img> for admin previews. Admin image URLs are arbitrary/external and
 * aren't whitelisted for next/image, so we use a native img with a file-level
 * lint exception rather than scattered per-line disables.
 */
export function AdminImage({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={className} />;
}

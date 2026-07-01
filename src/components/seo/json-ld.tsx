/**
 * Renders a JSON-LD <script> for structured data. Server component — the
 * object is serialized at render time. `<` is escaped to prevent breaking
 * out of the script tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

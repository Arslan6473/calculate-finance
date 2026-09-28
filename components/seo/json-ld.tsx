/**
 * Renders a JSON-LD `<script>` tag. `JSON.stringify` does not sanitize
 * against XSS, so `<` is escaped to its unicode equivalent per the Next.js
 * JSON-LD guide before it reaches the DOM.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
